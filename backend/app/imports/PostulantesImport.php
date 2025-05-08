<?php

namespace App\Imports;

use App\Models\Registro;
use App\Models\DatoInscripcion;
use App\Models\CampoInscripcion;
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
use App\Models\NivelCategoria;
use App\Models\OpcionInscripcion;

class PostulantesImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
{
    protected $idEncargado;
    protected $idOlimpiada;

    public function __construct($idEncargado, $idOlimpiada)
    {
        $this->idEncargado = $idEncargado;
        $this->idOlimpiada = $idOlimpiada;
    }

    public function model(array $row)
    {
        // Validar y obtener IDs relacionados
        $idGrado = Grado::where('nombre', $row['grado'])->value('id');
        $idArea = Area::where('nombre', $row['area'])->value('id');
        $idNivelCategoria = NivelCategoria::where('nombre', $row['nivel_categoria'])->value('id');

        if (!$idGrado || !$idArea || !$idNivelCategoria) {
            throw new \Exception('Error al validar grado, área o nivel/categoría.');
        }

        // Crear el registro en la tabla "registro"
        $registro = Registro::create([
            'nombres' => $row['nombres'],
            'apellidos' => $row['apellidos'],
            'ci' => $row['ci'],
            'id_grado' => $idGrado,
            'id_opcion_inscripcion' => OpcionInscripcion::where('id_olimpiada', $this->idOlimpiada)->value('id'),
            'id_area' => $idArea,
            'id_nivel_categoria' => $idNivelCategoria,
            'id_encargado' => $this->idEncargado,
        ]);

        // Crear los datos de inscripción en la tabla "dato_inscripcion"
        foreach ($row as $campoNombre => $valor) {
            $idCampoInscripcion = CampoInscripcion::where('nombre', $campoNombre)->value('id');

            if ($idCampoInscripcion) {
                DatoInscripcion::create([
                    'id_campo_inscripcion' => $idCampoInscripcion,
                    'id_registro' => $registro->id,
                    'valor' => $valor,
                ]);
            }
        }

        // Procesar roles y tutores
        if (isset($row['tutores'])) {
            $tutores = explode(',', $row['tutores']);
            foreach ($tutores as $tutorData) {
                [$nombre, $apellido, $ci, $correo, $rol] = explode('|', $tutorData);

                $idRolTutor = RolTutor::firstOrCreate(['nombre' => $rol])->id;

                $tutor = Tutor::firstOrCreate([
                    'ci' => $ci,
                ], [
                    'nombres' => $nombre,
                    'apellidos' => $apellido,
                    'correo' => $correo,
                ]);

                RegistroTutor::create([
                    'id_registro' => $registro->id,
                    'id_tutor' => $tutor->id,
                    'id_rol_tutor' => $idRolTutor,
                ]);
            }
        }

        return $registro;
    }

    public function rules(): array
    {
        return [
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'ci' => 'required|string|max:20|unique:registro,ci',
            'grado' => 'required|string',
            'area' => 'required|string',
            'nivel_categoria' => 'required|string',
        ];
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