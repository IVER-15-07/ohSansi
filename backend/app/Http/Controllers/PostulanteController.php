<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Postulante;
use App\Models\Persona;
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
            $persona = Persona::where('ci', $ci)->first();
            if (!$persona) {
                return response()->json([
                    'success' => true,
                    'message' => 'Persona no encontrada',
                    'data' => null,
                ], 200);
            }

            $postulante = Postulante::where('id_persona', $persona->id)->with(['persona'])->first();
            return response()->json([
                'success' => true,
                'message' => $postulante ? 'Postulante encontrado exitosamente' : 'Postulante no encontrado',
                'data' => $postulante,
            ], 200);
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
                'nombres' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'ci' => 'required|string|max:255',
                'fecha_nacimiento' => 'required|date',
            ]);

            $persona = Persona::firstOrCreate(
                ['ci' => $validated['ci']],
                [
                    'nombres' => $validated['nombres'],
                    'apellidos' => $validated['apellidos'],
                    'fecha_nacimiento' => $validated['fecha_nacimiento'],
                ]
            );
            // Si la persona ya existía y su fecha de nacimiento es null, actualizarla
            if ($persona->wasRecentlyCreated === false && $persona->fecha_nacimiento === null) {
                $persona->fecha_nacimiento = $validated['fecha_nacimiento'];
                $persona->save();
            }

            if (Postulante::where('id_persona', $persona->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'status' => 'validation_error',
                    'message' => 'El encargado ya está registrado.',
                ], 422);
            }

            $postulante = Postulante::create([
                'id_persona' => $persona->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Postulante creado exitosamente',
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
