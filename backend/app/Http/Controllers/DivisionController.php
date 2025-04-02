<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Division;

class DivisionController extends Controller
{
    /**
     * Obtener todas las divisiones.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerDivisiones(Request $request)
    {
        try {
            // Obtener todas las divisiones
            $divisiones = Division::all();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $divisiones,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las divisiones: ' . $e->getMessage(),
            ], 500);
        }
    }

    
    /**
     * Almacenar una nueva división.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarDivision(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'tipo_division_id' => 'required|exists:tipo_division,id', // Validar que el tipo de división exista
            ]);

            // Crear la división de forma controlada
            $division = new Division();
            $division->nombre = $validated['nombre'];
            $division->tipo_division_id = $validated['tipo_division_id']; // Asignar explícitamente la clave foránea
            $division->save();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => 'División creada exitosamente',
                'data' => $division,
            ], 201);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear la división: ' . $e->getMessage(),
            ], 500);
        }
    }
}
