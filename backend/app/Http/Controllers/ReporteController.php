<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inscripcion;
use Illuminate\Support\Facades\Cache;

class ReporteController extends Controller
{

    public function inscritosPorOlimpiada($idOlimpiada)
    {
        try {
            $cacheKey = "reporte_inscritos_olimpiada_{$idOlimpiada}";
            $postulantes = Cache::remember($cacheKey, 300, function () use ($idOlimpiada) { // 300 segundos = 5 minutos
                $inscritos = Inscripcion::with([
                    'registro.postulante.persona',
                    'registro.inscripciones.opcionInscripcion.area',
                    'registro.inscripciones.opcionInscripcion.nivel_categoria',
                    'registro.postulante.datos.olimpiadaCampoPostulante.campo_postulante',
                    'registro.tutores.persona',
                    'registro.tutores.tutor.datos.olimpiadaCampoTutor.campo_tutor',
                    'registro.encargado.persona',
                    'registro.inscripciones.pago',
                    'registro.inscripciones.lista',
                ])
                ->whereHas('registro', function ($q) use ($idOlimpiada) {
                    $q->where('id_olimpiada', $idOlimpiada);
                })
                ->get();

                return $inscritos->map(function ($inscripcion) {
                    $registro = $inscripcion->registro;
                    $postulante = $registro->postulante ?? null;
                    $opcion = $inscripcion->opcionInscripcion ?? null;
                    $tutor = $registro->encargado ?? null;
                    $encargado = $registro->encargado ?? null;
                    $pago = $inscripcion->pago ?? null;

                    if (!$postulante) return null;

                    $datos_personalizados = $postulante->datos->map(function ($dato) {
                        return [
                            'campo' => $dato->olimpiadaCampoPostulante->campo_postulante->nombre ?? null,
                            'valor' => $dato->valor,
                        ];
                    });

                    $datos_tutor = $tutor && $tutor->datos
                        ? $tutor->datos->map(function ($dato) {
                            return [
                                'campo' => $dato->olimpiadaCampoTutor->campo_tutor->nombre ?? null,
                                'valor' => $dato->valor ?? null,
                            ];
                        })
                        : [];

                    return [
                        'postulante' => [
                            'nombres' => $postulante->persona->nombres ?? null,
                            'apellidos' => $postulante->persona->apellidos ?? null,
                            'ci' => $postulante->persona->ci ?? null,
                            'area_categoria' => [
                                'area' => $opcion && $opcion->area ? $opcion->area->nombre : null,
                                'categoria' => $opcion && $opcion->nivel_categoria ? $opcion->nivel_categoria->nombre : null,
                            ],
                            'datos_adicionales' => [$datos_personalizados,]
                        ],
                        'tutor' => $tutor ? [
                            'nombres' => $tutor->persona->nombres ?? null,
                            'apellidos' => $tutor->persona->apellidos ?? null,
                            'ci' => $tutor->persona->ci ?? null,
                            'datos_adicionales' => [$datos_tutor,]
                        ] : null,
                        'encargado' => $encargado ? [
                            'nombres' => $encargado->persona->nombres ?? null,
                            'apellidos' => $encargado->persona->apellidos ?? null,
                            'ci' => $encargado->persona->ci ?? null,
                            'correo' => $encargado->correo ?? null,
                        ] : null,
                        'estado_pago' => $pago ? ($pago->fecha_pago ? 'Pagado' : 'Pendiente') : 'Sin pago',
                        'validado' => $pago && $pago->fecha_pago ? 'Validado' : 'Pendiente',
                        'tipo_inscripcion' => $inscripcion->lista ? 'Por lista' : 'Individual',
                    ];
                })->filter()->values();
            });

            return response()->json([
                'success' => true,
                'data' => $postulantes,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los inscritos: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function reportePorArea(Request $request, $idOlimpiada)
    {
      try {
            $area = $request->query('area');
            $categoria = $request->query('categoria');
            $cacheKey = "reporte_area_{$idOlimpiada}_{$area}_{$categoria}";
            $postulantes = Cache::remember($cacheKey, 300, function () use ($idOlimpiada, $area, $categoria) {
                $inscritos = Inscripcion::with([
                    'registro.postulante.persona',
                    'registro.postulante.datos.olimpiadaCampoPostulante.campo_postulante',
                    'registro.encargado.persona',
                    'registro.inscripciones.opcionInscripcion.area',
                    'registro.inscripciones.opcionInscripcion.nivel_categoria',
                ])
                ->whereHas('registro', function ($q) use ($idOlimpiada) {
                    $q->where('id_olimpiada', $idOlimpiada);
                })
                ->when($area, function ($query) use ($area) {
                    $query->whereHas('opcionInscripcion.area', function ($q) use ($area) {
                        $q->where('nombre', $area);
                    });
                })
                ->when($categoria, function ($query) use ($categoria) {
                    $query->whereHas('opcionInscripcion.nivel_categoria', function ($q) use ($categoria) {
                        $q->where('nombre', $categoria);
                    });
                })
                ->get();

                return $inscritos->map(function ($inscripcion) {
                    $registro = $inscripcion->registro;
                    $postulante = $registro->postulante ?? null;
                    $tutor = $registro->encargado ?? null;
                    $opcion = $inscripcion->opcionInscripcion ?? null;

                    if (!$postulante) return null;

                    $datos_personalizados = $postulante->datos->map(function ($dato) {
                        return [
                            'campo' => $dato->campo_postulante->nombre ?? null,
                            'valor' => $dato->valor,
                        ];
                    });

                    $datos_tutor = $tutor && $tutor->datos
                        ? $tutor->datos->map(function ($dato) {
                            return [
                                'campo' => $dato->campo_tutor->nombre ?? null,
                                'valor' => $dato->valor_dato ?? null,
                            ];
                        })
                        : [];

                    return [
                        'postulante' => [
                            'nombres' => $postulante->persona->nombres ?? null,
                            'apellidos' => $postulante->persona->apellidos ?? null,
                            'ci' => $postulante->persona->ci ?? null,
                            'area_categoria' => [
                                'area' => $opcion && $opcion->area ? $opcion->area->nombre : null,
                                'categoria' => $opcion && $opcion->nivel_categoria ? $opcion->nivel_categoria->nombre : null,
                            ],
                            'datos_adicionales' => [$datos_personalizados,]
                        ],
                        'tutor' => $tutor ? [
                            'nombres' => $tutor->persona->nombres ?? null,
                            'apellidos' => $tutor->persona->apellidos ?? null,
                            'ci' => $tutor->persona->ci ?? null,
                            'datos_adicionales' => [$datos_tutor]
                        ] : null,
                    ];
                })->filter()->values();
            });

            return response()->json([
                'success' => true,
                'data' => $postulantes,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los inscritos: ' . $e->getMessage(),
            ], 500);
        }
    }
}
