<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tutor;
use App\Models\Persona;
use App\Models\RolTutor;


class TutorController extends Controller
{
    public function obtenerTutor($ciTutor)
    {
        try {
            // Intenta obtener las áreas desde la caché
            $persona = Persona::where('ci', $ciTutor)->first();
            if (!$persona) {
                return response()->json([
                    'success' => true,
                    'message' => 'Persona no encontrada',
                    'data' => null,
                ], 200);
            }

            $tutor = Tutor::where('id_persona', $persona->id)->with(['persona'])->first();

            return response()->json([
                'success' => true,
                'data' => $tutor,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener el tutor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function obtenerRoles(Request $request)
    {
        try {
            $roles = RolTutor::all();

            return response()->json([
                'success' => true,
                'data' => $roles,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los roles de un tutor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function almacenarTutor(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'nombres' => 'required|string|max:50',
                'apellidos' => 'required|string|max:50',
                'ci' => 'required||string||max:50',
            ]);

            $persona = Persona::firstOrCreate(
                ['ci' => $validated['ci']],
                [
                    'nombres' => $validated['nombres'],
                    'apellidos' => $validated['apellidos']
                ]
            );

            if (Tutor::where('id_persona', $persona->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'status' => 'validation_error',
                    'message' => 'El tutor ya está registrado.',
                ], 422);
            }

            $tutor = Tutor::create([
                'id_persona' => $persona->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tutor creado exitosamente',
                'data' => $tutor,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el tutor: ' . $e->getMessage()
            ], 500);
        }
    }
}
