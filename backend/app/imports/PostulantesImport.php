<?php

namespace App\Imports;

use App\Models\Registro;

use App\Models\Tutor;
use App\Models\RolTutor;
use App\Models\RegistroTutor;


use Illuminate\Validation\Rule;


use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;


use Maatwebsite\Excel\Concerns\WithValidation;


use Maatwebsite\Excel\Concerns\WithBatchInserts;


use Maatwebsite\Excel\Concerns\WithChunkReading;


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








use App\Models\Postulante;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Cache\CacheManager;
use Illuminate\Support\Facades\Cache;









class PostulantesImport implements ToCollection, WithHeadingRow, WithBatchInserts
{
    protected $idOlimpiada;
    protected $idEncargado;

    // Precargar datos
    protected $areas;
    protected $categorias;
    protected $grados;
    protected $roles;

    public function __construct($idOlimpiada, $idEncargado)
    {
        $this->idOlimpiada = $idOlimpiada;
        $this->idEncargado = $idEncargado;

        // Precargar datos de las tablas relacionadas
        $this->areas = Area::pluck('id', 'nombre');
        $this->categorias = NivelCategoria::pluck('id', 'nombre');
        $this->grados = Grado::get()->pluck('id', 'nombre')->mapWithKeys(fn($id, $nombre) => [strtolower(trim($nombre)) => $id]);



        Log::info("Grados precargados:", $this->grados->toArray());
        $this->roles = RolTutor::pluck('id', 'nombre');
    }

    public function collection(Collection $rows)

    {


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
        // Validar que los datos requeridos estén presentes
        foreach (['ci', 'nombres', 'apellidos', 'fecha_nacimiento'] as $campo) {
            if (empty($fila[$campo])) {
                throw new \Exception("El campo '$campo' está vacío.");
            }
        }

        // Obtener datos del postulante
        $ci = $fila['ci'];
        $nombres = $fila['nombres'];
        $apellidos = $fila['apellidos'];
        $fechaNacimiento = $fila['fecha_nacimiento'];

        // Convertir la fecha si es un valor numérico o está en otro formato
        try {
            if (is_numeric($fechaNacimiento)) {
                $fechaNacimiento = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($fechaNacimiento)->format('Y-m-d');
            } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaNacimiento)) {
                throw new \Exception("La fecha de nacimiento no tiene el formato aaaa-mm-dd.");
            }
        } catch (\Exception $e) {
            throw new \Exception("Error al procesar la fecha de nacimiento: " . $e->getMessage());
        }

        // Validar si el postulante ya existe
        $postulante = Postulante::firstOrCreate(
            ['ci' => $ci],
            ['nombres' => $nombres, 'apellidos' => $apellidos, 'fecha_nacimiento' => $fechaNacimiento]
        );

        // Insertar datos adicionales del postulante
        $this->insertarDatosPostulante($fila, $postulante->id);

        // Insertar registro e inscripción
        return $this->insertarRegistroEInscripcion($fila, $postulante->id);
    }

    private function procesarTutores($fila, $idRegistro)
    {
        if (!$idRegistro) {
            throw new \Exception("El registro no está definido.");
        }

        foreach ($fila as $campo => $valor) {
            // Identificar los campos relacionados con los tutores (por ejemplo, nombres(Padre))
            if (preg_match('/\((.*?)\)$/', $campo, $matches)) {
                $rol = $matches[1]; // Extraer el rol del tutor (por ejemplo, "Padre")
                $campoNombre = preg_replace('/\((.*?)\)$/', '', $campo); // Eliminar el rol del nombre del campo

                // Validar que el rol exista en los datos precargados
                $idRolTutor = $this->roles[$rol] ?? null;
                if (!$idRolTutor) {
                    throw new \Exception("El rol de tutor '$rol' no es válido.");
                }

                // Manejar los campos básicos del tutor (nombres, apellidos, ci)
                if (in_array($campoNombre, ['nombres', 'apellidos', 'ci'])) {
                    $ciTutor = $fila["ci($rol)"] ?? null;
                    $nombresTutor = $fila["nombres($rol)"] ?? null;
                    $apellidosTutor = $fila["apellidos($rol)"] ?? null;

                    if (empty($ciTutor) || empty($nombresTutor) || empty($apellidosTutor)) {
                        throw new \Exception("Los datos del tutor con rol '$rol' están incompletos.");
                    }

                    // Validar si el tutor ya existe
                    $tutor = Tutor::firstOrCreate(
                        ['ci' => $ciTutor],
                        ['nombres' => $nombresTutor, 'apellidos' => $apellidosTutor]
                    );

                    // Relacionar al tutor con el registro
                    RegistroTutor::firstOrCreate([
                        'id_registro' => $idRegistro,
                        'id_tutor' => $tutor->id,
                        'id_rol_tutor' => $idRolTutor,
                    ]);
                } else {
                    // Manejar los campos adicionales del tutor
                    $this->procesarCamposAdicionalesTutor($fila, $campoNombre, $rol, $idRegistro);
                }
            }
        }
    }

    private function procesarCamposAdicionalesTutor($fila, $campoNombre, $rol, $idRegistro)
    {
        $idCampoTutor = CampoTutor::where('nombre', $campoNombre)->value('id');
        if (!$idCampoTutor) {
            throw new \Exception("El campo '$campoNombre' no es válido para el tutor.");
        }

        $olimpiadaCampoTutor = DB::table('olimpiada_campo_tutor')
            ->where('id_olimpiada', $this->idOlimpiada)
            ->where('id_campo_tutor', $idCampoTutor)
            ->first();

        if (!$olimpiadaCampoTutor) {
            throw new \Exception("El campo '$campoNombre' no está asociado a la olimpiada.");
        }

        if ($olimpiadaCampoTutor->esObligatorio && empty($fila["$campoNombre($rol)"])) {
            throw new \Exception("El campo '$campoNombre' es obligatorio para el tutor con rol '$rol'.");
        }

        DatoTutor::create([
            'id_tutor' => $idRegistro,
            'valor' => $fila["$campoNombre($rol)"],
            'id_olimpiada_campo_tutor' => $olimpiadaCampoTutor->id,
        ]);
    }

    private function insertarDatosPostulante($fila, $idPostulante)
    {
        foreach ($fila as $campo => $valor) {
        // Ignorar campos básicos y campos relacionados con tutores
        if (!in_array($campo, ['ci', 'nombres', 'apellidos', 'fecha_nacimiento', 'grado', 'area', 'nivel_categoria','cipadre','nombrespadre','apellidospadre','cimadre','nombresmadre','apellidosmadre','']) && !preg_match('/\((.*?)\)$/', $campo)) {
            // Buscar el ID del campo en la tabla campo_postulante
            $idCampoPostulante = CampoPostulante::where('nombre', $campo)->value('id');
            if (!$idCampoPostulante) {
                throw new \Exception("El campo '$campo' no es válido.");
            }

            // Validar que el campo esté asociado a la olimpiada
            $olimpiadaCampoPostulante = OlimpiadaCampoPostulante::where('id_olimpiada', $this->idOlimpiada)
                ->where('id_campo_postulante', $idCampoPostulante)
                ->first();

            if (!$olimpiadaCampoPostulante) {
                throw new \Exception("El campo '$campo' no está asociado a la olimpiada.");
            }

            // Verificar si el campo es obligatorio y está vacío
            if ($olimpiadaCampoPostulante->esObligatorio && empty($valor)) {
                throw new \Exception("El campo '$campo' es obligatorio y no puede estar vacío.");
            }

            // Insertar el dato adicional del postulante
            DatoPostulante::create([
                'id_postulante' => $idPostulante,
                'valor' => $valor,
                'id_olimpiada_campo_postulante' => $olimpiadaCampoPostulante->id,
            ]);
        }
    }
    }

    private function insertarRegistroEInscripcion($fila, $idPostulante)
    {
        if (empty($fila['grado'])) {
            throw new \Exception("El campo 'grado' está vacío en la fila.");
        }

        // Normalizar con función robusta
        $nombreGrado = $this->limpiarTexto($fila['grado']);
        Log::info("Valor del grado procesado (super limpio): '{$nombreGrado}'");

        $idGrado = $this->grados[$nombreGrado] ?? null;
        if (!$idGrado) {
            Log::error("El grado '{$fila['grado']}' (procesado como '{$nombreGrado}') no coincide con los grados precargados: " . json_encode($this->grados));
            throw new \Exception("El grado '{$fila['grado']}' no es válidoaaa.");
        }

        // Buscar el ID del área basado en el nombre
        $idArea = $this->areas[$fila['area']] ?? null;
        if (!$idArea) {
            throw new \Exception("El área '{$fila['area']}' no es válida.");
        }

        // Buscar el ID de la categoría basado en el nombre
        $idCategoria = $this->categorias[$fila['nivel_categoria']] ?? null;
        if (!$idCategoria) {
            throw new \Exception("La categoría '{$fila['nivel_categoria']}' no es válida.");
        }

        // Insertar el registro
        $registro = Registro::firstOrCreate([
            'id_postulante' => $idPostulante,
            'id_olimpiada' => $this->idOlimpiada,
            'id_encargado' => $this->idEncargado,
            'id_grado' => $idGrado,
        ]);

        // Buscar la opción de inscripción
        $opcion = OpcionInscripcion::where('id_olimpiada', $this->idOlimpiada)
            ->where('id_area', $idArea)
            ->where('id_nivel_categoria', $idCategoria)
           
            ->first();

        if (!$opcion) {
            throw new \Exception("No existe opción de inscripción con Grado: '{$fila['grado']}', Área: '{$fila['area']}', Nivel: '{$fila['nivel_categoria']}'.");
        }

        // Insertar la inscripción
        Inscripcion::firstOrCreate([
            'id_registro' => $registro->id,
            'id_opcion_inscripcion' => $opcion->id,
        ]);

        return $registro->id;
    }


    public function obtenerGrados()
    {
        try {
            // Intenta obtener los grados desde la caché
            $grados = Cache::remember('grados', 3600, function () {
                return Grado::all(); // Consulta a la base de datos si no está en caché
            });

            return response()->json([
                'success' => true,
                'data' => $grados
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los grados: ' . $e->getMessage()
            ], 500);
        }
    }



    private function limpiarTexto($texto)
    {
        // Normaliza espacios múltiples, elimina espacios invisibles, elimina acentos
        $texto = mb_strtolower(trim($texto));
        $texto = preg_replace('/\s+/', ' ', $texto); // múltiples espacios a uno solo
        $texto = preg_replace('/[\x{00A0}\x{200B}\x{FEFF}]/u', '', $texto); // eliminar espacios no estándar
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto); // quitar tildes y caracteres raros
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
