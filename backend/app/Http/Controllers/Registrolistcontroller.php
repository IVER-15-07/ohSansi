<?php

namespace App\Http\Controllers;



use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Registro;
use App\Models\Area;
use App\Models\NivelCategoria;
use App\Models\DatoInscripcion;
use App\Models\Grado;
use App\Models\OpcionInscripcion;
use App\Models\SeccionCampo;
use App\Models\CampoInscripcion;
use App\Models\TipoCampo;
use App\Models\RolTutor;
use App\Models\Tutor;
use App\Models\RegistroTutor;

use Illuminate\Support\Facades\DB;

use App\Imports\PostulantesImport;

use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\ToModel;

use Maatwebsite\Excel\HeadingRowImport;
use App\Models\Postulante;
use App\Models\Inscripcion;








class Registrolistcontroller extends Controller
{




    public function registrarListaPostulantes(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls',
            'id_encargado' => 'required|exists:encargado,id',
            'id_olimpiada' => 'required|exists:olimpiada,id',
        ]);

        $idEncargado = $request->id_encargado;
        $idOlimpiada = $request->id_olimpiada;

        try {
            $rows = Excel::toCollection(null, $request->file('archivo'))[0]->toArray();
            $headings = array_map('trim', (new HeadingRowImport)->toArray($request->file('archivo'))[0][0]);

            $requiredHeadings = ['nombres', 'apellidos', 'ci', 'area', 'categoria', 'grado', 'ci_tutor', 'nombres_tutor', 'apellidos_tutor', 'rol_tutor'];

            foreach ($requiredHeadings as $heading) {
                if (!in_array($heading, $headings)) {
                    throw new \Exception("El encabezado '{$heading}' es obligatorio en el archivo.");
                }
            }

            $areas = Area::pluck('id', 'nombre');
            $categorias = NivelCategoria::pluck('id', 'nombre');
            $grados = Grado::pluck('id', 'nombre');
            $roles = RolTutor::pluck('id', 'nombre');

            $errores = []; // Arreglo para almacenar errores por fila

            DB::transaction(function () use ($rows, $idEncargado, $idOlimpiada, $areas, $categorias, $grados, $roles, &$errores) {
                foreach ($rows as $index => $row) {
                    $fila = $index + 2; // Para mostrar el número real (considerando encabezados)

                    try {
                        foreach (['nombres', 'apellidos', 'ci', 'area', 'categoria', 'grado', 'ci_tutor', 'nombres_tutor', 'apellidos_tutor', 'rol_tutor'] as $campo) {
                            if (!isset($row[$campo]) || trim($row[$campo]) === '') {
                                throw new \Exception("La fila #$fila no contiene el campo obligatorio '{$campo}'.");
                            }
                        }

                        $areaId = $areas[$row['area']] ?? null;
                        if (!$areaId) {
                            throw new \Exception("El área '{$row['area']}' no existe en la base de datos. Fila #$fila.");
                        }

                        $categoriaId = $categorias[$row['categoria']] ?? null;
                        if (!$categoriaId) {
                            throw new \Exception("La categoría '{$row['categoria']}' no existe en la base de datos. Fila #$fila.");
                        }

                        $gradoId = $grados[$row['grado']] ?? null;
                        if (!$gradoId) {
                            throw new \Exception("El grado '{$row['grado']}' no existe en la base de datos. Fila #$fila.");
                        }

                        $rolId = $roles[$row['rol_tutor']] ?? null;
                        if (!$rolId) {
                            throw new \Exception("El rol del tutor '{$row['rol_tutor']}' no existe en la base de datos. Fila #$fila.");
                        }

                        $opcionInscripcion = OpcionInscripcion::where('id_olimpiada', $idOlimpiada)
                            ->where('id_area', $areaId)
                            ->where('id_nivel_categoria', $categoriaId)
                            ->first();

                        if (!$opcionInscripcion) {
                            throw new \Exception("No se encontró una opción de inscripción para el área '{$row['area']}' y la categoría '{$row['categoria']}'. Fila #$fila.");
                        }

                        $postulante = Postulante::firstOrCreate(
                            ['ci' => $row['ci']],
                            [
                                'nombres' => $row['nombres'],
                                'apellidos' => $row['apellidos'],
                                'id_area' => $areaId,
                                'id_nivel_categoria' => $categoriaId,
                            ]
                        );

                        $registro = Registro::firstOrCreate(
                            ['id_postulante' => $postulante->id, 'id_olimpiada' => $idOlimpiada],
                            ['id_encargado' => $idEncargado, 'id_grado' => $gradoId]
                        );

                        $tutor = Tutor::firstOrCreate(
                            ['ci' => $row['ci_tutor']],
                            ['nombres' => $row['nombres_tutor'], 'apellidos' => $row['apellidos_tutor']]
                        );

                        RegistroTutor::firstOrCreate([
                            'id_registro' => $registro->id,
                            'id_tutor' => $tutor->id,
                            'id_rol_tutor' => $rolId,
                        ]);

                        Inscripcion::firstOrCreate([
                            'id_registro' => $registro->id,
                            'id_opcion_inscripcion' => $opcionInscripcion->id,
                        ]);
                    } catch (\Exception $e) {
                        $errores[] = $e->getMessage(); // Agrega el error al arreglo
                    }
                }
            });

            if (!empty($errores)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Algunos registros no pudieron ser procesados.',
                    'errors' => $errores, // Devuelve los errores al frontend
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lista de postulantes registrada exitosamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la lista de postulantes: ' . $e->getMessage(),
            ], 500);
        }
    }





    public function obtenerListaPostulantes()
    {
        try {
            $registros = Cache::remember('registros_excel', 3600, function () {
                return Registro::with(['datos', 'encargado', 'opcion_inscripcion'])->get();
            });

            return response()->json([
                'success' => true,
                'message' => 'Registros obtenidos exitosamente.',
                'data' => $registros,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los registros: ' . $e->getMessage(),
            ], 500);
        }
    }
}
