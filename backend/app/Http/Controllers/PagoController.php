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
   
    public function obtenerIdPago(Request $request)
    {
    try {
        // Validar los datos enviados
        $validated = $request->validate([
            'monto' => 'required|numeric|min:0',
            'fecha_generado' => 'required|date',
            'concepto' => 'required|string|max:255',
        ]);

        // Buscar el ID del pago en la base de datos
        $pago = DB::table('pago')
            ->where('monto', $validated['monto'])
            ->where('fecha_generado', $validated['fecha_generado'])
            ->where('concepto', $validated['concepto'])
            ->first();

        // Verificar si se encontró el pago
        if (!$pago) {
            return response()->json([
                'success' => false,
                'message' => 'Pago no encontrado',
            ], 404);
        }

        // Retornar el ID del pago
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $pago->id,
            ],
        ], 200);
    } catch (\Exception $e) {
        // Manejar errores y retornar una respuesta
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al obtener el ID del pago: ' . $e->getMessage(),
        ], 500);
    }
    }

    public function agregarPago(Request $request)
    {
    try {
        // Validar los datos enviados
        $validated = $request->validate([
            'id_encargado' => 'required|integer|exists:encargado,id',
            'id_pago' => 'required|integer|exists:pago,id',
        ]);

        // Actualizar los registros asociados al encargado donde id_pago sea null
        $registrosActualizados = DB::table('registro')
            ->where('id_encargado', $validated['id_encargado'])
            ->whereNull('id_pago') // Solo actualizar registros donde id_pago sea null
            ->update(['id_pago' => $validated['id_pago']]);

        // Retornar una respuesta exitosa
        return response()->json([
            'success' => true,
            'message' => 'Pago agregado exitosamente a los registros.',
            'data' => [
                'id_encargado' => $validated['id_encargado'],
                'id_pago' => $validated['id_pago'],
                'registros_actualizados' => $registrosActualizados,
            ],
        ], 200);
    } catch (\Exception $e) {
        // Manejar errores y retornar una respuesta
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al agregar el pago: ' . $e->getMessage(),
        ], 500);
    }
    }

    public function obtenerOrdenDePago(Request $request)
    {
    try {
        // Validar el ID del encargado
        $validated = $request->validate([
            'id_encargado' => 'required|integer|exists:encargado,id',
        ]);

        // Obtener los id_pago asociados al id_encargado desde la tabla registro
        $idPagos = DB::table('registro')
            ->where('id_encargado', $validated['id_encargado'])
            ->whereNotNull('id_pago') // Solo registros con id_pago no nulo
            ->distinct() // Eliminar duplicados
            ->pluck('id_pago');

        if ($idPagos->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontraron pagos asociados al encargado.',
            ], 404);
        }

        // Consultar la tabla pago para obtener las órdenes pendientes
        $ordenesPendientes = DB::table('pago')
            ->whereIn('id', $idPagos)
            ->whereNull('fecha_pago') // Solo pagos con fecha_pago vacía
            ->get(['id', 'orden', 'monto', 'fecha_generado', 'concepto']);

        if ($ordenesPendientes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontraron órdenes de pago pendientes.',
            ], 404);
        }

        // Construir la respuesta con las rutas completas de las órdenes
        $ordenes = $ordenesPendientes->map(function ($orden) {
            return [
                'id_pago' => $orden->id,
                'monto' => $orden->monto,
                'fecha_generado' => $orden->fecha_generado,
                'concepto' => $orden->concepto,
                'orden' => asset('storage/' . $orden->orden), // Generar URL completa
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $ordenes,
        ], 200);
    } catch (\Exception $e) {
        // Manejar errores y retornar una respuesta
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al obtener las órdenes de pago: ' . $e->getMessage(),
        ], 500);
    }
    }

}