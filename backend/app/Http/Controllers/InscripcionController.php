<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InscripcionController extends Controller
{
    public function obtenerInscripciones($idEncargado, $idOlimpiada)
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
