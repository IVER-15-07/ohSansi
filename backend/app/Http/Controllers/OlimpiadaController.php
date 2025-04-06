<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Olimpiada; 

class OlimpiadaController extends Controller
{
    /**
     * Obtener todas las olimpiadas.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerOlimpiadas(Request $request)
    {
        try {
            // Obtener todas las olimpiadas con relaciones
            $olimpiadas = Olimpiada::all()->get();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $olimpiadas,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las olimpiadas: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Almacenar una nueva olimpiada.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarOlimpiada(Request $request){
        try{
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string|max:255',
                'costo' => 'nullable|numeric',
                'ubicacion' => 'nullable|string|max:255',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after:fecha_inicio', 
            ]);

            // Crear el área
            $olimpiada = Olimpiada::create([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'],
                'costo' => $validated['costo'],
                'ubicacion' => $validated['ubicacion'],
                'fecha_inicio' => $validated['fecha_inicio'],
                'fecha_fin' => $validated['fecha_fin'],
            ]);

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Olimpiada creada exitosamente', 
                'data' => $olimpiada,
            ], 201);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el olimpiada: '.$e->getMessage()
            ], 500);
        }
    }
}
