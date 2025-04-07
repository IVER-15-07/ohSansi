<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
            // Obtener todos los niveles o categorías
            $nivelescategorias = NivelCategoria::with('grados')->get();

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
                'esNivel' => 'required|boolean', // Validar que esNivel sea un booleano
            ]);

            // Crear la división de forma controlada
            $nivelcategoria = new NivelCategoria();
            $nivelcategoria->nombre = $validated['nombre'];
            $nivelcategoria->esNivel = $validated['esNivel']; // Asignar el valor booleano
            $nivelcategoria->save();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => 'Nivel/Categoria creado exitosamente',
                'data' => $nivelcategoria,
            ], 201);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear la nivel/categoria: ' . $e->getMessage(),
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


