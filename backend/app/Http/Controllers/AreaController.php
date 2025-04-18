<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Area;

class AreaController extends Controller
{
    public function obtenerAreas(Request $request)
    {
        try {
            // Intenta obtener las áreas desde la caché
            $areas = Cache::remember('areas', 3600, function () {
                return Area::all(); // Consulta a la base de datos si no está en caché
            });

            return response()->json([
                'success' => true,
                'data' => $areas,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los areas: ' . $e->getMessage()
            ], 500);
        }
    }


    public function almacenarArea(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => [
                    'required',
                    'string',
                    'max:50',
                    'regex:/^[a-zA-Z0-9\s]+$/',
                    function ($attribute, $value, $fail) {
                        
                        if (\App\Models\Area::whereRaw('LOWER(nombre) = ?', [strtolower($value)])->exists()) {
                            $fail('El nombre del área ya existe en el catálogo.');
                        }
                    },
                ],
            ]);
    
            // Crear el área con nombre normalizado
            $area = Area::create([
                'nombre' => ucfirst(mb_strtolower($validated['nombre'], 'UTF-8')),
            ]);
    
            // Limpiar caché para asegurar que la próxima consulta tenga datos actualizados
            Cache::forget('areas');
    
            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Área creada exitosamente.',
                'data' => $area,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el área: ' . $e->getMessage()
            ], 500);
        }
    }

    
}
