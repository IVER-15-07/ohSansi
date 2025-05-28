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
}
