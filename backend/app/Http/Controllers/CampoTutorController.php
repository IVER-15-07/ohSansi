<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CampoTutor;

class CampoTutorController extends Controller
{
    function obtenerCatalogoCamposTutor()
    {
        try {
            // Obtener los campos de postulante filtrados por id_olimpiada y cargar las relaciones necesarias
            $campos_tutor =CampoTutor::with(['tipo_campo'])
                ->orderBy('nombre', 'asc')
                ->get();

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
                'message' => 'Error al obtener el catalogo de campos de un tutor: ' . $e->getMessage(),
            ], 500);
        }
    }
}
