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
            // Intenta obtener las olimpiadas desde la caché
            $olimpiadasActivas = Cache::remember('olimpiadasActivas', 3600, function () {
                return Olimpiada::whereDate('fecha_inicio', '<=', now())
                    ->whereDate('fecha_fin', '>=', now())
                    ->get(); // Consulta a la base de datos si no está en caché
            });

            // Retornar una respuesta exitosa
            return response()->json([
                'success' => true,
                'data' => $olimpiadasActivas,
            ], 200);
        } catch (\Exception $e) {
            // Manejar errores y retornar una respuesta
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las olimpiadas activas: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Almacenar una nueva olimpiada.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function almacenarOlimpiada(Request $request){
        try{
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
                'convocatoria' => isset($validated['convocatoria']) && $request->hasFile('convocatoria') ? $request->file('convocatoria')->store('convocatorias') : null, // Guardar el archivo de convocatoria si existe
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
        }catch (\Illuminate\Validation\ValidationException $e) {
            // Capturar errores de validación
            $errors = $e->errors();
    
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

        } catch(\Exception $e){
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el olimpiada: '.$e->getMessage()
            ], 500);
        }
    }

    public function obtenerOlimpiada($id)
    {
        $olimpiada = Olimpiada::find($id);

        if (!$olimpiada) {
            return response()->json(['message' => 'Olimpiada no encontrada'], 404);
        }

        return response()->json($olimpiada);
    }

}
