<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Inscripcion;

class InscripcionController extends Controller
{
    public function obtenerInscripciones($idEncargado, $idOlimpiada)
    {
        try {
            // Validar que el encargado exista
            $encargadoExiste = DB::table('encargado')->where('id', $idEncargado)->exists();
            if (!$encargadoExiste) {
                return response()->json([
                    'success' => false,
                    'message' => 'Encargado no encontrado.',
                ], 404);
            }

            // Validar que la olimpiada exista
            $olimpiadaExiste = DB::table('olimpiada')->where('id', $idOlimpiada)->exists();
            if (!$olimpiadaExiste) {
                return response()->json([
                    'success' => false,
                    'message' => 'Olimpiada no encontrada.',
                ], 404);
            }
            // Obtener las inscripciones asociadas al encargado y a la olimpiada donde id_pago sea null
            $inscripciones = DB::table('inscripcion')
                ->join('registro', 'inscripcion.id_registro', '=', 'registro.id')
                ->join('grado', 'registro.id_grado', '=', 'grado.id')
                ->join('postulante', 'registro.id_postulante', '=', 'postulante.id')
                ->join('opcion_inscripcion', 'inscripcion.id_opcion_inscripcion', '=', 'opcion_inscripcion.id')
                ->join('area', 'opcion_inscripcion.id_area', '=', 'area.id')
                ->join('nivel_categoria', 'opcion_inscripcion.id_nivel_categoria', '=', 'nivel_categoria.id')
                ->where('inscripcion.id_pago', null) // Filtrar inscripciones donde id_pago sea null
                ->where('registro.id_encargado', $idEncargado) // Filtrar por id_encargado
                ->where('opcion_inscripcion.id_olimpiada', $idOlimpiada) // Filtrar por id_olimpiada
                ->where('registro.id_olimpiada', $idOlimpiada) // Filtrar por id_olimpiada en la tabla encargado
                ->select(
                    'inscripcion.id as id_inscripcion', // Incluir id_inscripcion en la respuesta
                    'postulante.nombres',
                    'postulante.apellidos',
                    'postulante.ci',
                    'grado.nombre as grado', // Obtener el nombre del grado
                    'area.nombre as nombre_area',
                    'nivel_categoria.nombre as nombre_nivel_categoria'
                )
                ->get();
            
                if ($inscripciones->isEmpty()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No se encontraron registros pendientes por generar una orden de pago.',
                    ], 404);
                }

            // Retornar una respuesta exitosa con las inscripciones
            return response()->json([
                'success' => true,
                'data' => $inscripciones,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las inscripciones: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerInscripcionesPorRegistro($idRegistro)
    {
        try {
            // Buscar las inscripciones asociadas al registro usando Eloquent
            $inscripciones = Inscripcion::where('id_registro', $idRegistro)->get();

            return response()->json([
                'success' => true,
                'data' => $inscripciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las inscripciones dado un registro: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function crearInscripcion(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'id_registro' => 'required|integer|exists:registro,id',
                'id_opcion_inscripcion' => 'required|integer|exists:opcion_inscripcion,id',
            ]);

            // Crear la inscripción
            $inscripcion = Inscripcion::create([
                'id_registro' => $validated['id_registro'],
                'id_opcion_inscripcion' => $validated['id_opcion_inscripcion'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inscripción creada exitosamente.',
                'data' => $inscripcion,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear la inscripción: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function eliminarInscripcion($idInscripcion)
    {
        try {
            // Buscar la inscripción por su ID
            $inscripcion = Inscripcion::findOrFail($idInscripcion);
            // Verificar si la inscripción ya tiene pago asociado
            if (!is_null($inscripcion->id_pago)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la inscripción porque ya tiene un pago asociado.',
                ], 400);
            }
            $inscripcion->delete();

            return response()->json([
                'success' => true,
                'message' => 'Inscripción eliminada exitosamente.',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Inscripción no encontrada.',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al eliminar la inscripción: ' . $e->getMessage(),
            ], 500);
        }
    }
}
