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
}
