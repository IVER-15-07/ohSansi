<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Area;
use App\Models\Olimpiada;
use App\Models\OpcionInscripcion;

class AreaController extends Controller
{
    public function obtenerAreas(Request $request)
    {
        try {
            // Intenta obtener las áreas desde la caché
            $areas = Cache::remember('areas', 3600, function () {
                return Area::all(); // Consulta a la base de datos si no está en caché
            });

            return response()->json([
                'success' => true,
                'data' => $areas,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los areas: ' . $e->getMessage()
            ], 500);
        }
    }


    public function almacenarArea(Request $request)
    {
        try {
            // Normalizar el nombre antes de validar: quitar espacios y reducir espacios internos
            $nombre = preg_replace('/\s+/', ' ', trim($request->input('nombre')));
            $nombre = ucfirst(mb_strtolower($nombre, 'UTF-8'));

            // Validar los datos enviados
            $validated = $request->validate([
                'nombre' => [
                    'required',
                    'string',
                    'max:50',
                    'regex:/^[a-zA-ZÁÉÍÓÚáéíóúÜüÑñ0-9\s]+$/',
                    function ($attribute, $value, $fail) use ($nombre) {
                        // Validar duplicados usando solo el nombre normalizado
                        if (Area::where('nombre', ($nombre))->exists()) {
                            $fail('El nombre del área ya existe en el catálogo.');
                        }
                    },
                ],
            ]);

            // Crear el área con nombre normalizado
            $area = Area::create([
                'nombre' => $nombre,
            ]);

            // Limpiar caché para asegurar que la próxima consulta tenga datos actualizados
            Cache::forget('areas');

            // Retornar una respuesta
            return response()->json([
                'success' => true,
                'message' => 'Área creada exitosamente.',
                'data' => $area,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al crear el área: ' . $e->getMessage()
            ], 500);
        }
    }


    public function areadeOlimpiada($idOlimpiada)
    {
        try {
            // 1. Obtener todas las opciones de inscripción de la olimpiada
            $opciones = OpcionInscripcion::with([
                'area',
                'nivel_categoria.grados'
            ])->where('id_olimpiada', $idOlimpiada)->get();

            // 2. Agrupar por área
            $areas = [];
            foreach ($opciones as $opcion) {
                $areaId = $opcion->area->id;
                if (!isset($areas[$areaId])) {
                    $areas[$areaId] = [
                        'id' => $opcion->area->id,
                        'nombre' => $opcion->area->nombre,
                        'niveles' => []
                    ];
                }
                $nivel = $opcion->nivel_categoria;
                $areas[$areaId]['niveles'][] = [
                    'id' => $nivel->id,
                    'nombre' => $nivel->nombre,
                    'esNivel' => $nivel->esNivel,
                    'grados' => $nivel->grados->map(function ($grado) {
                        return [
                            'id' => $grado->id,
                            'nombre' => $grado->nombre
                        ];
                    })->toArray()
                ];
            }

            // 3. Quitar duplicados de niveles por área (opcional)
            foreach ($areas as &$area) {
                $area['niveles'] = collect($area['niveles'])->unique('id')->values()->all();
            }

            return response()->json([
                'success' => true,
                'data' => array_values($areas),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las áreas de la olimpiada: ' . $e->getMessage()
            ], 500);
        }
    }
}
