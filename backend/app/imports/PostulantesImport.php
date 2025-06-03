<?php

namespace App\Imports;

use App\Models\Registro;

use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;

use App\Models\Grado;
use App\Models\Area;
use App\Models\CampoPostulante;
use App\Models\Inscripcion;
use App\Models\NivelCategoria;
use App\Models\OpcionInscripcion;
use App\Models\CampoTutor;
use App\Models\DatoPostulante;
use App\Models\DatoTutor;
use App\Models\OlimpiadaCampoPostulante;
use App\Models\Tutor;
use App\Models\RolTutor;
use App\Models\RegistroTutor;
use App\Models\Postulante;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;
use App\Models\OlimpiadaCampoTutor;
use App\Models\Persona;
use App\Models\OpcionIncripcion;
use App\Models\ListaInscripcion;


class PostulantesImport implements ToCollection, WithHeadingRow, WithBatchInserts
{
    protected $idOlimpiada;
    protected $idEncargado;
    protected $idListaInscripcion;


    // Precargar datos
    protected $areas;
    protected $categorias;
    protected $grados;
    protected $roles;
    protected $camposPostulante;
    protected $camposTutor;
    protected $olimpiadaCamposTutor;
    protected $olimpiadaCamposPostulante;
    protected $opcionesInscripcion;

    public function __construct($idOlimpiada, $idEncargado, $idListaInscripcion = null)
    {
        $this->idOlimpiada = $idOlimpiada;
        $this->idEncargado = $idEncargado;
        $this->idListaInscripcion = $idListaInscripcion;

        // Precarga y normalización de catálogos
        $this->areas = Area::all()->keyBy(fn($a) => $this->limpiarTexto($a->nombre));
        $this->categorias = NivelCategoria::all()->keyBy(fn($c) => $this->limpiarTexto($c->nombre));
        $this->grados = Grado::all()->keyBy(fn($g) => $this->limpiarTexto($g->nombre));
        $this->roles = RolTutor::all()->keyBy(fn($r) => $this->limpiarTexto($r->nombre));
        $this->camposPostulante = CampoPostulante::all()->keyBy(fn($c) => $this->limpiarTexto($c->nombre));
        $this->camposTutor = CampoTutor::all()->keyBy(fn($c) => $this->normalizarNombreCampo($c->nombre));
        $this->olimpiadaCamposTutor = OlimpiadaCampoTutor::where('id_olimpiada', $idOlimpiada)->get()->keyBy(function ($c) {
            return $this->normalizarNombreCampo($c->campoTutor->nombre ?? '');
        });

        $this->olimpiadaCamposPostulante = OlimpiadaCampoPostulante::where('id_olimpiada', $idOlimpiada)->get()->keyBy('id_campo_postulante');


        $this->opcionesInscripcion = OpcionInscripcion::where('id_olimpiada', $idOlimpiada)->get();
    }


    public function collection(Collection $rows)
    {
        set_time_limit(300);
        $errores = [];

        DB::transaction(function () use ($rows, &$errores) {
            foreach ($rows as $index => $row) {
                $fila = $this->normalizarFila($row->toArray());
                if ($this->filaVacia($fila)) continue;

                $erroresFila = $this->validarFilaCompleta($fila);

                if (empty($erroresFila)) {
                    try {
                        $idRegistro = $this->procesarFila($fila);
                        $this->procesarTutores($fila, $idRegistro);
                    } catch (\Exception $e) {
                        $erroresFila[] = $e->getMessage();
                    }
                }

                if (!empty($erroresFila)) {
                    $errores["Fila " . ($index + 2)] = implode(' | ', $erroresFila);
                }
            }
        });

        if (!empty($errores)) {
            throw new \Exception(json_encode([
                'message' => 'Errores encontrados en el archivo.',
                'errors' => $errores
            ]));
        }
    }



    private function validarFilaCompleta($fila)
    {
        $errores = [];

        // Validar postulante
        foreach (['ci', 'nombres', 'apellidos', 'fecha_nacimiento'] as $campo) {
            if (empty($fila[$campo])) {
                $errores[] = "El campo '$campo' está vacío o el encabezado del documento no es correcto.";
            }
            // Validar caracteres especiales en CI del postulante
            if ($campo === 'ci' && !empty($fila[$campo]) && !preg_match('/^[a-zA-Z0-9\-]+$/', $fila[$campo])) {
                preg_match('/[^a-zA-Z0-9\-]/', $fila[$campo], $noPermitido);
                $caracter = $noPermitido[0] ?? '?';
                $errores[] = "El campo 'ci' contiene el carácter no permitido: '$caracter'.";
            }
        }
        // Validar campos obligatorios de postulante
        foreach ($this->olimpiadaCamposPostulante as $campo) {
            if ($campo->esObligatorio) {
                $nombre = $this->normalizarCampoExcel($campo->campo_postulante->nombre);
                Log::info("Validando campo obligatorio", [
                    'campo_original' => $campo->campo_postulante->nombre,
                    'campo_normalizado' => $nombre,
                    'valor_en_fila' => $fila[$nombre] ?? null,
                    'fila_completa' => $fila
                ]);
                if (empty($fila[$nombre])) {
                    $errores[] = "El campo obligatorioee '{$campo->campo_postulante->nombre}' está vacío.";
                }
            }
        }

        // Validar tutores (solo existencia de datos básicos)
        if (!empty($fila['ci_tutor']) || !empty($fila['nombre_tutor']) || !empty($fila['apellidos_tutor'])) {
            foreach (['ci_tutor', 'nombre_tutor', 'apellidos_tutor'] as $campo) {
                if (empty($fila[$campo])) {
                    $errores[] = "El campo '$campo' del tutor está vacío.";
                }
                // Validar caracteres especiales en CI de tutor
                if ($campo === 'ci_tutor' && !empty($fila[$campo]) && !preg_match('/^[a-zA-Z0-9\-]+$/', $fila[$campo])) {
                    preg_match('/[^a-zA-Z0-9\-]/', $fila[$campo], $noPermitido);
                    $caracter = $noPermitido[0] ?? '?';
                    $errores[] = "El campo 'ci_tutor' del tutor contiene el carácter no permitido: '$caracter'.";
                }
            }
        }
        return $errores;
    }







    private function normalizarFila($fila)
    {
        $normalizada = [];
        foreach ($fila as $campo => $valor) {
            $normalizada[$this->normalizarCampoExcel($campo)] = $valor;
        }
        return $normalizada;
    }

    private function filaVacia($fila)
    {
        return empty(array_filter($fila, fn($v) => !is_null($v) && $v !== ''));
    }






    private function procesarFila($fila)
    {
        $erroresFila = [];

        // Validar campos obligatorios
        foreach (['ci', 'nombres', 'apellidos', 'fecha_nacimiento'] as $campo) {
            if (empty($fila[$campo])) {
                $erroresFila[] = "El campo '$campo' está vacío.";
            }
        }

        $ci = $fila['ci'] ?? null;
        $nombres = $fila['nombres'] ?? null;
        $apellidos = $fila['apellidos'] ?? null;
        $fechaNacimiento = $fila['fecha_nacimiento'] ?? null;

        // Validar formato de fecha
        if ($fechaNacimiento) {
            try {
                if (is_numeric($fechaNacimiento)) {
                    $fechaNacimiento = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($fechaNacimiento)->format('Y-m-d');
                } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaNacimiento)) {
                    $erroresFila[] = "La fecha de nacimiento no tiene el formato aaaa-mm-dd.";
                }
            } catch (\Exception $e) {
                $erroresFila[] = "Error al procesar la fecha de nacimiento: " . $e->getMessage();
            }
        }

        if (!empty($erroresFila)) {
            throw new \Exception(implode(' | ', $erroresFila));
        }

        // --- CREAR O BUSCAR PERSONA ---
        try {
            $persona = Persona::firstOrCreate(
                ['ci' => $ci],
                ['nombres' => $nombres, 'apellidos' => $apellidos, 'fecha_nacimiento' => $fechaNacimiento]
            );
        } catch (\Exception $e) {
            $erroresFila[] = "Error al crear persona: " . $e->getMessage();
        }

        // --- CREAR O BUSCAR POSTULANTE ---
        try {
            $postulante = Postulante::firstOrCreate(['id_persona' => $persona->id]);
        } catch (\Exception $e) {
            $erroresFila[] = "Error al crear postulante: " . $e->getMessage();
        }

        // Insertar datos del postulante
        try {
            $this->insertarDatosPostulante($fila, $postulante->id);
        } catch (\Exception $e) {
            $erroresFila[] = $e->getMessage();
        }

        // Insertar registro e inscripción
        try {
            return $this->insertarRegistroEInscripcion($fila, $postulante->id);
        } catch (\Exception $e) {
            $erroresFila[] = $e->getMessage();
        }

        if (!empty($erroresFila)) {
            throw new \Exception(implode(' | ', $erroresFila));
        }
    }




    private function insertarDatosPostulante($fila, $idPostulante)
    {
        $errores = [];

        $camposObligatorios = $this->olimpiadaCamposPostulante->filter(fn($c) => $c->esObligatorio)
            ->map(fn($c) => $c->campo_postulante->nombre)
            ->toArray();

        foreach ($camposObligatorios as $campoObligatorio) {
            $campoNormalizado = $this->normalizarCampoExcel($campoObligatorio);
            if (!array_key_exists($campoNormalizado, $fila) || empty($fila[$campoNormalizado])) {
                $errores[] = "El campo obligatorio '$campoObligatorio' es requerido para esta olimpiada y no está presente o está vacío en el Excel.";
            }
        }

        $datosParaInsertar = [];
        $clavesParaBuscar = [];

        foreach ($fila as $campo => $valor) {
            if (is_null($valor) || $valor === '' || preg_match('/_(papa|mama|profesor)$/i', $campo)) {
                continue;
            }

            $campoNormalizado = $this->limpiarTexto($campo);
            $campoPostulanteId = $this->camposPostulante[$campoNormalizado]->id ?? null;
            if (!$campoPostulanteId) {
                continue;
            }
            $olimpiadaCampoPostulante = $this->olimpiadaCamposPostulante[$campoPostulanteId] ?? null;
            if (!$olimpiadaCampoPostulante) {
                $errores[] = "El campo '$campo' no está habilitado para esta olimpiada.";
                continue;
            }

            if ($olimpiadaCampoPostulante->esObligatorio && empty($valor)) {
                $errores[] = "El campo '$campo' es obligatorio para esta olimpiada y no puede estar vacío.";
            }

            $clavesParaBuscar[] = [
                'id_postulante' => $idPostulante,
                'id_olimpiada_campo_postulante' => $olimpiadaCampoPostulante->id,
            ];

            $datosParaInsertar[] = [
                'id_postulante' => $idPostulante,
                'id_olimpiada_campo_postulante' => $olimpiadaCampoPostulante->id,
                'valor' => $valor,
            ];
        }

        if (!empty($clavesParaBuscar)) {
            $existentes = DatoPostulante::where(function ($query) use ($clavesParaBuscar) {
                foreach ($clavesParaBuscar as $clave) {
                    $query->orWhere(function ($q) use ($clave) {
                        $q->where('id_postulante', $clave['id_postulante'])
                            ->where('id_olimpiada_campo_postulante', $clave['id_olimpiada_campo_postulante']);
                    });
                }
            })->get()->map(function ($item) {
                return $item->id_postulante . '-' . $item->id_olimpiada_campo_postulante;
            })->toArray();

            $datosParaInsertar = array_filter($datosParaInsertar, function ($dato) use ($existentes) {
                $clave = $dato['id_postulante'] . '-' . $dato['id_olimpiada_campo_postulante'];
                return !in_array($clave, $existentes);
            });
        }

        if (!empty($errores)) {
            throw new \Exception(implode(' | ', $errores));
        }

        if (!empty($datosParaInsertar)) {
            DatoPostulante::insert($datosParaInsertar);
        }
    }


    private function obtenerRolesEnExcel($fila)
    {
        $rolesEnExcel = [];
        foreach (array_keys($fila) as $campo) {
            if (preg_match('/^ci([a-z]+)/i', $campo, $matches)) {
                $rol = $this->limpiarTexto($matches[1]);
                $rolesEnExcel[$rol] = true;
            }
        }
        return array_keys($rolesEnExcel);
    }





    private function procesarTutores($fila, $idRegistro)
    {
        Log::info('--- INICIO procesarTutores ---', [
            'fila' => $fila,
            'idRegistro' => $idRegistro,
        ]);

        $ciTutor = $fila['ci_tutor'] ?? null;
        $nombresTutor = $fila['nombre_tutor'] ?? null;
        $apellidosTutor = $fila['apellidos_tutor'] ?? null;
        $parentesco = $fila['parentesco'] ?? null;

        Log::info('Datos básicos tutor', [
            'ciTutor' => $ciTutor,
            'nombresTutor' => $nombresTutor,
            'apellidosTutor' => $apellidosTutor,
            'parentesco' => $parentesco,
        ]);

        if ($ciTutor && $nombresTutor && $apellidosTutor && $parentesco) {
            $parentescoNormalizado = $this->limpiarTexto($parentesco);
            Log::info('Parentesco normalizado', [
                'parentescoNormalizado' => $parentescoNormalizado,
                'roles_keys' => $this->roles->keys(),
            ]);
            $rolTutor = $this->roles->get($parentescoNormalizado);

            Log::info('RolTutor encontrado', [
                'rolTutor' => $rolTutor,
            ]);

            if (!$rolTutor) {
                Log::error("El parentesco/rol '$parentesco' no existe en la base de datos.", [
                    'parentescoNormalizado' => $parentescoNormalizado,
                    'roles_disponibles' => $this->roles->keys(),
                ]);
                throw new \Exception("El parentesco/rol '$parentesco' no existe en la base de datos.");
            }

            $personaTutor = Persona::firstOrCreate(
                ['ci' => $ciTutor],
                [
                    'nombres' => $nombresTutor,
                    'apellidos' => $apellidosTutor,
                    'fecha_nacimiento' => $fila['fecha_nacimiento_tutor'] ?? null
                ]
            );
            Log::info('Persona tutor creada o encontrada', [
                'personaTutor' => $personaTutor
            ]);

            $tutor = Tutor::firstOrCreate(['id_persona' => $personaTutor->id]);
            Log::info('Tutor creado o encontrado', [
                'tutor' => $tutor
            ]);

            $nombreRol = $rolTutor->nombre;

            $this->insertarDatosTutor($fila, $tutor->id, $nombreRol);

            $registroTutor = RegistroTutor::firstOrCreate([
                'id_registro' => $idRegistro,
                'id_tutor' => $tutor->id,
                'id_rol_tutor' => $rolTutor->id,
            ]);
            Log::info('RegistroTutor creado o encontrado', [
                'registroTutor' => $registroTutor
            ]);
        } else {
            Log::error('Faltan datos obligatorios del tutor', [
                'ciTutor' => $ciTutor,
                'nombresTutor' => $nombresTutor,
                'apellidosTutor' => $apellidosTutor,
                'parentesco' => $parentesco,
            ]);
            throw new \Exception("Faltan datos obligatorios del tutor (CI, nombre, apellido o parentesco).");
        }
    }

    private function normalizarNombreCampo($nombre)
    {
        // Quitar tildes y convertir a minúsculas
        $nombre = mb_strtolower($nombre);
        $nombre = strtr($nombre, [
            'á' => 'a',
            'é' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ú' => 'u',
            'ñ' => 'n'
        ]);
        // Reemplazar espacios y guiones por guion bajo
        $nombre = preg_replace('/[\s\-]+/', '_', $nombre);
        // Quitar paréntesis y su contenido
        $nombre = preg_replace('/\(.+\)/', '', $nombre);
        // Quitar sufijo _tutor SOLO para comparar con campos de tutor
        $nombre = preg_replace('/_tutor$/', '', $nombre);
        // Quitar cualquier otro carácter especial
        $nombre = preg_replace('/[^a-z0-9_]/', '', $nombre);
        // Quitar guiones bajos al principio o final
        $nombre = trim($nombre, '_');
        return $nombre;
    }



    private function insertarDatosTutor($filaNormalizada, $idTutor, $nombreRol)
    {
        Log::info('--- INICIO insertarDatosTutor ---', [
            'filaNormalizada' => $filaNormalizada,
            'idTutor' => $idTutor,
            'nombreRol' => $nombreRol,
            'olimpiadaCamposTutor_keys' => $this->olimpiadaCamposTutor->keys(),
            'camposTutor_keys' => $this->camposTutor->keys(),
        ]);
        $errores = [];

        // 1. Agrupar por campo normalizado y tomar el primer valor no vacío
        $camposUnicos = [];
        foreach ($filaNormalizada as $campo => $valor) {
            $campoNormalizado = $this->normalizarNombreCampo($campo);
            if (!isset($camposUnicos[$campoNormalizado]) && $valor !== null && $valor !== '') {
                $camposUnicos[$campoNormalizado] = $valor;
            }
        }

        // 2. Validar obligatorios
        $camposObligatorios = $this->olimpiadaCamposTutor
            ->filter(fn($c) => $c->esObligatorio && $c->campoTutor)
            ->map(fn($c) => $this->normalizarNombreCampo($c->campoTutor->nombre))
            ->toArray();

        foreach ($camposObligatorios as $campoObligatorio) {
            if (!array_key_exists($campoObligatorio, $camposUnicos) || empty($camposUnicos[$campoObligatorio])) {
                $errores[] = "El campo obligatorio '$campoObligatorio' es requerido para tutores en esta olimpiada y no está presente o está vacío en el Excel.";
            }
        }

        // 3. Preparar datos para insertar
        $datosParaInsertar = [];
        $clavesParaBuscar = [];

        foreach ($camposUnicos as $campoNormalizado => $valor) {
            $campoTutorId = $this->campo_tutor[$campoNormalizado]->id ?? null;
            if (!$campoTutorId) {
                continue;
            }
            $olimpiadaCampoTutor = $this->olimpiadaCamposTutor[$campoTutorId] ?? null;
            if (!$olimpiadaCampoTutor) {
                $errores[] = "El campo '$campoNormalizado' no está habilitado para tutores en esta olimpiada.";
                continue;
            }
            if ($olimpiadaCampoTutor->esObligatorio && empty($valor)) {
                $errores[] = "El campo '$campoNormalizado' es obligatorio para tutores en esta olimpiada y no puede estar vacío.";
            }
            $clavesParaBuscar[] = [
                'id_tutor' => $idTutor,
                'id_olimpiada_campo_tutor' => $olimpiadaCampoTutor->id,
            ];
            $datosParaInsertar[] = [
                'id_tutor' => $idTutor,
                'id_olimpiada_campo_tutor' => $olimpiadaCampoTutor->id,
                'valor' => $valor,
            ];
        }

        // 4. Filtrar duplicados ya existentes
        if (!empty($clavesParaBuscar)) {
            $existentes = DatoTutor::where(function ($query) use ($clavesParaBuscar) {
                foreach ($clavesParaBuscar as $clave) {
                    $query->orWhere(function ($q) use ($clave) {
                        $q->where('id_tutor', $clave['id_tutor'])
                            ->where('id_olimpiada_campo_tutor', $clave['id_olimpiada_campo_tutor']);
                    });
                }
            })->get()->map(function ($item) {
                return $item->id_tutor . '-' . $item->id_olimpiada_campo_tutor;
            })->toArray();

            $datosParaInsertar = array_filter($datosParaInsertar, function ($dato) use ($existentes) {
                $clave = $dato['id_tutor'] . '-' . $dato['id_olimpiada_campo_tutor'];
                return !in_array($clave, $existentes);
            });
        }

        // 5. Lanzar errores si hay
        if (!empty($errores)) {
            Log::error('Errores al insertar datos tutor', [
                'errores' => $errores
            ]);
            throw new \Exception(implode(' | ', $errores));
        }

        // 6. Insertar datos
        if (!empty($datosParaInsertar)) {
            Log::info('Insertando datos en DatoTutor', [
                'datosParaInsertar' => $datosParaInsertar
            ]);
            DatoTutor::insert($datosParaInsertar);
        }
        Log::info('--- FIN insertarDatosTutor ---');
    }








    private function insertarRegistroEInscripcion($fila, $idPostulante)
    {
        $errores = [];

        if (empty($fila['grado'])) {
            $errores[] = "El campo 'grado' está vacío en la fila.";
        }

        $nombreGrado = $this->limpiarTexto($fila['grado'] ?? '');
        $idGrado = $this->grados[$nombreGrado]->id ?? null;
        if (!$idGrado) {
            $errores[] = "El grado '{$fila['grado']}' no existe o no está habilitado para esta olimpiada.";
        }

        $nombreArea = $this->limpiarTexto($fila['area'] ?? '');
        $idArea = $this->areas[$nombreArea]->id ?? null;
        if (!$idArea) {
            $errores[] = "El área '{$fila['area']}' no existe o no está habilitada para esta olimpiada.";
        }

        $nombreCategoria = $this->limpiarTexto($fila['nivel_categoria'] ?? '');
        $idCategoria = $this->categorias[$nombreCategoria]->id ?? null;
        if (!$idCategoria) {
            $errores[] = "La categoría '{$fila['nivel_categoria']}' no existe o no está habilitada para esta olimpiada.";
        }

        // Validar máximo de áreas por olimpiada
        $olimpiada = \App\Models\Olimpiada::find($this->idOlimpiada);
        if ($olimpiada && $olimpiada->max_areas) {
            $inscripcionesActuales = \App\Models\Inscripcion::whereHas('registro', function ($q) use ($idPostulante) {
                $q->where('id_postulante', $idPostulante)
                    ->where('id_olimpiada', $this->idOlimpiada);
            })->count();

            if ($inscripcionesActuales >= $olimpiada->max_areas) {
                $errores[] = "El postulante ya está inscrito en el máximo de áreas permitidas ({$olimpiada->max_areas}) para esta olimpiada.";
            }
        }

        // Si hubo errores de validación, lánzalos todos juntos
        if (!empty($errores)) {
            throw new \Exception(implode(' | ', $errores));
        }

        // --- VALIDACIÓN DE DUPLICADOS ---
        // Buscar registro existente para este postulante, olimpiada y grado
        $registroExistente = Registro::where('id_postulante', $idPostulante)
            ->where('id_olimpiada', $this->idOlimpiada)
            ->where('id_grado', $idGrado)
            ->first();

        if ($registroExistente) {
            // Buscar inscripción existente para este registro, área y categoría
            $inscripcionExistente = Inscripcion::where('id_registro', $registroExistente->id)
                ->whereHas('opcionInscripcion', function ($q) use ($idArea, $idCategoria) {
                    $q->where('id_area', $idArea)
                        ->where('id_nivel_categoria', $idCategoria);
                })
                ->first();

            if ($inscripcionExistente) {
                throw new \Exception("Registro duplicado: El postulante '{$fila['nombres']} {$fila['apellidos']}' con CI '{$fila['ci']}' ya está inscrito en el área '{$fila['area']}' y categoría '{$fila['nivel_categoria']}'. Este registro fue omitido.");
            }
        }

        // Crear o buscar el registro
        $registro = Registro::firstOrCreate([
            'id_postulante' => $idPostulante,
            'id_olimpiada' => $this->idOlimpiada,
            'id_encargado' => $this->idEncargado,
            'id_grado' => $idGrado,
        ]);

        $opcion = $this->opcionesInscripcion->first(function ($o) use ($idArea, $idCategoria) {
            return $o->id_area == $idArea && $o->id_nivel_categoria == $idCategoria;
        });

        if (!$opcion) {
            throw new \Exception("No existe una opción de inscripción para el grado '{$fila['grado']}', área '{$fila['area']}' y categoría '{$fila['nivel_categoria']}' en esta olimpiada.");
        }

        Inscripcion::firstOrCreate([
            'id_registro' => $registro->id,
            'id_opcion_inscripcion' => $opcion->id,
            'id_lista_inscripcion' => $this->idListaInscripcion,
        ]);

        return $registro->id;
    }


    private function limpiarTexto($texto)
    {
        $texto = mb_strtolower(trim($texto));
        $texto = preg_replace('/\s+/', ' ', $texto);
        $texto = preg_replace('/[\x{00A0}\x{200B}\x{FEFF}]/u', '', $texto);
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);
        $texto = str_replace(["'", "`", "´"], '', $texto);
        return $texto;
    }

    private function normalizarCampoExcel($campo)
    {
        // Quitar tildes y convertir a minúsculas
        $campo = mb_strtolower($campo);
        $campo = strtr($campo, [
            'á' => 'a',
            'é' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ú' => 'u',
            'ñ' => 'n'
        ]);
        // Reemplazar espacios y guiones por guion bajo
        $campo = preg_replace('/[\s\-]+/', '_', $campo);
        // Quitar paréntesis y su contenido, luego agregar _rol si existe
        if (preg_match('/(.+)\((.+)\)/', $campo, $matches)) {
            $base = trim($matches[1], "_ ");
            $rol = trim($matches[2], "_ ");
            $campo = $base . '_' . $rol;
        }
        // Quitar cualquier otro carácter especial
        $campo = preg_replace('/[^a-z0-9_]/', '', $campo);
        return $campo;
    }





    public function batchSize(): int
    {
        return 1000;
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}
