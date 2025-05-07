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
use Maatwebsite\Excel\Facades\Excel;


class Registrolistcontroller extends Controller
{

    public function registrarListaPostulantes(Request $request)
    {
        try {
            // Validar el archivo Excel
            $validator = Validator::make($request->all(), [
                'archivo' => 'required|file|mimes:xlsx,xls',
                'id_encargado' => 'required|exists:encargado,id',
                'id_olimpiada' => 'required|exists:olimpiada,id',
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

            // Verificar si existe la sección "Datos del Postulante"
            $seccionCampo = SeccionCampo::where('nombre', 'Datos del Postulante')
                ->where('id_olimpiada', $idOlimpiada)
                ->first();

            if (!$seccionCampo) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró la sección "Datos del Postulante" para la olimpiada especificada.',
                ], 422);
            }

            $idSeccionCampo = $seccionCampo->id;

            // Obtener los campos de inscripción relacionados
            $camposInscripcion = CampoInscripcion::where('id_seccion_campo', $idSeccionCampo)->get();

            if ($camposInscripcion->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron campos de inscripción para la sección "Datos del Postulante".',
                ], 422);
            }

            // Mapear los nombres y tipos de los campos
            $camposMapeados = [];
            foreach ($camposInscripcion as $campo) {
                $tipoCampo = TipoCampo::find($campo->id_tipo_campo);
                if (!$tipoCampo) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No se encontró el tipo de campo para el campo de inscripción: ' . $campo->nombre,
                    ], 422);
                }
                $camposMapeados[$campo->nombre] = $tipoCampo->nombre;
            }

            // Leer el archivo Excel
            $file = $request->file('archivo');
            $data = Excel::toArray([], $file)[0]; // Leer la primera hoja del Excel

            // Validar encabezados del Excel
            $headers = array_shift($data); // Obtener los encabezados
            foreach ($camposMapeados as $nombreCampo => $tipoCampo) {
                if (!in_array($nombreCampo, $headers)) {
                    return response()->json([
                        'success' => false,
                        'message' => "El campo requerido '$nombreCampo' no está presente en el archivo Excel.",
                    ], 422);
                }
            }

            DB::beginTransaction();

            foreach ($data as $row) {
                // Validar y obtener IDs relacionados
                $idGrado = Grado::where('nombre', $row[array_search('grado', $headers)])->value('id');
                if (!$idGrado) {
                    throw new \Exception("El grado '{$row[array_search('grado', $headers)]}' no es válido.");
                }

                $idArea = Area::where('nombre', $row[array_search('area', $headers)])->value('id');
                if (!$idArea) {
                    throw new \Exception("El área '{$row[array_search('area', $headers)]}' no es válida.");
                }

                $idNivelCategoria = NivelCategoria::where('nombre', $row[array_search('nivel_categoria', $headers)])->value('id');
                if (!$idNivelCategoria) {
                    throw new \Exception("El nivel/categoría '{$row[array_search('nivel_categoria', $headers)]}' no es válido.");
                }

                // Obtener el id_opcion_inscripcion basado en id_olimpiada, id_area y id_nivel_categoria
                $idOpcionInscripcion = OpcionInscripcion::where('id_olimpiada', $idOlimpiada)
                    ->where('id_area', $idArea)
                    ->where('id_nivel_categoria', $idNivelCategoria)
                    ->value('id');

                if (!$idOpcionInscripcion) {
                    throw new \Exception('No se encontró una opción de inscripción válida para los datos proporcionados.');
                }

                // Crear el registro en la tabla "registro"
                $registro = Registro::create([
                    'nombres' => $row[array_search('nombre', $headers)],
                    'apellidos' => $row[array_search('apellido', $headers)],
                    'ci' => $row[array_search('ci', $headers)],
                    'id_grado' => $idGrado, // Agregado el id_grado
                    'id_opcion_inscripcion' => $idOpcionInscripcion,
                    'id_encargado' => $idEncargado,
                ]);

                // Crear los datos de inscripción en la tabla "dato_inscripcion"
                foreach ($camposMapeados as $nombreCampo => $tipoCampo) {
                    $valor = $row[array_search($nombreCampo, $headers)];
                    if (gettype($valor) !== $tipoCampo) {
                        throw new \Exception("El valor del campo '$nombreCampo' no coincide con el tipo esperado '$tipoCampo'.");
                    }

                    DatoInscripcion::create([
                        'id_campo_inscripcion' => CampoInscripcion::where('nombre', $nombreCampo)->value('id'),
                        'id_registro' => $registro->id,
                        'valor' => $valor,
                    ]);
                }

                // Procesar roles y tutores
                foreach ($headers as $header) {
                    if (str_contains($header, '(')) {
                        $rolNombre = explode('(', $header)[0];
                        $idRolTutor = RolTutor::firstOrCreate(['nombre' => $rolNombre])->id;

                        $tutorData = explode(',', $row[array_search($header, $headers)]);
                        foreach ($tutorData as $tutor) {
                            [$nombre, $apellido, $ci, $correo] = explode('|', $tutor);
                            $tutorModel = Tutor::firstOrCreate([
                                'ci' => $ci,
                            ], [
                                'nombres' => $nombre,
                                'apellidos' => $apellido,
                                'correo' => $correo,
                            ]);

                            RegistroTutor::create([
                                'id_registro' => $registro->id,
                                'id_tutor' => $tutorModel->id,
                                'id_rol_tutor' => $idRolTutor,
                            ]);
                        }
                    }
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
