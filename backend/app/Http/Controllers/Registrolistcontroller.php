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
    set_time_limit(300);

    // Validación inicial clara
    try {
        $request->validate([
            'excel' => 'required|file|mimes:xlsx,csv',
            'id_olimpiada' => 'required|exists:olimpiada,id',
            'id_encargado' => 'required|exists:encargado,id',
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Error de validación en los datos enviados.',
            'errors' => $e->errors(),
        ], 422);
    }

    try {
        Excel::import(
            new PostulantesImport($request->id_olimpiada, $request->id_encargado),
            $request->file('excel')
        );

        return response()->json(['message' => 'Registros completados con éxito'], 200);

    } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
        // Errores de validación específicos de Maatwebsite Excel
        $failures = $e->failures();
        return response()->json([
            'message' => 'Error de validación durante la importación.',
            'errors' => $failures,
        ], 422);

    } catch (\Exception $e) {
        // Si el mensaje es un JSON con errores personalizados, decodifícalo y retorna con 422
        $mensaje = $e->getMessage();
        $json = json_decode($mensaje, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            return response()->json([
                'message' => $json['message'] ?? 'Errores durante la importación.',
                'errors' => $json['errors'] ?? [$mensaje],
            ], 422);
        }

        // Si no es JSON, retorna el mensaje normal
        return response()->json([
            'message' => 'Ocurrió un error durante la importación.',
            'error' => $mensaje,
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
