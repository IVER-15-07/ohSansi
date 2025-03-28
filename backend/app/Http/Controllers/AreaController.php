<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;

class AreaController extends Controller
{
    public function almacenar(Request $request)
    {
        // Validar los datos enviados
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        // Crear el área
        $area = Area::create([
            'nombre' => $validated['nombre'],
        ]);

        // Retornar una respuesta
        return response()->json(['message' => 'Área creada exitosamente', 'area' => $area], 201);
    }
}
