<?php

namespace App\Imports;

use App\Models\Registro;

use App\Models\Tutor;
use App\Models\RolTutor;
use App\Models\RegistroTutor;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;


use App\Models\Grado;
use App\Models\Area;
use App\Models\Inscripcion;
use App\Models\NivelCategoria;
use App\Models\OpcionInscripcion;




use App\Models\Postulante;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;



class PostulantesImport implements ToModel, WithHeadingRow, WithBatchInserts
{
    protected $idOlimpiada;
    protected $idEncargado;
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
        $this->grados = Grado::pluck('id', 'nombre');
        $this->roles = RolTutor::pluck('id', 'nombre');
    }

    public function model(array $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                try {
                    // Validar área
                    $areaId = $this->areas[$row['area']] ?? null;
                    if (!$areaId) {
                        throw new \Exception("El área '{$row['area']}' no existe en la base de datos.");
                    }

                    // Validar categoría
                    $categoriaId = $this->categorias[$row['categoria']] ?? null;
                    if (!$categoriaId) {
                        throw new \Exception("La categoría '{$row['categoria']}' no existe en la base de datos.");
                    }

                    // Validar grado
                    $gradoId = $this->grados[$row['grado']] ?? null;
                    if (!$gradoId) {
                        throw new \Exception("El grado '{$row['grado']}' no existe en la base de datos.");
                    }

                    // Validar rol del tutor
                    $rolId = $this->roles[$row['rol_tutor']] ?? null;
                    if (!$rolId) {
                        throw new \Exception("El rol del tutor '{$row['rol_tutor']}' no existe en la base de datos.");
                    }


                    // Validar que la opción de inscripción exista y esté relacionada con el área, categoría y olimpiada
                    $opcionInscripcion = OpcionInscripcion::
                        where('id_area', $areaId)
                        ->where('id_nivel_categoria', $categoriaId)
                        ->where('id_olimpiada', $this->idOlimpiada)
                        ->first();

                    if (!$opcionInscripcion) {
                        throw new \Exception("La combinación de área '{$row['area']}' y categoría '{$row['categoria']}' no es válida para la olimpiada.");
                    }

                    // Crear o verificar tutor
                    $tutor = Tutor::firstOrCreate(
                        ['ci' => $row['ci_tutor']],
                        [
                            'nombres' => ucfirst(mb_strtolower($row['nombres_tutor'], 'UTF-8')),
                            'apellidos' => ucfirst(mb_strtolower($row['apellidos_tutor'], 'UTF-8')),
                        ]
                    );

                    // Crear o verificar postulante
                    $postulante = Postulante::firstOrCreate(
                        ['ci' => $row['ci_postulante']],
                        [
                            'nombres' => ucfirst(mb_strtolower($row['nombres_postulante'], 'UTF-8')),
                            'apellidos' => ucfirst(mb_strtolower($row['apellidos_postulante'], 'UTF-8')),
                            'fecha_nacimiento' => $row['fecha_nacimiento_postulante'],
                        ]
                    );

                    // Verificar si ya existe un registro para este postulante en esta área y categoría
                    $registroExistente = Registro::where('id_olimpiada', $this->idOlimpiada)
                        ->where('id_postulante', $postulante->id)
                        ->where('id_grado', $row['id_grado'])
                        ->first();

                    if (!$registroExistente) {
                        // Crear registro si no existe
                        $registro = Registro::create([
                            'id_olimpiada' => $this->idOlimpiada,
                            'id_encargado' => $this->idEncargado,
                            'id_postulante' => $postulante->id,
                            'id_grado' => $row['id_grado'],
                        ]);

                        // Relacionar tutor con el registro
                        RegistroTutor::create([
                            'id_registro' => $registro->id,
                            'id_tutor' => $tutor->id,
                            'id_rol_tutor' => $row['id_rol_tutor'],
                        ]);

                        // Crear inscripción
                        Inscripcion::create([
                            'id_registro' => $registro->id,
                            'id_opcion_inscripcion' => $opcionInscripcion->id,
                        ]);
                    } else {
                        // Si el registro ya existe, verificar si ya está inscrito en esta opción
                        $inscripcionExistente = Inscripcion::where('id_registro', $registroExistente->id)
                            ->where('id_opcion_inscripcion', $opcionInscripcion->id)
                            ->first();

                        if (!$inscripcionExistente) {
                            // Crear inscripción si no existe
                            Inscripcion::create([
                                'id_registro' => $registroExistente->id,
                                'id_opcion_inscripcion' => $opcionInscripcion->id,
                            ]);
                        }
                    }
                     Log::info('Procesando fila:', $row); // Registrar el contenido de la fila
        // Continuar con el procesamiento...
                } catch (\Exception $e) {
                    Log::error('Error en la fila:', ['fila' => $row, 'error' => $e->getMessage()]);
                    // Manejar errores por fila
                    //throw new \Exception("Error en la fila: " . json_encode($row) . " - " . $e->getMessage());
                }
            }
        });
    }


    public function batchSize(): int
    {
        return 1000; // Aumentar el tamaño del lote
    }

    public function chunkSize(): int
    {
        return 1000; // Aumentar el tamaño del fragmento
    }
}
