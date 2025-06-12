<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Administrador;

class AuthController extends Controller
{
    /**
     * Login de administrador
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'usuario' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Administrador::where('usuario', $validated['usuario'])->first();
        if (!$admin || !Hash::check($validated['password'], $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos.'
            ], 401);
        }
        // Puedes generar un token aquí si usas Sanctum/JWT, por ahora solo retorna success
        $token = $admin->createToken('admin-token')->plainTextToken;
        return response()->json([
            'success' => true,
            'token' => $token,
            'message' => 'Login exitoso',
        ]);
    }
}