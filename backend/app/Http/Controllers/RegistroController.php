<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Registro;
use App\Models\Encargado;
use App\Models\Olimpiada;
use App\Models\Pago;

class RegistroController extends Controller
{
    /**
     * Almacenar un nuevo registro. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function crearRegistro(Request $request)
    {
      try {
        // Validar los datos enviados
        $validated = $request->validate([
            'nombres' => 'required|string|max:255',	
            'apellidos' => 'required|string|max:255',
            'ci' => 'required|string|max:255',
            'id_opcion_inscripcion' => 'required|exists:opcion_inscripcion,id',
            'id_encargado' => 'required|exists:encargado,id'
        ]);

        // Crear el registro
        $registro = new Registro();
        $registro->nombres = $validated['nombres'];
        $registro->apellidos = $validated['apellidos'];
        $registro->ci = $validated['ci'];
        $registro->id_opcion_inscripcion = $validated['id_opcion_inscripcion']; 
        $registro->id_encargado = $validated['id_encargado'];
        $registro->id_pago = null; // Inicialmente no hay pago asociado
        $registro->save(); // Guardar el registro en la base de datos

        // Retornar una respuesta exitosa con los grados asociados
        return response()->json([
            'success' => true,
            'message' => 'Registro creado exitosamente',
            'data' => $registro, 
        ], 201);
    } catch (\Exception $e) {
        // Manejar errores y retornar una respuesta
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al crear el registro: ' . $e->getMessage(),
        ], 500);
    }
    }


    public function validarComprobante(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'olimpiada' => 'required|string',
            'monto' => 'required|string',
        ]);
    
        // Buscar encargado
        $encargado = Encargado::where('nombre', 'ilike', $request->nombre)
            ->where('apellido', 'ilike', $request->apellido)
            ->first();
    
        if (!$encargado) {
            return response()->json(['error' => 'Encargado no encontrado'], 404);
        }
    
        // Buscar olimpiada
        $olimpiada = Olimpiada::where('nombre', 'ilike', $request->olimpiada)->first();
        if (!$olimpiada) {
            return response()->json(['error' => 'Olimpiada no encontrada'], 404);
        }
    
        // Buscar pago por monto y estado
        $pago = Pago::where('monto', $request->monto)
            ->where('estado', false)
            ->first();
    
        if (!$pago) {
            return response()->json(['error' => 'Pago no encontrado o ya validado'], 404);
        }
    
        // Buscar registro con los tres IDs
        $registro = Registro::where('id_encargado', $encargado->id)
            ->where('id_olimpiada', $olimpiada->id)
            ->where('id_pago', $pago->id)
            ->first();
    
        if (!$registro) {
            return response()->json(['error' => 'Registro no encontrado con esos datos'], 404);
        }
    
        return response()->json([
            'success' => true,
            'registro' => $registro,
        ]);
    }
    

}
