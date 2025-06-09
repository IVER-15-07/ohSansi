<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\NivelCategoria;

class NivelCategoriaController extends Controller
{
    /**
     * Obtener todas los niveles o categorías.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerNivelesCategorias(Request $request)
    {
        try {
            // Intenta obtener los niveles/categorias desde la caché
            $nivelescategorias = Cache::remember('niveles_categorias', 3600, function () {
                return NivelCategoria::with('grados')->get();// Consulta a la base de datos si no está en caché
            });
            
            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $nivelescategorias,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los niveles/categorias: ' . $e->getMessage(),
            ], 500);
        }
    }

    
    /**
     * Almacenar una nueva división.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarNivelCategoria(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'esNivel' => 'required|boolean',
                'grados' => 'array',
                'grados.*' => 'exists:grado,id',
            ]);

            // Verificar si ya existe un nivel/categoría con el mismo nombre (ignorando mayúsculas/minúsculas)
            $existe = NivelCategoria::whereRaw('LOWER(nombre) = ?', [strtolower($validated['nombre'])])->first();
            if ($existe) {
                return response()->json([
                    'success' => false,
                    'status' => 'error',
                    'message' => 'Ya existe un nivel/categoría con ese nombre.',
                ], 409);
            }

            // Crear el nivel/categoría
            $nivelcategoria = new NivelCategoria();
            $nivelcategoria->nombre = $validated['nombre'];
            $nivelcategoria->esNivel = $validated['esNivel'];
            $nivelcategoria->save();

            // Asociar los grados si es un nivel y se enviaron grados
            if (isset($validated['grados'])) {
                $nivelcategoria->grados()->sync($validated['grados']);
            }

            // Elimina la caché para que se actualice en la próxima consulta
            Cache::forget('niveles_categorias');

            // Retornar una respuesta exitosa con los grados asociados
            return response()->json([
                'success' => true,
                'message' => 'Nivel/Categoria creado exitosamente',
                'data' => $nivelcategoria->load('grados'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el nivel/categoria: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Asociar grados a un nivel/categoría.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function asociarGrados(Request $request, $idNivelCategoria)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'grados' => 'required|array', // Debe ser un array de IDs de grados
                'grados.*' => 'exists:grado,id', // Cada ID debe existir en la tabla `grado`
            ]);

            // Encontrar el nivel/categoría
            $nivelCategoria = NivelCategoria::findOrFail($idNivelCategoria);

            // Asociar los grados al nivel/categoría
            $nivelCategoria->grados()->sync($validated['grados']); // Sincroniza los grados

            // Elimina la caché para que se actualice en la próxima consulta
            Cache::forget('niveles_categorias');
            return response()->json([
                'success' => true,
                'message' => 'Grados asociados correctamente al nivel/categoría.',
                'data' => $nivelCategoria->grados, // Retorna los grados asociados
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al asociar los grados: ' . $e->getMessage(),
            ], 500);
        }
    }


}


