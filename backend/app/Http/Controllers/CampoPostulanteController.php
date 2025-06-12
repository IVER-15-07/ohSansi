<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CampoPostulante;

class CampoPostulanteController extends Controller
{
    function obtenerCatalogoCamposPostulante(Request $request)
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

            // Obtener los campos de postulante (catálogo general) y cargar las relaciones necesarias
            $campos_postulante = CampoPostulante::with(['tipo_campo'])
                ->orderBy('nombre', 'asc')
                ->get();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $campos_postulante,
                'message' => 'Catálogo de campos de postulante obtenido exitosamente.',
            ], 200);
        } catch (\Exception $e) {
            // Log del error para debugging
            \Log::error('Error en obtenerCatalogoCamposPostulante: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener el catálogo de campos de un postulante: ' . $e->getMessage(),
            ], 500);
        }
    }
}
