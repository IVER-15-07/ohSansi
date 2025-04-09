<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            // Intenta obtener las configuraciones desde la caché
            $configuraciones = Cache::remember('configuraciones', 3600, function () {
                return Configuracion::with(['olimpiada', 'area', 'nivel_categoria'])->get(); // Consulta a la base de datos si no está en caché
            });
            
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
                'id_olimpiada' => 'required|exists:olimpiada,id', // Validar que la olimpiada exista
                'id_area' => 'required|exists:area,id', // Validar que el área exista
                'id_nivel_categoria' => 'required|exists:nivel_categoria,id', // Validar que el nivel/categoría exista
            ]);

            // Crear la configuración de forma controlada
            $configuracion = new Configuracion();
            $configuracion->id_olimpiada = $validated['id_olimpiada'];
            $configuracion->id_area = $validated['id_area'];
            $configuracion->id_nivel_categoria = $validated['id_nivel_categoria'];
            
            $configuracion->save();

            // Elimina la caché para que se actualice en la próxima consulta
            Cache::forget('configuraciones');

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
