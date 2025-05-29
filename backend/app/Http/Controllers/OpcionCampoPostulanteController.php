<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OpcionCampoPostulante;

class OpcionCampoPostulanteController extends Controller
{
    public function opcionesAgrupadas($idCampoPostulante)
    {
        try {
            $opciones = OpcionCampoPostulante::obtenerOpcionesAgrupadasPorPadre($idCampoPostulante);
            return response()->json([
                'success' => true,
                'data' => $opciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las opciones agrupadas: ' . $e->getMessage(),
            ], 500);
        }
    }
}
