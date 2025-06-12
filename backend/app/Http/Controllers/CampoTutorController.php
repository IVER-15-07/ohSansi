<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CampoTutor;

class CampoTutorController extends Controller
{
    function obtenerCatalogoCamposTutor(Request $request)
    {
        try {
            // Validar que no se reciban parámetros inesperados que puedan causar confusión
            if ($request->has('idOlimpiada') || $request->has('id_olimpiada')) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Este endpoint no acepta parámetros de olimpiada. Use el endpoint específico para campos de olimpiada.',
                ], 400);
            }

            // Obtener los campos de tutor (catálogo general) y cargar las relaciones necesarias
            $campos_tutor = CampoTutor::with(['tipo_campo'])
                ->orderBy('nombre', 'asc')
                ->get();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $campos_tutor,
                'message' => 'Catálogo de campos de tutor obtenido exitosamente.',
            ], 200);
        } catch (\Exception $e) {
            // Log del error para debugging
            \Log::error('Error en obtenerCatalogoCamposTutor: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener el catálogo de campos de un tutor: ' . $e->getMessage(),
            ], 500);
        }
    }
}
