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


class PostulantesImport implements ToCollection, WithHeadingRow, WithBatchInserts
{
    protected $idOlimpiada;
    protected $idEncargado;

    // Precargar datos
    protected $areas;
    protected $categorias;
    protected $grados;
    protected $roles;
    protected $camposPostulante;
    protected $camposTutor;
    protected $olimpiadaCamposTutor;
    protected $olimpiadaCamposPostulante;

    public function __construct($idOlimpiada, $idEncargado)
    {
        $this->idOlimpiada = $idOlimpiada;
        $this->idEncargado = $idEncargado;

        // Precargar y normalizar áreas
        $this->areas = Area::all()->mapWithKeys(function ($area) {
            return [$this->limpiarTexto($area->nombre) => $area->id];
        });

        // Precargar y normalizar categorías
        $this->categorias = NivelCategoria::all()->mapWithKeys(function ($cat) {
            return [$this->limpiarTexto($cat->nombre) => $cat->id];
        });

        // Precargar y normalizar grados
        $this->grados = Grado::all()->mapWithKeys(function ($grado) {
            return [$this->limpiarTexto($grado->nombre) => $grado->id];
        });

        // Precargar y normalizar roles
        $this->roles = RolTutor::all()->mapWithKeys(function ($rol) {
            return [$this->limpiarTexto($rol->nombre) => $rol->id];
        });

        // Precargar y normalizar campos de postulante
        $this->camposPostulante = CampoPostulante::all()->mapWithKeys(function ($campo) {
            return [$this->limpiarTexto($campo->nombre) => $campo->id];
        });

        // Precargar y normalizar campos de tutor
        $this->camposTutor = CampoTutor::all()->mapWithKeys(function ($campo) {
            return [$this->limpiarTexto($campo->nombre) => $campo->id];
        });

        // Precargar y normalizar campos de tutor
        $this->camposTutor = CampoTutor::all()->mapWithKeys(function ($campo) {
            return [$this->limpiarTexto($campo->nombre) => $campo->id];
        });

        // Precargar todos los OlimpiadaCampoTutor en memoria
        $this->olimpiadaCamposTutor = \App\Models\OlimpiadaCampoTutor::where('id_olimpiada', $this->idOlimpiada)
            ->get()
            ->keyBy('id_campo_tutor');


        // Precargar todos los OlimpiadaCampoPostulante en memoria
        $this->olimpiadaCamposPostulante = \App\Models\OlimpiadaCampoPostulante::where('id_olimpiada', $this->idOlimpiada)
            ->get()
            ->keyBy('id_campo_postulante');


        Log::info("Catálogos precargados y normalizados.");
    }


    public function collection(Collection $rows)
    {
        set_time_limit(300); // 5 minutos
        $errores = [];

        DB::transaction(function () use ($rows, &$errores) {
            // Convertir los datos a UTF-8
            $rows = $rows->map(function ($fila) {
                return $fila->map(function ($valor) {
                    return is_string($valor) ? mb_convert_encoding($valor, 'UTF-8', 'auto') : $valor;
                });
            });

            foreach ($rows as $index => $row) {
                try {
                    // ... tu lógica de procesamiento ...
                    $fila = array_map(function ($valor) {
                        return is_numeric($valor) ? (string) $valor : $valor;
                    }, $row->toArray());

                    Log::info("Procesando fila #$index:", $fila);

                    if (empty(array_filter($fila))) {
                        Log::info("Fila #$index vacía, se omite.");
                        continue;
                    }

                    $idRegistro = $this->procesarFila($fila);
                    $this->procesarTutores($fila, $idRegistro);
                    Log::info("Fila #$index procesada correctamente.");
                } catch (\Exception $e) {
                    Log::error("Error en la fila #$index: " . $e->getMessage());
                    // Guarda el error pero NO detiene el proceso
                    $errores["Fila " . ($index + 2)] = $e->getMessage(); // +2 para reflejar la fila real en Excel
                }
            }
        });

        // Si hubo errores, lánzalos todos juntos
        if (!empty($errores)) {
            throw new \Exception(json_encode([
                'message' => 'Errores encontrados en el archivo.',
                'errors' => $errores
            ]));
        }
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

        // Procesar postulante
        try {
            $postulante = Postulante::firstOrCreate(
                ['ci' => $ci],
                ['nombres' => $nombres, 'apellidos' => $apellidos, 'fecha_nacimiento' => $fechaNacimiento]
            );
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

        $camposObligatorios = OlimpiadaCampoPostulante::where('id_olimpiada', $this->idOlimpiada)
            ->where('esObligatorio', true)
            ->with('campoPostulante')
            ->get()
            ->pluck('campoPostulante.nombre')
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
            $campoPostulanteId = $this->camposPostulante[$campoNormalizado] ?? null;
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

            // Si hay errores en los datos básicos, los acumulamos y pasamos al siguiente rol
            if (!empty($erroresRol)) {
                $erroresTutores[] = implode(' ', $erroresRol);
                continue;
            }

            try {
                $tutor = Tutor::firstOrCreate(
                    ['ci' => $ciTutor],
                    ['nombres' => $nombresTutor, 'apellidos' => $apellidosTutor]
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



    private function insertarDatosTutor($fila, $idTutor, $rol)
    {
        $errores = [];

        $camposObligatorios = \App\Models\OlimpiadaCampoTutor::where('id_olimpiada', $this->idOlimpiada)
            ->where('esObligatorio', true)
            ->with('campo_tutor')
            ->get()
            ->pluck('campo_tutor.nombre')
            ->toArray();

        foreach ($camposObligatorios as $campoObligatorio) {
            $campoNormalizado = $this->limpiarTexto($campoObligatorio);
            $campoExcel1 = "{$campoNormalizado}_{$rol}";
            $campoExcel2 = "{$campoNormalizado}{$rol}";
            if (
                (!array_key_exists($campoExcel1, $fila) || empty($fila[$campoExcel1])) &&
                (!array_key_exists($campoExcel2, $fila) || empty($fila[$campoExcel2]))
            ) {
                $errores[] = "El campo obligatorio '$campoObligatorio' es requerido para el tutor '$rol' en esta olimpiada y no está presente o está vacío en el Excel.";
            }
        }

        $datosParaInsertar = [];
        $clavesParaBuscar = [];

        foreach ($fila as $campo => $valor) {
            if (
                preg_match('/^(.*)_' . $rol . '$/i', $campo, $matches) ||
                preg_match('/^(.*)' . $rol . '$/i', $campo, $matches)
            ) {
                $campoNombre = $matches[1];
                $campoNombreNormalizado = $this->limpiarTexto($campoNombre);

                if (is_null($valor) || $valor === '') {
                    continue;
                }

                $campoTutorId = $this->camposTutor[$campoNombreNormalizado] ?? null;
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
        $idGrado = $this->grados[$nombreGrado] ?? null;
        if (!$idGrado) {
            $errores[] = "El grado '{$fila['grado']}' no existe o no está habilitado para esta olimpiada.";
        }

        $nombreArea = $this->limpiarTexto($fila['area'] ?? '');
        $idArea = $this->areas[$nombreArea] ?? null;
        if (!$idArea) {
            $errores[] = "El área '{$fila['area']}' no existe o no está habilitada para esta olimpiada.";
        }

        $nombreCategoria = $this->limpiarTexto($fila['nivel_categoria'] ?? '');
        $idCategoria = $this->categorias[$nombreCategoria] ?? null;
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

        $opcion = OpcionInscripcion::where('id_olimpiada', $this->idOlimpiada)
            ->where('id_area', $idArea)
            ->where('id_nivel_categoria', $idCategoria)
            ->first();

        if (!$opcion) {
            throw new \Exception("No existe una opción de inscripción para el grado '{$fila['grado']}', área '{$fila['area']}' y categoría '{$fila['nivel_categoria']}' en esta olimpiada.");
        }

        Inscripcion::firstOrCreate([
            'id_registro' => $registro->id,
            'id_opcion_inscripcion' => $opcion->id,
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


    public function batchSize(): int
    {
        return 1000;
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}
