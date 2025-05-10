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


class PostulantesImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{

    protected $idEncargado;
    protected $idOlimpiada;

    // Cache para evitar consultas repetitivas
    protected $areas;
    protected $categorias;
    protected $grados;
    protected $roles;

    public function __construct($idEncargado, $idOlimpiada)
    {
        $this->idEncargado = $idEncargado;
        $this->idOlimpiada = $idOlimpiada;

        // Cargar datos en memoria para evitar consultas repetitivas
        $this->areas = Area::pluck('id', 'nombre');
        $this->categorias = NivelCategoria::pluck('id', 'nombre');
        $this->grados = Grado::pluck('id', 'nombre');
        $this->roles = RolTutor::pluck('id', 'nombre');
    }

    public function model(array $row)
    {
        return DB::transaction(function () use ($row) {
            // Obtener IDs desde la cache
            $areaId = $this->areas[$row['area']] ?? null;
            if (!$areaId) {
                throw new \Exception("El área '{$row['area']}' no existe en la base de datos.");
            }

            $categoriaId = $this->categorias[$row['categoria']] ?? null;
            if (!$categoriaId) {
                throw new \Exception("La categoría '{$row['categoria']}' no existe en la base de datos.");
            }

            $gradoId = $this->grados[$row['grado']] ?? null;
            if (!$gradoId) {
                throw new \Exception("El grado '{$row['grado']}' no existe en la base de datos.");
            }

            $rolId = $this->roles[$row['rol_tutor']] ?? null;
            if (!$rolId) {
                throw new \Exception("El rol del tutor '{$row['rol_tutor']}' no existe en la base de datos.");
            }

            // Buscar la opción de inscripción correspondiente
            $opcionInscripcion = OpcionInscripcion::where('id_olimpiada', $this->idOlimpiada)
                ->where('id_area', $areaId)
                ->where('id_nivel_categoria', $categoriaId)
                ->first();

            if (!$opcionInscripcion) {
                throw new \Exception("No se encontró una opción de inscripción para el área '{$row['area']}' y la categoría '{$row['categoria']}'.");
            }

            // Verificar si el postulante ya existe
            $postulante = Postulante::where('ci', $row['ci'])->first();

            if (!$postulante) {
                // Crear el registro del postulante si no existe
                $postulante = Postulante::create([
                    'nombres' => $row['nombres'],
                    'apellidos' => $row['apellidos'],
                    'ci' => $row['ci'],
                    'id_area' => $areaId,
                    'id_nivel_categoria' => $categoriaId,
                ]);
            }

            // Verificar si ya existe un registro para este postulante en esta olimpiada
            $registro = Registro::where('id_postulante', $postulante->id)
                ->where('id_olimpiada', $this->idOlimpiada)
                ->first();

            if (!$registro) {
                // Crear el registro en la tabla `Registro` si no existe
                $registro = Registro::create([
                    'id_postulante' => $postulante->id,
                    'id_encargado' => $this->idEncargado,
                    'id_olimpiada' => $this->idOlimpiada,
                    'id_grado' => $gradoId,
                ]);
            }

            // Crear o buscar el tutor
            $tutor = Tutor::firstOrCreate([
                'ci' => $row['ci_tutor'],
            ], [
                'nombres' => $row['nombres_tutor'],
                'apellidos' => $row['apellidos_tutor'],
            ]);

            // Verificar si ya existe una asociación entre el registro y el tutor
            $registroTutor = RegistroTutor::where('id_registro', $registro->id)
                ->where('id_tutor', $tutor->id)
                ->where('id_rol_tutor', $rolId)
                ->first();

            if (!$registroTutor) {
                // Asociar el tutor con el registro y el rol si no existe
                RegistroTutor::create([
                    'id_registro' => $registro->id,
                    'id_tutor' => $tutor->id,
                    'id_rol_tutor' => $rolId,
                ]);
            }

            // Verificar si ya existe una inscripción para esta opción
            $inscripcion = Inscripcion::where('id_registro', $registro->id)
                ->where('id_opcion_inscripcion', $opcionInscripcion->id)
                ->first();

            if (!$inscripcion) {
                // Crear la inscripción si no existe
                return Inscripcion::create([
                    'id_registro' => $registro->id,
                    'id_opcion_inscripcion' => $opcionInscripcion->id,

                ]);
            }

            return $inscripcion; // Retornar la inscripción existente si ya estaba registrada
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
