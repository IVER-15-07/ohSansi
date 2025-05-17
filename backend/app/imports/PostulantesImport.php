<?php

namespace App\Imports;

use App\Models\Registro;




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

use App\Models\Tutor;
use App\Models\RolTutor;
use App\Models\RegistroTutor;










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

        $this->roles = RolTutor::pluck('id', 'nombre');
        Log::info("reles precargados:", $this->roles->toArray());
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

        // Insertar registro e inscripción
        return $this->insertarRegistroEInscripcion($fila, $postulante->id);
    }





    private function procesarTutores($fila, $idRegistro)
    {
        Log::info("Entrando a procesarTutores para registro: $idRegistro");
        $tutoresPorRol = [];
        $rolesNormalizados = $this->roles->mapWithKeys(function ($id, $nombre) {
            return [$this->limpiarTexto($nombre) => $id];
        });
        Log::info("Roles normalizados: " . json_encode($rolesNormalizados));

        // Detectar tutores por sufijo (ej: nombresmama, apellidosmama, cipapa)
        $patron = '/^(ci|nombres|apellidos)(papa|mama|profesor)$/i';

        // Buscar todos los roles posibles en la fila
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






    private function insertarRegistroEInscripcion($fila, $idPostulante)
    {
        if (empty($fila['grado'])) {
            throw new \Exception("El campo 'grado' está vacío en la fila.");
        }

        // Normalizar con función robusta
        $nombreGrado = $this->limpiarTexto($fila['grado']);


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



    private function limpiarTexto($texto)
    {
        // Normaliza espacios múltiples, elimina espacios invisibles, elimina acentos
        $texto = mb_strtolower(trim($texto));
        $texto = preg_replace('/\s+/', ' ', $texto); // múltiples espacios a uno solo
        $texto = preg_replace('/[\x{00A0}\x{200B}\x{FEFF}]/u', '', $texto); // eliminar espacios no estándar
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto); // quitar tildes y caracteres raros
        $texto = str_replace(["'", "`", "´"], '', $texto); // quitar apóstrofes y comillas
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
