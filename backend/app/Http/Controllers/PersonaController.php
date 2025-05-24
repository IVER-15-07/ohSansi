<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Persona;

class PersonaController extends Controller
{
    public function verificarPersona($ci)
    {
        try {
            // Buscar persona por ci
            $persona = Persona::where('ci', $ci)->first();

            return response()->json([
                'success' => true,
                'existe' => false,
                'data' => $persona,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar la existencia de la persona: ' . $e->getMessage(),
            ], 500);
        }
    }
}
