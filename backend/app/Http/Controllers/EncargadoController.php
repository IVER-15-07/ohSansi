<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Encargado;
use \Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Models\Persona;

class EncargadoController extends Controller
{

    /**
     * Obtener todos los encargados. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerEncargados(Request $request)
    {
        try {
            $encargados = Cache::remember('encargados', 3600, function () {
                return Encargado::with('persona')->get();
            });

            return response()->json([
                'success' => true,
                'data' => $encargados,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los encargados: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function verificarEncargado($ci)
    {
        try {
            // Buscar persona por ci
            $persona = Persona::where('ci', $ci)->first();
            if ($persona) {
                $encargado = Encargado::where('id_persona', $persona->id)->first();
                if ($encargado) {
                    return response()->json([
                        'success' => true,
                        'existe' => true,
                        'id' => $encargado->id,
                    ], 200);
                }
            }
            return response()->json([
                'success' => true,
                'existe' => false,
                'id' => null,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el carnet: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Almacenar un nuevo encargado.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarEncargado(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'ci' => 'required|string|max:255',
                'fecha_nacimiento' => 'required|date',
                'correo' => 'required|string|email|max:255|unique:encargado,correo',
            ]);

            $persona = Persona::firstOrCreate(
                ['ci' => $validated['ci']],
                [
                    'nombres' => $validated['nombre'],
                    'apellidos' => $validated['apellido'],
                    'fecha_nacimiento' => $validated['fecha_nacimiento'],
                ]
            );

            if (Encargado::where('id_persona', $persona->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'status' => 'validation_error',
                    'message' => 'El encargado ya está registrado.',
                ], 422);
            }

            $encargado = Encargado::create([
                'id_persona' => $persona->id,
                'correo' => $validated['correo'],
            ]);

            Cache::forget('encargados');

            return response()->json([
                'success' => true,
                'message' => 'Encargado creado exitosamente',
                'data' => $encargado,
            ], 201);
        } catch (ValidationException $e) {
            $errors = $e->errors();
            $errorMessages = [];
            if (isset($errors['correo'])) {
                $errorMessages[] = 'El correo electrónico ya está registrado.';
            }
            return response()->json([
                'success' => false,
                'status' => 'validation_error',
                'message' => implode(' ', $errorMessages),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el encargado: ' . $e->getMessage()
            ], 500);
        }
    }


    public function obtenerEncargado($id)
    {
        $encargado = Encargado::with('persona')->find($id);

        if (!$encargado) {
            return response()->json(['message' => 'Encargado no encontrado'], 404);
        }

        return response()->json($encargado);
    }
}
