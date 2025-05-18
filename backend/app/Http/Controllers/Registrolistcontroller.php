<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Registro;
use App\Imports\PostulantesImport;
use Maatwebsite\Excel\Facades\Excel;



class Registrolistcontroller extends Controller
{
    public function registrarListaPostulantes(Request $request)
    {
        $request->validate([
            'excel' => 'required|file|mimes:xlsx,csv',
            'id_olimpiada' => 'required|exists:olimpiada,id',
            'id_encargado' => 'required|exists:encargado,id',
        ]);

        try {
            // Intentar importar el archivo Excel
            Excel::import(new PostulantesImport($request->id_olimpiada, $request->id_encargado), $request->file('excel'));

            return response()->json(['message' => 'Importación completada con éxito'], 200);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            // Manejar errores de validación específicos de Maatwebsite Excel
            $failures = $e->failures();

            return response()->json([
                'message' => 'Error de validación durante la importación.',
                'errors' => $failures,
            ], 422);
            
        } catch (\Exception $e) {
            // Manejar cualquier otro error
            return response()->json([
                'message' => 'Ocurrió un error durante la importación.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    public function obtenerListaPostulantes()
    {
        try {
            $registros = Cache::remember('registros_excel', 3600, function () {
                return Registro::with(['datos', 'encargado', 'opcion_inscripcion'])->get();
            });

            return response()->json([
                'success' => true,
                'message' => 'Registros obtenidos exitosamente.',
                'data' => $registros,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los registros: ' . $e->getMessage(),
            ], 500);
        }
    }
}
