<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;

class AreaController extends Controller
{
    public function obtenerAreas(Request $request){
        try{
            $areas = Area::all();
            return response()->json([
                'success' => true,
                'data' => $areas
            ], 200);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los areas: '.$e->getMessage()
            ], 500);
        }
    }

    
    public function almacenarArea(Request $request)
    {
        try{
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
            ]);

            // Crear el área
            $area = Area::create([
                'nombre' => $validated['nombre'],
            ]);

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Área creada exitosamente', 
                'data' => $area,
            ], 201);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el área: '.$e->getMessage()
            ], 500);
        }
    }
}
