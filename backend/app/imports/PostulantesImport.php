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
        $this->camposTutor = CampoTutor::all()->keyBy(fn($c) => $this->limpiarTexto($c->nombre));
        $this->olimpiadaCamposTutor = OlimpiadaCampoTutor::where('id_olimpiada', $idOlimpiada)->get()->keyBy('id_campo_tutor');
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
                $errores[] = "El campo '$campo' está vacío.";
            }
            // Validar caracteres especiales en CI del postulante
            if ($campo === 'ci' && !empty($fila[$campo]) && !preg_match('/^[a-zA-Z0-9\-]+$/', $fila[$campo])) {
                // Buscar el primer carácter no permitido
                preg_match('/[^a-zA-Z0-9\-]/', $fila[$campo], $noPermitido);
                $caracter = $noPermitido[0] ?? '?';
                $errores[] = "El campo 'ci' contiene el carácter no permitido: '$caracter'.";
            }
        }
        // Validar campos obligatorios de postulante
        foreach ($this->olimpiadaCamposPostulante as $campo) {
            if ($campo->esObligatorio) {
                $nombre = $this->limpiarTexto($campo->campo_postulante->nombre);
                if (empty($fila[$nombre])) {
                    $errores[] = "El campo obligatorio '{$campo->campo_postulante->nombre}' está vacío.";
                }
            }
        }




        // Validar tutores (solo existencia de datos básicos)
        foreach ($this->roles as $rol => $idRol) {
            if (!empty($fila["ci$rol"]) || !empty($fila["nombres$rol"]) || !empty($fila["apellidos$rol"])) {
                foreach (['ci', 'nombres', 'apellidos'] as $campo) {
                    if (empty($fila["{$campo}$rol"])) {
                        $errores[] = "El campo '{$campo}$rol' del tutor '$rol' está vacío.";
                    }
                    // Validar caracteres especiales en CI de tutor
                    if ($campo === 'ci' && !empty($fila["{$campo}$rol"]) && !preg_match('/^[a-zA-Z0-9\-]+$/', $fila["{$campo}$rol"])) {
                        preg_match('/[^a-zA-Z0-9\-]/', $fila["{$campo}$rol"], $noPermitido);
                        $caracter = $noPermitido[0] ?? '?';
                        $errores[] = "El campo 'ci$rol' del tutor '$rol' contiene el carácter no permitido: '$caracter'.";
                    }
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

        // Si hay errores hasta aquí, no continuar con la inserción
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

        // Si hubo errores en cualquier parte, lánzalos todos juntos
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
            $campoNormalizado = $this->limpiarTexto($campoObligatorio);
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

        // Si hubo errores, lánzalos todos juntos
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
        Log::info("Entrando a procesarTutores para registro: $idRegistro");
        $tutoresPorRol = [];

        // Solo los roles presentes en el Excel
        $rolesEnExcel = $this->obtenerRolesEnExcel($fila);
        $rolesNormalizados = collect($this->roles)
            ->only($rolesEnExcel);

        Log::info("Roles detectados en Excel: " . json_encode($rolesNormalizados));

        $erroresTutores = [];

        foreach ($rolesNormalizados as $rol => $idRolTutor) {
            $ciTutor = $fila["ci$rol"] ?? null;
            $nombresTutor = $fila["nombres$rol"] ?? null;
            $apellidosTutor = $fila["apellidos$rol"] ?? null;
            $fechaNacimientoTutor = $fila["fecha_nacimiento$rol"] ?? null;

            Log::info("Intentando extraer tutor: rol=$rol, ci=$ciTutor, nombres=$nombresTutor, apellidos=$apellidosTutor");

            // Validaciones para cada tutor
            $erroresRol = [];
            if (!$ciTutor) {
                $erroresRol[] = "El campo 'ci$rol' del tutor '$rol' está vacío.";
            }
            if (!$nombresTutor) {
                $erroresRol[] = "El campo 'nombres$rol' del tutor '$rol' está vacío.";
            }
            if (!$apellidosTutor) {
                $erroresRol[] = "El campo 'apellidos$rol' del tutor '$rol' está vacío.";
            }

            if ($fechaNacimientoTutor) {
                try {
                    if (is_numeric($fechaNacimientoTutor)) {
                        $fechaNacimientoTutor = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($fechaNacimientoTutor)->format('Y-m-d');
                    } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaNacimientoTutor)) {
                        $erroresRol[] = "La fecha de nacimiento del tutor '$rol' no tiene el formato aaaa-mm-dd.";
                    }
                } catch (\Exception $e) {
                    $erroresRol[] = "Error al procesar la fecha de nacimiento del tutor '$rol': " . $e->getMessage();
                }
            }

            // Si hay errores en los datos básicos, los acumulamos y pasamos al siguiente rol
            if (!empty($erroresRol)) {
                $erroresTutores[] = implode(' ', $erroresRol);
                continue;
            }

            try {
                // Buscar o crear persona para el tutor
                $personaTutor = Persona::firstOrCreate(
                    ['ci' => $ciTutor],
                    [
                        'nombres' => $nombresTutor,
                        'apellidos' => $apellidosTutor,
                        'fecha_nacimiento' => $fechaNacimientoTutor // opcional
                    ]
                );

                // Crear o buscar tutor
                $tutor = Tutor::firstOrCreate(
                    ['id_persona' => $personaTutor->id]
                );
                Log::info("Tutor creado o encontrado: " . json_encode($tutor->toArray()));
            } catch (\Exception $e) {
                $erroresTutores[] = "Error al crear tutor '$rol': " . $e->getMessage();
                continue;
            }

            // Insertar datos del tutor
            try {
                $this->insertarDatosTutor($fila, $tutor->id, $rol);
            } catch (\Exception $e) {
                $erroresTutores[] = "Error en los datos del tutor '$rol': " . $e->getMessage();
            }

            // RegistroTutor
            try {
                $registroTutor = RegistroTutor::firstOrCreate([
                    'id_registro' => $idRegistro,
                    'id_tutor' => $tutor->id,
                    'id_rol_tutor' => $idRolTutor,
                ]);
                Log::info("RegistroTutor creado o encontrado: " . json_encode($registroTutor->toArray()));
                $tutoresPorRol[$rol] = $tutor->id;
            } catch (\Exception $e) {
                $erroresTutores[] = "Error al crear RegistroTutor para el tutor '$rol': " . $e->getMessage();
            }
        }

        if (empty($tutoresPorRol)) {
            Log::error("No se creó ningún tutor. Roles normalizados: " . json_encode($rolesNormalizados));
            Log::error("Fila recibida: " . json_encode($fila));
            $erroresTutores[] = "No se creó ningún tutor para el registro $idRegistro. Revisa los encabezados, los datos y los roles en la base de datos.";
        }

        // Si hubo errores, lánzalos todos juntos
        if (!empty($erroresTutores)) {
            throw new \Exception(implode(' | ', $erroresTutores));
        }

        Log::info("Tutores asociados para registro $idRegistro: " . json_encode($tutoresPorRol));
    }



    private function insertarDatosTutor($filaNormalizada, $idTutor, $rol)
    {
        $errores = [];

        $camposObligatorios = $this->olimpiadaCamposTutor->filter(fn($c) => $c->esObligatorio)
            ->map(fn($c) => $c->campoTutor->nombre)
            ->toArray();

        foreach ($camposObligatorios as $campoObligatorio) {
            $campoNormalizado = $this->limpiarTexto($campoObligatorio);
            $campoExcel1 = "{$campoNormalizado}_{$rol}";
            $campoExcel2 = "{$campoNormalizado}{$rol}";
            $campoExcel3 = str_replace('_', '', $campoExcel1);
            $campoExcel4 = str_replace('_', '', $campoExcel2);

            if (
                (!array_key_exists($campoExcel1, $filaNormalizada) || empty($filaNormalizada[$campoExcel1])) &&
                (!array_key_exists($campoExcel2, $filaNormalizada) || empty($filaNormalizada[$campoExcel2])) &&
                (!array_key_exists($campoExcel3, $filaNormalizada) || empty($filaNormalizada[$campoExcel3])) &&
                (!array_key_exists($campoExcel4, $filaNormalizada) || empty($filaNormalizada[$campoExcel4]))
            ) {
                $errores[] = "El campo obligatorio '$campoObligatorio' es requerido para el tutor '$rol' en esta olimpiada y no está presente o está vacío en el Excel.";
            }
        }

        $datosParaInsertar = [];
        $clavesParaBuscar = [];

        foreach ($filaNormalizada as $campo => $valor) {
            if (
                preg_match('/^(.*)_' . $rol . '$/i', $campo, $matches) ||
                preg_match('/^(.*)' . $rol . '$/i', $campo, $matches)
            ) {
                $campoNombre = $matches[1];
                $campoNombreNormalizado = $this->limpiarTexto($campoNombre);

                if (is_null($valor) || $valor === '') {
                    continue;
                }

                $campoTutorId = $this->camposTutor[$campoNombreNormalizado]->id ?? null;
                if (!$campoTutorId) {
                    continue;
                }

                $olimpiadaCampoTutor = $this->olimpiadaCamposTutor[$campoTutorId] ?? null;
                if (!$olimpiadaCampoTutor) {
                    $errores[] = "El campo '$campoNombre' no está habilitado para el tutor '$rol' en esta olimpiada.";
                    continue;
                }

                if ($olimpiadaCampoTutor->esObligatorio && empty($valor)) {
                    $errores[] = "El campo '$campoNombre' es obligatorio para el tutor '$rol' en esta olimpiada y no puede estar vacío.";
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
        }

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

        // Si hubo errores, lánzalos todos juntos
        if (!empty($errores)) {
            throw new \Exception(implode(' | ', $errores));
        }

        if (!empty($datosParaInsertar)) {
            DatoTutor::insert($datosParaInsertar);
        }
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
