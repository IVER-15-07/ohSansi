<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Registro;
use Illuminate\Support\Facades\DB;

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
            'nombres' => 'required|string|max:255',	
            'apellidos' => 'required|string|max:255',
            'ci' => 'required|string|max:255',
            'id_opcion_inscripcion' => 'required|exists:opcion_inscripcion,id',
            'id_encargado' => 'required|exists:encargado,id'
        ]);

        // Crear el registro
        $registro = new Registro();
        $registro->nombres = $validated['nombres'];
        $registro->apellidos = $validated['apellidos'];
        $registro->ci = $validated['ci'];
        $registro->id_opcion_inscripcion = $validated['id_opcion_inscripcion']; 
        $registro->id_encargado = $validated['id_encargado'];
        $registro->id_pago = null; // Inicialmente no hay pago asociado
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
