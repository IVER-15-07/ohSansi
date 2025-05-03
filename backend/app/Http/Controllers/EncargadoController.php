<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Encargado;
use \Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class EncargadoController extends Controller
{

    /**
     * Obtener todos los encargados. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerEncargados(Request $request)
    {
        try {
            // Intenta obtener los encargados desde la caché
            $encargados = Cache::remember('encargados', 3600, function () {
                return Encargado::all(); // Consulta a la base de datos si no está en caché
            });
            
            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $encargados,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los encargados: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function verificarEncargado($ci)
    {
        try {
            $encargado = Encargado::where('ci', $ci)->first();

            if ($encargado) {
                return response()->json([
                    'success' => true,
                    'existe' => true,
                    'id' => $encargado->id, // Devolver el ID del encargado
                ], 200);
            } else {
                return response()->json([
                    'success' => true,
                    'existe' => false,
                    'id' => null, // No hay ID porque no existe
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el carnet: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Almacenar un nuevo encargado.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarEncargado(Request $request){
        try{
            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'ci' => 'required|string|max:255|unique:encargado,ci',
                'fecha_nacimiento' => 'required|date',
                'telefono' => 'required|string|max:255|unique:encargado,telefono',
                'correo' => 'required|string|email|max:255|unique:encargado,correo',
            ]);

            // Crear el encargado de forma controlada
            $encargado = Encargado::create([
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'ci' => $validated['ci'],
                'fecha_nacimiento' => $validated['fecha_nacimiento'],
                'telefono' => $validated['telefono'],
                'correo' => $validated['correo'],
            ]);

            // Elimina la caché para que se actualice en la próxima consulta
            Cache::forget('encargados');

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Encargado creado exitosamente', 
                'data' => $encargado,
            ], 201);
        }catch(ValidationException $e){
                // Capturar errores de validación
            $errors = $e->errors();
            // Personalizar el mensaje de error
            $errorMessages = [];
            if (isset($errors['ci'])) {
                $errorMessages[] = 'El número de carnet de identidad ya está registrado.';
            }
            if (isset($errors['telefono'])) {
                $errorMessages[] = 'El número de teléfono ya está registrado.';
            }
            if (isset($errors['correo'])) {
                $errorMessages[] = 'El correo electrónico ya está registrado.';
            }

            return response()->json([
                'success' => false,
                'status' => 'validation_error',
                'message' => implode(' ', $errorMessages), // Combina los mensajes en una sola cadena
            ], 422);
        }catch(\Exception $e){
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el encargado: '.$e->getMessage()
            ], 500);
        }
    }

    public function obtenerEncargado($id)
    {
        $encargado = Encargado::find($id);

        if (!$encargado) {
            return response()->json(['message' => 'Encargado no encontrado'], 404);
        }

        return response()->json($encargado);
    }

    public function obtenerRegistros($idEncargado, $idOlimpiada)
    {
    try {
        // Obtener los registros asociados al encargado y a la olimpiada donde id_pago sea null
        $registros = DB::table('registro')
            ->join('opcion_inscripcion', 'registro.id_opcion_inscripcion', '=', 'opcion_inscripcion.id')
            ->join('area', 'opcion_inscripcion.id_area', '=', 'area.id')
            ->join('nivel_categoria', 'opcion_inscripcion.id_nivel_categoria', '=', 'nivel_categoria.id')
            ->where('registro.id_encargado', $idEncargado)
            ->where('opcion_inscripcion.id_olimpiada', $idOlimpiada) // Filtrar por id_olimpiada
            ->whereNull('registro.id_pago') // Filtrar registros donde id_pago sea null
            ->select(
                'registro.id as id_registro',
                'registro.nombres',
                'registro.apellidos',
                'registro.ci',
                'area.nombre as nombre_area',
                'nivel_categoria.nombre as nombre_nivel_categoria'
            )
            ->get();

        // Retornar una respuesta exitosa con los registros sin agrupar
        return response()->json([
            'success' => true,
            'data' => $registros,
        ], 200);
    } catch (\Exception $e) {
        // Manejar errores y retornar una respuesta
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al obtener los registros: ' . $e->getMessage(),
        ], 500);
    }
    }

}
