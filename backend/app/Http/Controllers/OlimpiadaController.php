<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Olimpiada;

class OlimpiadaController extends Controller
{
    /**
     * Obtener todas las olimpiadas.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerOlimpiadas(Request $request)
    {
        try {
            // Intenta obtener las olimpiadas desde la caché
            $olimpiadas = Cache::remember('olimpiadas', 3600, function () {
                return Olimpiada::all(); // Consulta a la base de datos si no está en caché
            });

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $olimpiadas,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las olimpiadas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener todas las olimpiadas activas. 
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerOlimpiadasActivas(Request $request)
    {
         try {
        // Primero, actualiza el estado de las olimpiadas vencidas
        Olimpiada::where('activo', true)
            ->whereDate('fecha_fin', '<', now())
            ->update(['activo' => false]);

        // Limpia la caché antes de guardar el nuevo resultado
        Cache::forget('olimpiadasActivas');

        // Guarda en caché las olimpiadas activas actualizadas
        $olimpiadasActivas = Cache::remember('olimpiadasActivas', 3600, function () {
            return Olimpiada::where('activo', true)->get();
        });

        return response()->json([
            'success' => true,
            'data' => $olimpiadasActivas,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al obtener las olimpiadas activas: ' . $e->getMessage(),
        ], 500);
    }
    }



    public function activarOlimpiada($id)
    {
        try {
            $olimpiada = Olimpiada::find($id);

            if (!$olimpiada) {
                return response()->json([
                    'success' => false,
                    'message' => 'Olimpiada no encontrada',
                ], 404);
            }

            $hoy = now()->toDateString();

            // Verifica si la fecha actual está en el rango permitido
            if ($olimpiada->fecha_inicio <= $hoy && $olimpiada->fecha_fin >= $hoy) {
                $olimpiada->activo = true;
                $olimpiada->save();

                // Limpiar caché
                Cache::forget('olimpiadas');
                Cache::forget('olimpiadasActivas');

                return response()->json([
                    'success' => true,
                    'message' => 'Olimpiada activada correctamente',
                    'data' => $olimpiada,
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede activar la olimpiada fuera del rango de fechas',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al activar la olimpiada: ' . $e->getMessage(),
            ], 500);
        }
    }














    /**
     * Almacenar una nueva olimpiada.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarOlimpiada(Request $request)
    {
        try {
            // Definir reglas base de validación
            $rules = [
                'nombre' => 'required|string|max:255',
                'convocatoria' => 'nullable|file|mimes:pdf|max:2048',
                'descripcion' => 'nullable|string|max:255',
                'costo' => 'nullable|numeric',
                'max_areas' => 'nullable|integer',
                'fecha_inicio' => [
                    'required',
                    'date',
                    'after_or_equal:today', // Validar que la fecha de inicio sea mayor o igual a hoy
                ],
                'fecha_fin' => [
                    'required',
                    'date',
                    'after_or_equal:fecha_inicio', // Validar que la fecha de fin sea mayor o igual a la fecha de inicio
                    'after_or_equal:today', // Validar que la fecha de fin sea mayor o igual a hoy
                ],
                'inicio_inscripcion' => [
                    'nullable',
                    'date',
                    'after_or_equal:today', // Solo validar si se proporciona
                    'before_or_equal:fecha_fin', // Solo validar si se proporciona
                ],
                'fin_inscripcion' => [
                    'nullable',
                    'date',
                    'after_or_equal:today', // Solo validar si se proporciona
                    'before_or_equal:fecha_fin', // Solo validar si se proporciona
                ],
            ];

            // Si se proporciona inicio_inscripcion, validar que fin_inscripcion sea posterior
            if ($request->filled('inicio_inscripcion') && $request->filled('fin_inscripcion')) {
                $rules['fin_inscripcion'][] = 'after_or_equal:inicio_inscripcion';
            }

            $validated = $request->validate($rules);

            // Crear la olimpiada de forma controlada
            $olimpiada = Olimpiada::create([
                'nombre' => $validated['nombre'],
                'convocatoria' => isset($validated['convocatoria']) && $request->hasFile('convocatoria') ? $request->file('convocatoria')->store('convocatorias', 'public') : null, // Guardar el archivo de convocatoria si existe
                'descripcion' => $validated['descripcion'] ?? null,
                'costo' => $validated['costo'] ?? null,
                'max_areas' => $validated['max_areas'] ?? null,
                'fecha_inicio' => $validated['fecha_inicio'],
                'fecha_fin' => $validated['fecha_fin'],
                'inicio_inscripcion' => $validated['inicio_inscripcion'] ?? null,
                'fin_inscripcion' => $validated['fin_inscripcion'] ?? null,
            ]);

            // Elimina la caché para que se actualice en la próxima consulta
            Cache::forget('olimpiadas');
            Cache::forget('olimpiadasActivas');

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Olimpiada creada exitosamente',
                'data' => $olimpiada,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Capturar errores de validación
            $errors = $e->errors();
    
            if (isset($errors['nombre'])) {
                // Comprobar si es un error de nombre duplicado
                $nombreErrors = $errors['nombre'];
                foreach ($nombreErrors as $error) {
                    if (strpos($error, 'already been taken') !== false || strpos($error, 'unique') !== false) {
                        return response()->json([
                            'success' => false,
                            'status' => 'validation_error',
                            'message' => 'El nombre de la olimpiada ya existe. Por favor, elija otro nombre.',
                            'field' => 'nombre'
                        ], 422);
                    }
                }
                return response()->json([
                    'success' => false,
                    'status' => 'validation_error',
                    'message' => 'Error en el nombre: ' . implode(' ', $nombreErrors),
                    'field' => 'nombre'
                ], 422);
            }

            if (isset($errors['convocatoria'])) {
                return response()->json([
                    'success' => false,
                    'status' => 'validation_error',
                    'message' => 'Error con el archivo de convocatoria: ' . implode(' ', $errors['convocatoria']),
                ], 422);
            }

            return response()->json([
                'success' => false,
                'status' => 'validation_error',
                'message' => 'Error de validación: ' . $e->getMessage(),
                'errors' => $errors,
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el olimpiada: ' . $e->getMessage()
            ], 500);
        }
    }

    public function obtenerOlimpiada($id){
    try {
        $olimpiada = Olimpiada::find($id);

        if (!$olimpiada) {
            return response()->json([
                'success' => false,
                'message' => 'Olimpiada no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $olimpiada
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'status' => 'error',
            'message' => 'Error al obtener la olimpiada: ' . $e->getMessage(),
        ], 500);
    }
    }
    public function modificarOlimpiada(Request $request, $id)
    {
        $olimpiada = \App\Models\Olimpiada::find($id);

        if (!$olimpiada) {
            return response()->json([
                'success' => false,
                'message' => 'Olimpiada no encontrada',
            ], 404);
        }

        // Convierte fechas del request ANTES de validar
        $fechas = ['fecha_inicio', 'fecha_fin', 'inicio_inscripcion', 'fin_inscripcion'];
        foreach ($fechas as $campo) {
            if ($request->has($campo)) {
                $request->merge([
                    $campo => $this->convertirFecha($request->input($campo))
                ]);
            }
        }

        // Validaciones
        $rules = [
            'nombre' => 'sometimes|string|max:255',
            'descripcion' => 'sometimes|nullable|string|max:255',
            'costo' => 'sometimes|numeric|min:0',
            'max_areas' => 'sometimes|integer|min:1',
            'fecha_inicio' => 'sometimes|date_format:Y-m-d|after_or_equal:today',
            'fecha_fin' => 'sometimes|date_format:Y-m-d',
            'inicio_inscripcion' => 'sometimes|nullable|date_format:Y-m-d',
            'fin_inscripcion' => 'sometimes|nullable|date_format:Y-m-d',
            'convocatoria' => 'sometimes|file|mimes:pdf|max:2048',
        ];

        // Validaciones cruzadas de fechas
        $fecha_inicio = $request->input('fecha_inicio', $olimpiada->fecha_inicio);
        $fecha_fin = $request->input('fecha_fin', $olimpiada->fecha_fin);
        $inicio_inscripcion = $request->input('inicio_inscripcion', $olimpiada->inicio_inscripcion);
        $fin_inscripcion = $request->input('fin_inscripcion', $olimpiada->fin_inscripcion);

        if ($request->has('fecha_fin') || $request->has('fecha_inicio')) {
            $rules['fecha_fin'] .= '|after_or_equal:' . ($request->has('fecha_inicio') ? 'fecha_inicio' : $olimpiada->fecha_inicio);
        }
        if ($request->has('inicio_inscripcion')) {
            $rules['inicio_inscripcion'] .= '|after_or_equal:' . $fecha_inicio . '|before_or_equal:' . $fecha_fin;
        }
        if ($request->has('fin_inscripcion')) {
            $rules['fin_inscripcion'] .= '|after_or_equal:' . $inicio_inscripcion . '|before_or_equal:' . $fecha_fin;
        }

        $validated = $request->validate($rules);

        $campos = [
            'nombre',
            'descripcion',
            'costo',
            'max_areas',
            'fecha_inicio',
            'fecha_fin',
            'inicio_inscripcion',
            'fin_inscripcion'
        ];

        $datosActualizar = [];
        foreach ($campos as $campo) {
            if ($request->has($campo)) {
                $nuevoValor = $request->input($campo);

                // Convertir fechas si es necesario
                if (in_array($campo, ['fecha_inicio', 'fecha_fin', 'inicio_inscripcion', 'fin_inscripcion'])) {
                    $nuevoValor = $this->convertirFecha($nuevoValor);
                }
                $datosActualizar[$campo] = $nuevoValor;
            }
        }

        // Manejo de archivo convocatoria
        if ($request->hasFile('convocatoria')) {
            $archivo = $request->file('convocatoria');
            $ruta = $archivo->store('convocatorias', 'public');
            $datosActualizar['convocatoria'] = $ruta;
        }

        // Actualiza siempre si hay datos a actualizar
        if (!empty($datosActualizar)) {
            $olimpiada->update($datosActualizar);
        }

        return response()->json([
            'success' => true,
            'message' => 'Olimpiada actualizada correctamente',
            'data' => $olimpiada->fresh(),
        ], 200);
    }

    private function convertirFecha($fecha)
    {
        // Si ya está en formato aaaa-mm-dd, retorna igual
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            return $fecha;
        }
        // Si está en formato dd/mm/aaaa, conviértelo
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $fecha)) {
            [$d, $m, $y] = explode('/', $fecha);
            return "$y-$m-$d";
        }
        return $fecha; // Si no, retorna igual
    }
}
