<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Registro;
use App\Models\Encargado;
use App\Models\Olimpiada;
use App\Models\Pago;
use App\Models\DatoInscripcion;
use Illuminate\Support\Facades\Cache;

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
                'id_encargado' => 'required|exists:encargado,id',
            ]);

            // Crear el registro
            $registro = new Registro();
            $registro->id_encargado = $validated['id_encargado'];
            $registro->id_configuracion = null; // Establecer id_configuracion como null
            $registro->id_pago = null; // Establecer id_pago como null
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

    public function crearRegistrosDesdeExcel(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'registros' => 'required|array',
                'registros.*.nombres' => 'required|string|max:255',
                'registros.*.apellidos' => 'required|string|max:255',
                'registros.*.ci' => 'required|string|max:20|unique:registro,ci',
                'registros.*.id_opcion_inscripcion' => 'required|exists:opcion_inscripcion,id',
                'registros.*.id_encargado' => 'required|exists:encargado,id',
                'registros.*.datos' => 'nullable|array',
                'registros.*.datos.*.id_campo_inscripcion' => 'required|exists:campo_inscripcion,id',
                'registros.*.datos.*.valor' => 'required|string',
            ]);
    
            foreach ($validated['registros'] as $registroData) {
                // Crear el registro del postulante
                $registro = Registro::create([
                    'nombres' => $registroData['nombres'],
                    'apellidos' => $registroData['apellidos'],
                    'ci' => $registroData['ci'],
                    'id_opcion_inscripcion' => $registroData['id_opcion_inscripcion'],
                    'id_encargado' => $registroData['id_encargado'],
                    'id_pago' => null, // No se asocia ningún pago en este paso
                ]);
    
                // Crear los datos de inscripción asociados
                if (!empty($registroData['datos'])) {
                    foreach ($registroData['datos'] as $dato) {
                        DatoInscripcion::create([
                            'id_registro' => $registro->id,
                            'id_campo_inscripcion' => $dato['id_campo_inscripcion'],
                            'valor' => $dato['valor'],
                        ]);
                    }
                }
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Postulantes registrados exitosamente.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al registrar los postulantes: ' . $e->getMessage(),
            ], 500);
        }
    }



    public function obtenerRegistroDesdeExcel()
    {
        try {

            $registros = Cache::remember('registros_excel', 3600, function () {
                return Registro::with(['datos', 'encargado', 'opcion_Inscripcion'])->get();
            });

            return response()->json([
                'success' => true,
                'message' => 'Registros obtenidos exitosamente.',
                'data' => $registros,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los registros: ' . $e->getMessage(),
            ], 500);
        }
    }
}
