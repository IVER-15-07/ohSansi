<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RegistroTutor;


class RegistroTutorController extends Controller
{
    public function obtenerRegistrosTutoresPorRegistro($idRegistro){
        try{
            $registrosTutores = RegistroTutor::with(['tutor'])
                ->where('id_registro', $idRegistro)
                ->get();
            return response()->json([
                'success' => true,
                'data' => $registrosTutores,
            ], 200);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los tutores por registro: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function crearRegistroTutor(Request $request){
        try{
            $validated = $request->validate([
                'id_registro' => 'required|integer|exists:registro,id',
                'id_tutor' => 'required|integer|exists:tutor,id',
                'id_rol_tutor' => 'required|integer|exists:rol_tutor,id',
            ]);

            $registroTutor = RegistroTutor::create([
                'id_registro' => $validated['id_registro'],
                'id_tutor' => $validated['id_tutor'],
                'id_rol_tutor' => $validated['id_rol_tutor'],
            ]);

            return response()->json([
                'success' => true,
                'data' => $registroTutor,
            ], 201);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el registro de tutor: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function eliminarRegistroTutor($idRegistroTutor){
        try{
            $registroTutor = RegistroTutor::findOrFail($idRegistroTutor);
            $registroTutor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Registro de tutor eliminado exitosamente.',
            ], 200);
        }catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'success' => false,
                'message' => 'Registro de tutor no encontrado.',
            ], 404);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el registro de tutor: ' . $e->getMessage(),
            ], 500);
        }
    }
}
