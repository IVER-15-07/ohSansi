<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Registro;
use App\Models\Persona;
use App\Models\Postulante;

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

            $persona = Persona::where('ci', $ci)->first();
            if (!$persona) {
                return response()->json([
                    'success' => true,
                    'message' => 'Persona no encontrada',
                    'data' => null,
                ], 200);
            }

            $postulante = Postulante::where('id_persona', $persona->id)->first();
            if (!$postulante) {
                return response()->json([
                    'success' => true,
                    'message' => 'Postulante no encontrado',
                    'data' => null,
                ], 200);
            }

            $registro = Registro::where('id_olimpiada', $idOlimpiada)
                ->where('id_postulante', $postulante->id)
                ->with(['postulante.persona', 'grado' ])
                ->first();

            return response()->json([
                'success' => true,
                'message' => $registro ? 'Registro encontrado exitosamente' : 'Registro no encontrado',
                'data' => $registro,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener el registro: ' . $e->getMessage(),
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