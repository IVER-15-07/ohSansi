<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\OpcionInscripcion; 

class OpcionInscripcionController extends Controller
{

    /**
     * Obtenemos todas las opciones de inscripcion de una olimpiada
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerOpcionesInscripcion($idOlimpiada)
    {
        try {
            // Obtener las opciones de inscripcion filtradas por id_olimpiada y cargar las relaciones necesarias
            $opciones_inscripcion= OpcionInscripcion::where('id_olimpiada', $idOlimpiada)
                ->with(['area', 'nivel_categoria.grados']) // Carga las relaciones con Area y NivelCategoria
                ->get();

            // Agrupar las configuraciones por área y mapear los niveles/categorías
            $resultado = $opciones_inscripcion->groupBy('area.id')->map(function ($items, $areaId) {
                $areaNombre = $items->first()->area->nombre; // Obtener el nombre del área
                return [
                    'id' => $areaId, // ID del área
                    'nombre' => $areaNombre, // Nombre del área
                    'niveles_categorias' => $items->map(function ($item) {
                        return [
                            'id_opcion_inscripcion' => $item->id, // ID de OpcionInscripcion
                            'id_nivel_categoria' => $item->nivel_categoria->id,
                            'nombre' => $item->nivel_categoria->nombre,
                        ];
                    })->unique('id_nivel_categoria')->values(),
                ];
            })->values();

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
     * Obtenemos todas las areas asociadas a una olimpiada
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerAreasPorOlimpiada($idOlimpiada)
    {
        try {
            // Obtener las configuraciones filtradas por id_olimpiada y cargar las áreas relacionadas
            $areas = OpcionInscripcion::where('id_olimpiada', $idOlimpiada)
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
                'message' => 'Error al obtnerner las areas de dicha olimpiada: ' . $e->getMessage(),
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
            // Obtener las opciones de inscripcion filtradas por id_olimpiada y cargar las relaciones necesarias
            $opciones_inscripcion= OpcionInscripcion::where('id_olimpiada', $idOlimpiada)
                ->with(['area', 'nivel_categoria.grados']) // Carga las relaciones con Area y NivelCategoria
                ->get();

            // Agrupar las configuraciones por área y mapear los niveles/categorías
            $resultado = $opciones_inscripcion->groupBy('area.id')->map(function ($items) {
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
     * Almacenar una nueva opcion de inscripción. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarOpcionInscripcion(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'id_olimpiada' => 'required|exists:olimpiada,id', // Validar que la olimpiada exista
                'id_area' => 'required|exists:area,id', // Validar que el área exista
                'id_nivel_categoria' => 'required|exists:nivel_categoria,id', // Validar que el nivel/categoría exista
            ]);

            // Crear la configuración de forma controlada
            $opcion_inscripcion = new OpcionInscripcion();
            $opcion_inscripcion->id_olimpiada = $validated['id_olimpiada'];
            $opcion_inscripcion->id_area = $validated['id_area'];
            $opcion_inscripcion->id_nivel_categoria = $validated['id_nivel_categoria'];
            
            $opcion_inscripcion->save();

            // Elimina la caché para que se actualice en la próxima consulta
            Cache::forget('opciones_inscripcion');

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => 'Opcion de Inscripcion creada exitosamente',
                'data' => $opcion_inscripcion,
            ], 201);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear la opcion de inscripcion: ' . $e->getMessage(),
            ], 500);
        }
    }

    
    /**
     * Eliminar todas las configuraciones de una olimpiada.
     *
     * @param int $idOlimpiada
     * @return \Illuminate\Http\JsonResponse
     */
    public function eliminarOpcionesIncripcionPorOlimpiada($idOlimpiada)
    {
        try {
            // Eliminar las configuraciones asociadas a la olimpiada
            $deleted = OpcionInscripcion::where('id_olimpiada', $idOlimpiada)->delete();

            // Elimina la caché para que se actualice en la próxima consulta
            Cache::forget('opciones_inscripcion');

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => "Se eliminaron $deleted opciones de inscripcion asociadas a la olimpiada.",
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al eliminar las opciones de inscripcion de dicha olimpiada: ' . $e->getMessage(),
            ], 500);
        }
    }
    
}
