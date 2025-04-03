<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NivelCategoria;

class NivelCategoriaController extends Controller
{
    /**
     * Obtener todas las divisiones.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerNivelCategoria(Request $request)
    {
        try {
            // Obtener todos los niveles o categorías
            $nivelescategorias = NivelCategoria::all();

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
}
