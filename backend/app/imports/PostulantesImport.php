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
        DB::transaction(function () use ($rows) {
            // Convertir los datos a UTF-8
            $rows = $rows->map(function ($fila) {
                return $fila->map(function ($valor) {
                    return is_string($valor) ? mb_convert_encoding($valor, 'UTF-8', 'auto') : $valor;
                });
            });
            foreach ($rows as $index => $row) {
                try {
                    // Convertir todos los valores de la fila a cadenas
                    $fila = array_map(function ($valor) {
                        return is_numeric($valor) ? (string) $valor : $valor;
                    }, $row->toArray());

                    // Registrar fila para depuración
                    Log::info("Procesando fila #$index:", $fila);

                    // Validar si la fila está vacía
                    if (empty(array_filter($fila))) {
                        Log::info("Fila #$index vacía, se omite.");
                        continue;
                    }

                    $idRegistro = $this->procesarFila($fila);
                    $this->procesarTutores($fila, $idRegistro);
                    Log::info("Fila #$index procesada correctamente.");
                } catch (\Exception $e) {
                    Log::error("Error en la fila #$index: " . $e->getMessage());
                    throw new \Exception("Error en la fila #$index: " . $e->getMessage());
                }
            }
        });
    }






    private function procesarFila($fila)
    {
        foreach (['ci', 'nombres', 'apellidos', 'fecha_nacimiento'] as $campo) {
            if (empty($fila[$campo])) {
                throw new \Exception("El campo '$campo' está vacío.");
            }
        }

        $ci = $fila['ci'];
        $nombres = $fila['nombres'];
        $apellidos = $fila['apellidos'];
        $fechaNacimiento = $fila['fecha_nacimiento'];

        try {
            if (is_numeric($fechaNacimiento)) {
                $fechaNacimiento = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($fechaNacimiento)->format('Y-m-d');
            } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaNacimiento)) {
                throw new \Exception("La fecha de nacimiento no tiene el formato aaaa-mm-dd.");
            }
        } catch (\Exception $e) {
            throw new \Exception("Error al procesar la fecha de nacimiento: " . $e->getMessage());
        }

        $postulante = Postulante::firstOrCreate(
            ['ci' => $ci],
            ['nombres' => $nombres, 'apellidos' => $apellidos, 'fecha_nacimiento' => $fechaNacimiento]
        );

        $this->insertarDatosPostulante($fila, $postulante->id);
        return $this->insertarRegistroEInscripcion($fila, $postulante->id);
    }

    private function insertarDatosPostulante($fila, $idPostulante)
    {
        $camposObligatorios = OlimpiadaCampoPostulante::where('id_olimpiada', $this->idOlimpiada)
            ->where('esObligatorio', true)
            ->with('campoPostulante')
            ->get()
            ->pluck('campoPostulante.nombre')
            ->toArray();

        foreach ($camposObligatorios as $campoObligatorio) {
            $campoNormalizado = $this->limpiarTexto($campoObligatorio);
            if (!array_key_exists($campoNormalizado, $fila) || empty($fila[$campoNormalizado])) {
                throw new \Exception("El campo obligatorio '$campoObligatorio' es requerido para esta olimpiada y no está presente o está vacío en el Excel.");
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
                throw new \Exception("El campo '$campo' no está habilitado para esta olimpiada.");
            }

            if ($olimpiadaCampoPostulante->esObligatorio && empty($valor)) {
                throw new \Exception("El campo '$campo' es obligatorio para esta olimpiada y no puede estar vacío.");
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

        if (!empty($datosParaInsertar)) {
            DatoPostulante::insert($datosParaInsertar);
        }
    }

    private function procesarTutores($fila, $idRegistro)
    {
        Log::info("Entrando a procesarTutores para registro: $idRegistro");
        $tutoresPorRol = [];
        $rolesNormalizados = $this->roles;
        Log::info("Roles normalizados: " . json_encode($rolesNormalizados));

        foreach ($rolesNormalizados as $rol => $idRolTutor) {
            $ciTutor = $fila["ci$rol"] ?? null;
            $nombresTutor = $fila["nombres$rol"] ?? null;
            $apellidosTutor = $fila["apellidos$rol"] ?? null;

            Log::info("Intentando extraer tutor: rol=$rol, ci=$ciTutor, nombres=$nombresTutor, apellidos=$apellidosTutor");

            if ($ciTutor && $nombresTutor && $apellidosTutor) {
                $tutor = Tutor::firstOrCreate(
                    ['ci' => $ciTutor],
                    ['nombres' => $nombresTutor, 'apellidos' => $apellidosTutor]
                );
                Log::info("Tutor creado o encontrado: " . json_encode($tutor->toArray()));

                $this->insertarDatosTutor($fila, $tutor->id, $rol);

                $registroTutor = RegistroTutor::firstOrCreate([
                    'id_registro' => $idRegistro,
                    'id_tutor' => $tutor->id,
                    'id_rol_tutor' => $idRolTutor,
                ]);
                Log::info("RegistroTutor creado o encontrado: " . json_encode($registroTutor->toArray()));

                $tutoresPorRol[$rol] = $tutor->id;
            } else {
                Log::debug("Datos incompletos para el tutor '$rol': ci='$ciTutor', nombres='$nombresTutor', apellidos='$apellidosTutor'.");
            }
        }

        if (empty($tutoresPorRol)) {
            Log::error("No se creó ningún tutor. Roles normalizados: " . json_encode($rolesNormalizados));
            Log::error("Fila recibida: " . json_encode($fila));
            throw new \Exception("No se creó ningún tutor para el registro $idRegistro. Revisa los encabezados, los datos y los roles en la base de datos.");
        }
        Log::info("Tutores asociados para registro $idRegistro: " . json_encode($tutoresPorRol));
    }


    private function insertarDatosTutor($fila, $idTutor, $rol)
    {
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
                throw new \Exception("El campo obligatorio '$campoObligatorio' es requerido para el tutor '$rol' en esta olimpiada y no está presente o está vacío en el Excel.");
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
                    throw new \Exception("El campo '$campoNombre' no está habilitado para el tutor '$rol' en esta olimpiada.");
                }

                if ($olimpiadaCampoTutor->esObligatorio && empty($valor)) {
                    throw new \Exception("El campo '$campoNombre' es obligatorio para el tutor '$rol' en esta olimpiada y no puede estar vacío.");
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

        if (!empty($datosParaInsertar)) {
            DatoTutor::insert($datosParaInsertar);
        }
    }

    private function insertarRegistroEInscripcion($fila, $idPostulante)
    {
        if (empty($fila['grado'])) {
            throw new \Exception("El campo 'grado' está vacío en la fila.");
        }

        $nombreGrado = $this->limpiarTexto($fila['grado']);
        $idGrado = $this->grados[$nombreGrado] ?? null;
        if (!$idGrado) {
            throw new \Exception("El grado '{$fila['grado']}' no existe o no está habilitado para esta olimpiada.");
        }

        $nombreArea = $this->limpiarTexto($fila['area']);
        $idArea = $this->areas[$nombreArea] ?? null;
        if (!$idArea) {
            throw new \Exception("El área '{$fila['area']}' no existe o no está habilitada para esta olimpiada.");
        }

        $nombreCategoria = $this->limpiarTexto($fila['nivel_categoria']);
        $idCategoria = $this->categorias[$nombreCategoria] ?? null;
        if (!$idCategoria) {
            throw new \Exception("La categoría '{$fila['nivel_categoria']}' no existe o no está habilitada para esta olimpiada.");
        }

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
