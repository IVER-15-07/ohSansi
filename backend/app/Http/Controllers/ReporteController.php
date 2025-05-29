<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inscripcion;
use App\Models\Persona;

class ReporteController extends Controller
{

    public function inscritosPorOlimpiada($idOlimpiada)
    {
        try {
            $inscritos = Inscripcion::with([
                'registro.postulante.persona',
                'registro.postulante.datos.olimpiadaCampoPostulante.campo_postulante',
                'registro.encargado.persona',
                'registro.inscripciones.opcionInscripcion.area',
                'registro.inscripciones.opcionInscripcion.nivel_categoria',
                //'registro.registro.tutor.tutor.persona',



            ])
                ->whereHas('registro', function ($q) use ($idOlimpiada) {
                    $q->where('id_olimpiada', $idOlimpiada);
                })
                ->get();


            $postulantes = $inscritos->map(function ($inscripcion) {
                $registro = $inscripcion->registro;
                $postulante = $registro->postulante ?? null;
                $tutor = $registro->encargado ?? null;
                $opcion = $inscripcion->opcionInscripcion ?? null;

                if (!$postulante) return null;







                // Datos personalizados del postulante


                $datos_personalizados = $postulante->datos->map(function ($dato) {
                    return [
                        'campo' => $dato->campo_postulante->nombre ?? null,
                        'valor' => $dato->valor,
                    ];
                });

                // Datos personalizados del tutor
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
                        'datos_adicionales' => [$datos_tutor,
                        
                        
                        ]
                    ] : null,

                ];
            })->filter()->values();

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
