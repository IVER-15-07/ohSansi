<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Configuracion; 

class ConfiguracionController extends Controller
{

    /**
     * Obtener todas las configuraciones. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerConfiguraciones(Request $request)
    {
        try {
            // Obtener todas las configuraciones con relaciones
            $configuraciones = Configuracion::with(['area', 'nivel_categoria', 'grado'])->get();
            
            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $configuraciones,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las configuraciones: ' . $e->getMessage(),
            ], 500);
        }
    }

    
    /**
     * Almacenar una nueva configuración. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarConfiguracion(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'id_olimpiada' => 'required|exists:olimpiada,id', // Validar que la olimpiada exista
                'id_area' => 'required|exists:area,id', // Validar que el área exista
                'id_nivel_categoria' => 'required|exists:nivel_categoria,id', // Validar que el nivel/categoría exista
                'id_grado' => 'required|exists:grado,id', // Validar que el grado exista
            ]);

            // Crear la configuración de forma controlada
            $configuracion = new Configuracion();
            $configuracion->nombre = $validated['nombre'];
            $configuracion->id_olimpiada = $validated['id_olimpiada'];
            $configuracion->id_area = $validated['id_area'];
            $configuracion->id_nivel_categoria = $validated['id_nivel_categoria'];
            $configuracion->id_grado = $validated['id_grado'];
            
            $configuracion->save();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => 'Configuración creada exitosamente',
                'data' => $configuracion,
            ], 201);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear la configuración: ' . $e->getMessage(),
            ], 500);
        }
    }
}
