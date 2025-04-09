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
     * Obtenemos todas las areas asociadas a una olimpiada en una configuración
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerAreasPorOlimpiada($idOlimpiada)
    {
        try {
            // Obtener las configuraciones filtradas por id_olimpiada y cargar las áreas relacionadas
            $areas = Configuracion::where('id_olimpiada', $idOlimpiada)
            ->with('area') // Carga la relación con el modelo Area
            ->get()
            ->pluck('area')
            ->unique('id')
            ->values(); // Extrae solo las áreas
            
            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $areas,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error las areas de la olimpiada: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Obtenemos un mapa con todas las areas que componen a una olimpiada y sus respectivos niveles/categorias
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerMapaOlimpiada($idOlimpiada)
    {
        try {
            // Obtener las configuraciones filtradas por id_olimpiada y cargar las relaciones necesarias
            $configuraciones = Configuracion::where('id_olimpiada', $idOlimpiada)
                ->with(['area', 'nivel_categoria']) // Carga las relaciones con Area y NivelCategoria
                ->get();

            // Agrupar las configuraciones por área y mapear los niveles/categorías
            $resultado = $configuraciones->groupBy('area.id')->map(function ($items) {
                return $items->pluck('nivel_categoria')->unique('id')->values();
            });

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $resultado,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las áreas y niveles/categorías: ' . $e->getMessage(),
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
