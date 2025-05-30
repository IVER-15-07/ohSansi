<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CampoPostulante;

class CampoPostulanteController extends Controller
{
    function obtenerCatalogoCamposPostulante()
    {
        try {
            // Obtener los campos de postulante filtrados por id_olimpiada y cargar las relaciones necesarias
            $campos_postulante =CampoPostulante::with(['tipo_campo'])
                ->orderBy('nombre', 'asc')
                ->get();
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
                'message' => 'Error al obtener el catalogo de campos de un postulante: ' . $e->getMessage(),
            ], 500);
        }
    }
}
