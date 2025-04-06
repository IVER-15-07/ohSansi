<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Encargado;

class EncargadoController extends Controller
{
    /**
     * Almacenar un nuevo encargado.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarEncargado(Request $request){
        try{
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'ci' => 'required|string|max:255|unique:encargado,ci',
                'fecha_nacimiento' => 'required|date',
                'telefono' => 'required|string|max:255|unique:encargado,telefono',
                'correo' => 'required|string|email|max:255|unique:encargado,correo',
            ]);

            // Crear la olimpiada de forma controlada
            $encargado = Encargado::create([
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'ci' => $validated['ci'],
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'telefono' => $validated['telefono'],
                'correo' => $validated['correo'],
            ]);

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Encargado creado exitosamente', 
                'data' => $encargado,
            ], 201);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el encargado: '.$e->getMessage()
            ], 500);
        }
    }
}
