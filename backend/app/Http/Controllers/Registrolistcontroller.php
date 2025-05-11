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

use Illuminate\Support\Facades\DB;

use App\Imports\PostulantesImport;

use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\ToModel;

use Maatwebsite\Excel\HeadingRowImport;
use App\Models\Postulante;
use App\Models\Inscripcion;









class Registrolistcontroller extends Controller
{




    public function registrarListaPostulantes(Request $request)
    {
        $request->validate([
            'excel' => 'required|file|mimes:xlsx,csv',
            'id_olimpiada' => 'required|exists:olimpiada,id',
            'id_encargado' => 'required|exists:encargado,id',
        ]);

        Excel::import(new PostulantesImport($request->id_olimpiada, $request->id_encargado), $request->file('excel'));

        return response()->json(['message' => 'Importación completada con éxito']);
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
