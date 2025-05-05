<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SeccionCampo;

class SeccionController extends Controller
{

    public function obtenerSecciones()
    {
        try {
            $secciones = SeccionCampo::with('campos_inscripcion.tipo_campo')->get();

            return response()->json([
                'success' => true,
                'data' => $secciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las secciones: ' . $e->getMessage(),
            ], 500);
        }
    }
}
