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
            // Validar el cuerpo de la solicitud
            $validator = Validator::make($request->all(), [
                'id_encargado' => 'required|exists:encargado,id',
                'id_olimpiada' => 'required|exists:olimpiada,id',
                'estudiantes' => 'required|array',
                'estudiantes.*.nombres' => 'required|string|max:255',
                'estudiantes.*.apellidos' => 'required|string|max:255',
                'estudiantes.*.ci' => 'required|string|max:20|unique:registro,ci',
                'estudiantes.*.grado' => 'required|string',
                'estudiantes.*.area' => 'required|string',
                'estudiantes.*.nivel_categoria' => 'required|string',
                'estudiantes.*.campos_inscripcion' => 'required|array',
                'estudiantes.*.tutores' => 'required|array',
                'estudiantes.*.tutores.*.rol' => 'required|string',
                'estudiantes.*.tutores.*.nombres' => 'required|string|max:255',
                'estudiantes.*.tutores.*.apellidos' => 'required|string|max:255',
                'estudiantes.*.tutores.*.ci' => 'required|string|max:20|unique:tutor,ci',
                'estudiantes.*.tutores.*.correo' => 'required|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $idEncargado = $request->id_encargado;
            $idOlimpiada = $request->id_olimpiada;
            $estudiantes = $request->estudiantes;

            DB::beginTransaction();

            foreach ($estudiantes as $estudiante) {
                // Validar y obtener IDs relacionados
                $idGrado = Grado::where('nombre', $estudiante['grado'])->value('id');
                $idArea = Area::where('nombre', $estudiante['area'])->value('id');
                $idNivelCategoria = NivelCategoria::where('nombre', $estudiante['nivel_categoria'])->value('id');

                if (!$idGrado || !$idArea || !$idNivelCategoria) {
                    throw new \Exception('Error al validar grado, área o nivel/categoría.');
                }

                // Crear el registro en la tabla "registro"
                $registro = Registro::create([
                    'nombres' => $estudiante['nombres'],
                    'apellidos' => $estudiante['apellidos'],
                    'ci' => $estudiante['ci'],
                    'id_grado' => $idGrado,
                    'id_opcion_inscripcion' => OpcionInscripcion::where('id_olimpiada', $idOlimpiada)->value('id'),
                    'id_area' => $idArea,
                    'id_nivel_categoria' => $idNivelCategoria,
                    'id_encargado' => $idEncargado,
                ]);

                // Crear los datos de inscripción en la tabla "dato_inscripcion"
                foreach ($estudiante['campos_inscripcion'] as $campoNombre => $valor) {
                    $idCampoInscripcion = CampoInscripcion::where('nombre', $campoNombre)->value('id');

                    if (!$idCampoInscripcion) {
                        throw new \Exception("El campo de inscripción '$campoNombre' no existe.");
                    }

                    DatoInscripcion::create([
                        'id_campo_inscripcion' => $idCampoInscripcion,
                        'id_registro' => $registro->id,
                        'valor' => $valor,
                    ]);
                }

                // Procesar roles y tutores
                foreach ($estudiante['tutores'] as $tutor) {
                    $idRolTutor = RolTutor::firstOrCreate(['nombre' => $tutor['rol']])->id;

                    $tutorModel = Tutor::firstOrCreate([
                        'ci' => $tutor['ci'],
                    ], [
                        'nombres' => $tutor['nombres'],
                        'apellidos' => $tutor['apellidos'],
                        'correo' => $tutor['correo'],
                    ]);

                    RegistroTutor::create([
                        'id_registro' => $registro->id,
                        'id_tutor' => $tutorModel->id,
                        'id_rol_tutor' => $idRolTutor,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lista de postulantes registrada exitosamente.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

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
