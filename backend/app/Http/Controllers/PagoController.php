<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PagoController extends Controller
{
    /**
 * @param \Illuminate\Http\Request $request
 * @return \Illuminate\Http\JsonResponse
 */
 

    public function obtenerOrdenesDePago($idEncargado, $idOlimpiada)
    {
        try {
            // Validar que el encargado exista
            $encargadoExiste = DB::table('encargado')->where('id', $idEncargado)->exists();
            if (!$encargadoExiste) {
                return response()->json([
                    'success' => false,
                    'message' => 'Encargado no encontrado.',
                ], 404);
            }

            // Validar que la olimpiada exista
            $olimpiadaExiste = DB::table('olimpiada')->where('id', $idOlimpiada)->exists();
            if (!$olimpiadaExiste) {
                return response()->json([
                    'success' => false,
                    'message' => 'Olimpiada no encontrada.',
                ], 404);
            }
    
            // Obtener los id_pago asociados al id_encargado y al id_olimpiada desde la tabla inscripcion
            $idPagos = DB::table('inscripcion')
                ->join('opcion_inscripcion', 'inscripcion.id_opcion_inscripcion', '=', 'opcion_inscripcion.id')
                ->join('registro', 'inscripcion.id_registro', '=', 'registro.id')
                ->where('registro.id_encargado', $idEncargado)
                ->where('opcion_inscripcion.id_olimpiada', $idOlimpiada) // Filtrar por id_olimpiada en la tabla opcion_inscripcion
                ->where('registro.id_olimpiada', $idOlimpiada) // Filtrar por id_olimpiada en la tabla registro
                ->whereNotNull('inscripcion.id_pago') // Solo registros con id_pago no nulo
                ->distinct() // Eliminar duplicados
                ->pluck('inscripcion.id_pago');
    
            if ($idPagos->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron pagos asociados al encargado para la olimpiada especificada.',
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

    public function generarDatosDeOrden(Request $request)
    {
        try {
        // Validar los datos enviados
        $validated = $request->validate([
            'id_encargado' => 'required|integer|exists:encargado,id',
            'id_olimpiada' => 'required|integer|exists:olimpiada,id',
            'registros' => 'required|array|min:1',
            'registros.*' => 'integer|exists:inscripcion,id',
        ]);

        $idEncargado = $validated['id_encargado'];
        $idOlimpiada = $validated['id_olimpiada'];
        $registros = $validated['registros'];

        // Obtener el ID del encargado y su información
        $encargado = DB::table('encargado')->where('id', $idEncargado)->first();
        if (!$encargado) {
            return response()->json(['success' => false, 'message' => 'Encargado no encontrado.'], 404);
        }

        // Obtener el nombre de la olimpiada
        $olimpiada = DB::table('olimpiada')->where('id', $idOlimpiada)->first();
        if (!$olimpiada) {
            return response()->json(['success' => false, 'message' => 'Olimpiada no encontrada.'], 404);
        }

        // Generar el ID de la orden de pago
        $ultimoPago = DB::table('pago')->orderBy('id', 'desc')->first();
        $idPago = $ultimoPago ? $ultimoPago->id + 1 : 1;

        // Obtener las inscripciones seleccionadas y sus detalles
        $detalles = DB::table('inscripcion')
            ->join('opcion_inscripcion', 'inscripcion.id_opcion_inscripcion', '=', 'opcion_inscripcion.id')
            ->join('registro', 'inscripcion.id_registro', '=', 'registro.id')
            ->join('postulante', 'registro.id_postulante', '=', 'postulante.id')
            ->join('area', 'opcion_inscripcion.id_area', '=', 'area.id')
            ->join('nivel_categoria', 'opcion_inscripcion.id_nivel_categoria', '=', 'nivel_categoria.id')
            ->join('grado', 'registro.id_grado', '=', 'grado.id')
            ->whereIn('inscripcion.id', $registros)
            ->select(
                'postulante.nombres as nombres',
                'postulante.apellidos as apellidos',
                'area.nombre as nombre_area',
                'nivel_categoria.nombre as nombre_nivel_categoria',
                'grado.nombre as grado'
            )
            ->get();

        // Generar el detalle concatenado
        $detalle = $detalles->map(function ($item) {
            return "inscripción: {$item->nombres} {$item->apellidos} - {$item->nombre_area} ({$item->nombre_nivel_categoria}) - {$item->grado}";
        })->join(', ');

        // Calcular la cantidad, precio por unidad e importe total
        $cantidad = count($registros);
        $costoPorUnidad = $olimpiada->costo;
        $importeTotal = $cantidad * $costoPorUnidad;

        // Convertir el importe total a literal
        $importeEnLiteral = $this->convertirNumeroALiteral($importeTotal);

        // Obtener la fecha actual en formato aaaa-mm-dd
        $fechaPago = now()->format('Y-m-d');

        // Construir los datos de la orden de pago
        $datosOrden = [
            'id_pago' => $idPago,
            'nombre_completo_encargado' => $encargado->nombre . ' ' . $encargado->apellido,
            'ci_encargado' => $encargado->ci,
            'nombre_olimpiada' => $olimpiada->nombre,
            'cantidad' => $cantidad,
            'concepto' => "Decanato - Olimpiada de Ciencias ({$olimpiada->nombre})",
            'detalle' => $detalle,
            'precio_por_unidad' => $costoPorUnidad,
            'importe_total' => $importeTotal,
            'importe_en_literal' => $importeEnLiteral,
            'fecha_pago' => $fechaPago,
        ];

        // Retornar los datos generados
        return response()->json([
            'success' => true,
            'data' => $datosOrden,
        ], 200);
        } catch (\Exception $e) {
        // Manejar errores y retornar una respuesta
        return response()->json([
            'success' => false,
            'message' => 'Error al generar los datos de la orden de pago: ' . $e->getMessage(),
        ], 500);
        }
    }

    private function convertirNumeroALiteral($numero)
    {
        $formatter = new \NumberFormatter('es', \NumberFormatter::SPELLOUT);
        return ucfirst($formatter->format($numero)) . ' Bolivianos';
    }

    public function guardarOrdenPago(Request $request)
    {
        try {

            $validated = $request->validate([
                'id' => 'required|integer|unique:pago,id', // Validar que el ID sea único en la tabla pago
                'monto' => 'required|numeric|min:0', // Validar que el monto sea un número positivo
                'fecha_generado' => 'required|date', // Validar que sea una fecha válida
                'concepto' => 'required|string|max:1000', // Validar que el concepto sea un string
                'orden' => 'required|file|mimes:pdf|max:4096', // Validar que sea un archivo PDF de máximo 4MB
                'registros' => 'required|array|min:1', // Validar que sea un arreglo
                'registros.*' => 'integer|exists:inscripcion,id', // Validar que los elementos del arreglo existan
            ]);

            // Guardar el archivo PDF en el almacenamiento
            $rutaOrden = $request->file('orden')->store('ordenes', 'public');

            // Insertar los datos en la tabla pago
            DB::table('pago')->insert([
                'id' => $validated['id'],
                'monto' => $validated['monto'],
                'fecha_generado' => $validated['fecha_generado'],
                'concepto' => $validated['concepto'],
                'orden' => $rutaOrden,
            ]);

            // Actualizar la columna id_pago en la tabla inscripcion para los registros seleccionados
            DB::table('inscripcion')
                ->whereIn('id', $validated['registros'])
                ->update(['id_pago' => $validated['id']]);

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => 'Orden de pago guardada exitosamente y registros actualizados.',
                'data' => [
                    'id' => $validated['id'],
                    'monto' => $validated['monto'],
                    'fecha_generado' => $validated['fecha_generado'],
                    'concepto' => $validated['concepto'],
                    'orden' => asset('storage/' . $rutaOrden),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar la orden de pago: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerPagoAsociado(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'id' => 'required|integer|exists:pago,id',
                'nombre_completo' => 'required|string',
                'monto' => 'required|numeric|min:0',
            ]);

            // Separar el nombre completo en nombre(s) y apellido(s)
            $nombreSeparado = $this->separarNombreCompleto($validated['nombre_completo']);
            $nombre = $nombreSeparado['nombre'];
            $apellido = $nombreSeparado['apellido'];

            // Buscar el ID del encargado
            $encargado = DB::table('encargado')
                ->where('nombre', $nombre)
                ->where('apellido', $apellido)
                ->first();

            if (!$encargado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Encargado no encontrado.',
                ], 404);
            }

            // Verificar si el pago coincide con los datos proporcionados
            $pago = DB::table('pago')
                ->where('id', $validated['id'])
                ->where('monto', $validated['monto'])
                ->first();

            if (!$pago) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró un pago que coincida con los criterios proporcionados.',
                ], 404);
            }

            // Verificar si el comprobante ya está validado (fecha_pago no es nula)
            if (!is_null($pago->fecha_pago)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El comprobante de pago ya está validado.',
                ], 400);
            }

            // Retornar los datos del pago encontrado
            return response()->json([
                'success' => true,
                'data' => [
                    'id_pago' => $pago->id,
                    'monto' => $pago->monto,
                    'concepto' => $pago->concepto,
                    'fecha_generado' => $pago->fecha_generado,
                ],
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener el pago asociado: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function separarNombreCompleto($nombreCompleto)
    {
        $partes = explode(' ', trim($nombreCompleto));
        $cantidadPartes = count($partes);

        if ($cantidadPartes === 2) {
            return [
                'nombre' => $partes[0],
                'apellido' => $partes[1],
            ];
        } elseif ($cantidadPartes === 3) {
            return [
                'nombre' => $partes[0],
                'apellido' => $partes[1] . ' ' . $partes[2],
            ];
        } elseif ($cantidadPartes === 4) {
            return [
                'nombre' => $partes[0] . ' ' . $partes[1],
                'apellido' => $partes[2] . ' ' . $partes[3],
            ];
        } else {
            throw new \Exception('El nombre completo debe tener entre 2 y 4 palabras.');
        }
    }

    public function validarComprobantePago(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'id_pago' => 'required|integer|exists:pago,id',
                'comprobante' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048', // Validar formatos y tamaño
            ]);

            // Buscar el registro en la tabla pago
            $pago = DB::table('pago')->where('id', $validated['id_pago'])->first();

            if (!$pago) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pago no encontrado.',
                ], 404);
            }

            // Guardar el archivo del comprobante en el almacenamiento
            $rutaComprobante = $request->file('comprobante')->store('comprobantes', 'public');

            // Actualizar la tabla pago con la ruta del comprobante y la fecha de pago actual
            DB::table('pago')
                ->where('id', $validated['id_pago'])
                ->update([
                    'comprobante' => $rutaComprobante,
                    'fecha_pago' => now(), // Fecha actual
                ]);

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'message' => 'Comprobante de pago validado y guardado exitosamente.',
                'data' => [
                    'id_pago' => $validated['id_pago'],
                    'comprobante' => asset('storage/' . $rutaComprobante), // Generar URL completa
                    'fecha_pago' => now()->format('Y-m-d'), // Fecha actual en formato aaaa-mm-dd
                ],
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al validar el comprobante de pago: ' . $e->getMessage(),
            ], 500);
        }
    }
}