<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PagoController extends Controller
{
    /**
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse
 */
public function guardarPago(Request $request)
{
    try {
        // Validar los datos enviados
        $validated = $request->validate([
            'monto' => 'required|numeric|min:0',
            'fecha_generado' => 'required|date',
            'concepto' => 'required|string|max:255',
            'orden' => 'required|file|mimes:pdf|max:2048', // Validar que sea un archivo PDF
        ]);

        // Guardar el archivo PDF en el almacenamiento
        $rutaPdf = $request->file('orden')->store('pagos', 'public');

        // Insertar el registro en la tabla pago
        $pagoId = DB::table('pago')->insertGetId([
            'monto' => $validated['monto'],
            'fecha_generado' => $validated['fecha_generado'],
            'concepto' => $validated['concepto'],
            'orden' => $rutaPdf, // Guardar la ruta del archivo PDF
        ]);

        // Retornar una respuesta exitosa
        return response()->json([
            'success' => true,
            'message' => 'Pago registrado exitosamente',
            'data' => [
                'id' => $pagoId,
                'monto' => $validated['monto'],
                'fecha_generado' => $validated['fecha_generado'],
                'concepto' => $validated['concepto'],
                'orden' => $rutaPdf,
            ],
        ], 201);
    } catch (\Exception $e) {
        // Manejar errores y retornar una respuesta
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al guardar el pago: ' . $e->getMessage(),
        ], 500);
    }
}
   
}