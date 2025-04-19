<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\SeccionCampo;
use App\Models\CampoInscripcion;

class FormularioController extends Controller
{
    public function obtenerFormulario(Request $request)
    {
        try {
            // Intenta obtener las áreas desde la caché
            $secciones = Cache::remember('seccionesConCampos2', 3600, function () {
                return SeccionCampo::with(['campos_inscripcion.tipo_campo'])->get(); // Consulta a la base de datos si no está en caché
            });

            return response()->json([
                'success' => true,
                'data' => $secciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las secciones con campos: ' . $e->getMessage()
            ], 500);
        }
    }
}


