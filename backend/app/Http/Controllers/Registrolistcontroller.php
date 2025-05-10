<?php

namespace App\Http\Controllers;



use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Registro;
use App\Models\Area;
use App\Models\NivelCategoria;
use App\Models\DatoInscripcion;
use App\Models\Grado;
use App\Models\OpcionInscripcion;
use App\Models\SeccionCampo;
use App\Models\CampoInscripcion;
use App\Models\TipoCampo;
use App\Models\RolTutor;
use App\Models\Tutor;
use App\Models\RegistroTutor;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

use App\Imports\PostulantesImport;

use Maatwebsite\Excel\Facades\Excel;








class Registrolistcontroller extends Controller
{


    public function importar(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls',
            'id_encargado' => 'required|exists:encargado,id',
            'id_olimpiada' => 'required|exists:olimpiada,id',
        ]);

        // Obtener los valores de id_encargado y id_olimpiada desde el request
        $idEncargado = $request->id_encargado;
        $idOlimpiada = $request->id_olimpiada;


        try {
            // Importar el archivo Excel
            Excel::import(new PostulantesImport($idEncargado, $idOlimpiada), $request->file('archivo'));

            return response()->json(['message' => 'Importación completada con éxito.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error durante la importación: ' . $e->getMessage()], 500);
        }
    }


    public function registrarListaPostulantes(Request $request)
    {
        try {

            // Validar el archivo enviado
            $request->validate([
                'archivo' => 'required|file|mimes:xlsx,xls', // Validar que sea un archivo Excel
                'id_encargado' => 'required|exists:encargado,id', // Validar que el ID del encargado exista
                'id_olimpiada' => 'required|exists:olimpiada,id', // Validar que el ID de la olimpiada exista
            ]);



            $idEncargado = $request->id_encargado;
            $idOlimpiada = $request->id_olimpiada;

            Excel::import(new PostulantesImport($idEncargado, $idOlimpiada), $request->file('archivo'));


            return response()->json([
                'success' => true,
                'message' => 'Lista de postulantes registrada exitosamente.',
            ], 201);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la lista de postulantes: ' . $e->getMessage(),
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
