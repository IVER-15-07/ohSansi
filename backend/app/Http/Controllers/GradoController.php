<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Grado;
class GradoController extends Controller
{
    public function obtenerGrados(Request $request){
        try{
            // Intenta obtener los grados desde la caché
            $grados = Cache::remember('grados', 3600, function () {
                return Grado::all();// Consulta a la base de datos si no está en caché
            });
            
            return response()->json([
                'success' => true,
                'data' => $grados
            ], 200);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los grados: '.$e->getMessage()
            ], 500);
        }
    }
}
