<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OlimpiadaCampoPostulante;
use Illuminate\Support\Facades\Cache;

class OlimpiadaCampoPostulanteController extends Controller
{
    function obtenerCamposPostulante($idOlimpiada, $idPostulante = null)
    {
        try {
            // Obtener los campos de postulante filtrados por id_olimpiada y cargar las relaciones necesarias
            $campos_postulante =OlimpiadaCampoPostulante::where('id_olimpiada', $idOlimpiada)
                    ->with(['campo_postulante.tipo_campo'])
                    ->get();
                    
            if($idPostulante) {
                // Si se proporciona un idPostulante, cargar los datos del postulante
                $campos_postulante->each(function ($campo) use ($idPostulante) {
                    $campo->datos_postulante = $campo->datos_postulante($idPostulante)->get();
                });
            }
            

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $campos_postulante,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los campos de postulante de una olimpiada: ' . $e->getMessage(),
            ], 500);
        }
    }

    function eliminarCampoPostulante($idOlimpiadaCampoPostulante)
    {
        try {
            // Buscar el campo de postulante por id_olimpiada y id_campo_postulante
            $campo = OlimpiadaCampoPostulante::where('id', $idOlimpiadaCampoPostulante)
                ->first();
                
            if (!$campo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Campo de postulante no encontrado.',
                ], 404);
            }

            // Eliminar el campo de postulante
            $campo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Campo de postulante eliminado exitosamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al eliminar el campo de postulante: ' . $e->getMessage(),
            ], 500);
        }
    }

    function almacenarCampoPostulante(Request $request)
    {
        try {
            // Validar los datos de entrada
            $request->validate([
                'id_olimpiada' => 'required|exists:olimpiada,id',
                'id_campo_postulante' => 'required|exists:campo_postulante,id',
                'esObligatorio' => 'required|boolean',
            ]);

            // Crear o buscar un campo de postulante (evitar duplicados)
            $campo = OlimpiadaCampoPostulante::firstOrCreate(
                [
                    'id_olimpiada' => $request->id_olimpiada,
                    'id_campo_postulante' => $request->id_campo_postulante,
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
                'message' => 'Error al almacenar el campo de postulante: ' . $e->getMessage(),
            ], 500);
        }
    }
}
