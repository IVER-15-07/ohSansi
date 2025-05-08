<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\SeccionCampo;
use App\Models\CampoInscripcion;
use App\Models\DatoInscripcion;
class FormularioController extends Controller
{
    public function obtenerFormulario(Request $request, $idOlimpiada)
    {
        try {
            // Intenta obtener las áreas desde la caché
            $secciones = Cache::remember("seccionesConCampos_{$idOlimpiada}", 3600, function () use($idOlimpiada) {
                return SeccionCampo::where('id_olimpiada', $idOlimpiada) // Filtrar por id_olimpiada
                ->with(['campos_inscripcion.tipo_campo']) // Cargar los campos_inscripcion y su relación tipo_campo
                ->get();
            });

            return response()->json([
                'success' => true,
                'data' => $secciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener las secciones con campos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function guardarDatosInscripcion(Request $request, $idRegistro)
    {
        try {
            $validated = $request->validate([
                'formValues' => 'required|array',
            ]);

            foreach(array_keys($validated['formValues']) as $idCampoInscripcion){
                if(!CampoInscripcion::where('id', $idCampoInscripcion)->exists()){
                    return response()->json([
                        'success' => false,
                        'status' => 'error',
                        'message' => `El campo de inscripción {$idCampoInscripcion} no existe.`
                    ], 404);
                }
            }

            forEach($validated['formValues'] as $idCampoInscripcion => $valor) {
                DatoInscripcion::create([
                    'id_registro' => $idRegistro,
                    'id_campo_inscripcion' => $idCampoInscripcion,
                    'valor' => $valor,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Datos de inscripción guardados correctamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'request' => $request->all(),
                'success' => false,
                'status' => 'error',
                'message' => 'Error al guardar los datos de inscripción: ' . $e->getMessage()
            ], 500);
        }
    }
}


