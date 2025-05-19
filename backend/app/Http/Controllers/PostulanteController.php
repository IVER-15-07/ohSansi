<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Postulante;
use Illuminate\Validation\ValidationException;

class PostulanteController extends Controller
{
    /**
     * Obtener un postulante por su CI
     *
     * @param string $ci
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerPostulantePorCI($ci)
    {
        try {
            // Validar el parámetro CI
            if (strlen($ci) > 20) {
                return response()->json([
                    'success' => false,
                    'message' => 'El CI no puede exceder los 20 caracteres.',
                ], 422);
            }

            // Buscar el postulante por su CI
            $postulante = Postulante::where('ci', $ci)->first();

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $postulante,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el postulante: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function crearPostulante(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'ci' => 'required|string|max:20|unique:postulante,ci',
                'nombres' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'fecha_nacimiento' => 'required|date',
            ]);

            $postulante = Postulante::create([
                'ci' => $validated['ci'],
                'nombres' => ucfirst(mb_strtolower($validated['nombres'], 'UTF-8')),
                'apellidos' => ucfirst(mb_strtolower($validated['apellidos'], 'UTF-8')),
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
            ]);

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Postulante creado exitosamente.',
                'data' => $postulante,
            ], 201);

        } catch (ValidationException $e) {
            // Captura errores de validación y retorna un mensaje concreto
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el postulante: ' . $e->getMessage()
            ], 500);
        }
    }
}
