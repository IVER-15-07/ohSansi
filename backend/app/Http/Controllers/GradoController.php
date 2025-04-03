<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Grado;
class GradoController extends Controller
{
    public function obtenerGrados(Request $request){
        try{
            $grados = Grado::all();
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
