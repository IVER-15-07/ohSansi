<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Registro;

use App\Models\RegistroTutor;
use Illuminate\Support\Facades\Cache;

use Illuminate\Support\Facades\DB;


class RegistroController extends Controller
{
    /**
     * Almacenar un nuevo registro. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function crearRegistro(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'id_olimpiada' => 'required|exists:olimpiada,id',
                'id_postulante' => 'required|exists:postulante,id',
                'id_grado' => 'required|exists:grado,id',
                'id_encargado' => 'required|exists:encargado,id',
            ]);

            // Crear el registro
            $registro = new Registro();
            $registro->id_olimpiada = $validated['id_olimpiada'];
            $registro->id_postulante = $validated['id_postulante'];
            $registro->id_grado = $validated['id_grado'];
            $registro->id_encargado = $validated['id_encargado'];

            $registro->save(); // Guardar el registro en la base de datos

            // Retornar una respuesta exitosa con los grados asociados
            return response()->json([
                'success' => true,
                'message' => 'Registro creado exitosamente',
                'data' => $registro,
            ], 201);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el registro: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener registro dado el ci de un postulante y el id de la olimpiada
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerRegitroAOlimpiadaPorCI($idOlimpiada, $ci)
    {
        try {

            if (strlen($ci) > 20) {
                return response()->json([
                    'success' => false,
                    'message' => 'El CI no puede exceder los 20 caracteres.',
                ], 422);
            }
            
            $registro = Registro::where('id_olimpiada', $idOlimpiada)
                ->whereHas('postulante', function ($query) use ($ci) {
                    $query->where('ci', $ci);
                })
                ->with(['postulante', 'grado'])
                ->first();
            // Retornar una respuesta exitosa con los grados asociados
            return response()->json([
                'success' => true,
                'message' => 'Registro encontrado exitosamente',
                'data' => $registro,
            ], 201);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener el registro: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerRegistros($idEncargado, $idOlimpiada)
    {
        try {
            // Obtener los registros asociados al encargado y a la olimpiada donde id_pago sea null
            $registros = DB::table('registro')
                ->join('opcion_inscripcion', 'registro.id_opcion_inscripcion', '=', 'opcion_inscripcion.id')
                ->join('area', 'opcion_inscripcion.id_area', '=', 'area.id')
                ->join('nivel_categoria', 'opcion_inscripcion.id_nivel_categoria', '=', 'nivel_categoria.id')
                ->where('registro.id_encargado', $idEncargado)
                ->where('opcion_inscripcion.id_olimpiada', $idOlimpiada) // Filtrar por id_olimpiada
                ->whereNull('registro.id_pago') // Filtrar registros donde id_pago sea null
                ->select(
                    'registro.id as id_registro',
                    'registro.nombres',
                    'registro.apellidos',
                    'registro.ci',
                    'area.nombre as nombre_area',
                    'nivel_categoria.nombre as nombre_nivel_categoria'
                )
                ->get();

            // Retornar una respuesta exitosa con los registros sin agrupar
            return response()->json([
                'success' => true,
                'data' => $registros,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los registros: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener los tutores de un registro específico
     * 
     * @param Request $request
     * @param int $idRegistro
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerTutoresDeRegistro(Request $request, $idRegistro)
    {
        try {
            $registro = Registro::findOrFail($idRegistro);

            $tutores = $registro->tutores()
                ->with('pivot.rolTutor') // Cargar la relación con RolTutor desde el pivot
                ->get()
                ->map(function ($tutor) {
                    // Acceder al objeto rolesTutor a través del pivot
                    $rolTutor = $tutor->pivot->rolTutor ?? null;
                    
                    return [
                        'id' => $tutor->id,
                        'ci' => $tutor->ci,
                        'nombres' => $tutor->nombres,
                        'apellidos' => $tutor->apellidos,
                        'correo' => $tutor->correo,
                        'rol' => [
                            'id' => $tutor->pivot->id_rol_tutor,
                            'nombre' => $rolTutor ? $rolTutor->nombre : 'No asignado',
                            'descripcion' => $rolTutor ? $rolTutor->descripcion : ''
                        ]
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Tutores obtenidos exitosamente.',
                'data' => $tutores,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registro no encontrado',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los tutores: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function asociarTutoresARegistro(Request $request, $idRegistro)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'tutores' => 'required|array',
                'tutores.*.id_tutor' => 'required|integer|exists:tutor,id',
                'tutores.*.id_rol_tutor' => 'required|integer|exists:rol_tutor,id',
            ]);

            // Obtener el registro
            $registro = Registro::findOrFail($idRegistro);

            // Asociar los tutores al registro
            foreach ($validated['tutores'] as $tutorData) {
                $registro->tutores()->attach($tutorData['id_tutor'], ['id_rol_tutor' => $tutorData['id_rol_tutor']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tutores asociados exitosamente.',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registro no encontrado',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al asociar tutores: ' . $e->getMessage(),
            ], 500);
        }
    }
}