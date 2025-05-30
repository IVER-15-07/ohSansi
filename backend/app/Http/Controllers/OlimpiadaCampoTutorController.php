<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OlimpiadaCampoTutor;
use Illuminate\Support\Facades\Cache;

class OlimpiadaCampoTutorController extends Controller
{
    function obtenerCamposTutor($idOlimpiada, $idTutor = null)
    {
        try {
            // Obtener los campos de postulante filtrados por id_olimpiada y cargar las relaciones necesarias
            $campos_tutor =OlimpiadaCampoTutor::where('id_olimpiada', $idOlimpiada)
                    ->with(['campo_tutor.tipo_campo'])
                    ->get();
        
            if($idTutor) {
                // Si se proporciona un idPostulante, cargar los datos del postulante
                $campos_tutor->each(function ($campo) use ($idTutor) {
                    $campo->datos_tutor = $campo->datos_tutor($idTutor)->get();
                }); 
            }

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $campos_tutor,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los campos de tutor de una olimpiada: ' . $e->getMessage(),
            ], 500);
        }
    }

    function eliminarCampoTutor($idOlimpiadaCampoTutor)
    {
        try {
            $campo = OlimpiadaCampoTutor::where('id', $idOlimpiadaCampoTutor)
                ->first();
                
            if (!$campo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Campo de tutor no encontrado.',
                ], 404);
            }

            // Eliminar el campo de postulante
            $campo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Campo de tutor eliminado exitosamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al eliminar el campo de tutor: ' . $e->getMessage(),
            ], 500);
        }
    }

    function almacenarCampoTutor(Request $request)
    {
        try {
            // Validar los datos de entrada
            $request->validate([
                'id_olimpiada' => 'required|exists:olimpiada,id',
                'id_campo_tutor' => 'required|exists:campo_tutor,id',
                'esObligatorio' => 'required|boolean',
            ]);

            // Crear o buscar un campo de postulante (evitar duplicados)
            $campo = OlimpiadaCampoTutor::firstOrCreate(
                [
                    'id_olimpiada' => $request->id_olimpiada,
                    'id_campo_tutor' => $request->id_campo_tutor,
                ],
                [
                    'esObligatorio' => $request-> esObligatorio
                ]
            );

            // Si ya existe, actualizar el campo obligatorio si es diferente
            if ($campo->esObligatorio !== $request->esObligatorio) {
                $campo->esObligatorio = $request->esObligatorio;
                $campo->save();
            }

            return response()->json([
                'success' => true,
                'data' => $campo,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al almacenar el campo de tutor: ' . $e->getMessage(),
            ], 500);
        }
    }
}
