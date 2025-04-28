<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\SeccionCampo;
use App\Models\CampoInscripcion;
use App\Models\DatoInscripcion;
class FormularioController extends Controller
{
    public function obtenerFormulario(Request $request)
    {
        try {
            // Intenta obtener las áreas desde la caché
            $secciones = Cache::remember('seccionesConCampos2', 3600, function () {
                return SeccionCampo::with(['campos_inscripcion.tipo_campo'])->get(); // Consulta a la base de datos si no está en caché
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
                'success' => false,
                'status' => 'error',
                'message' => 'Error al guardar los datos de inscripción: ' . $e->getMessage()
            ], 500);
        }
    }
}


