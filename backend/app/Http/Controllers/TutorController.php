<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tutor;
use App\Models\RolTutor;


class TutorController extends Controller
{
    public function obtenerTutor(Request $request, $ciTutor)
    {
        try {
            // Intenta obtener las áreas desde la caché
            $tutor = Tutor::where('ci', $ciTutor)->first();

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
                'ci' => 'required||string||max:50||unique:tutor,ci',
            ]);

            // Crear el tutor con nombre normalizado
            $tutor = Tutor::create([
                'nombres' => ucwords(mb_strtolower($validated['nombres'], 'UTF-8')),
                'apellidos' => ucwords(mb_strtolower($validated['apellidos'], 'UTF-8')),
                'ci' => $validated['ci'],
            ]);

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Tutor creado exitosamente.',
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
