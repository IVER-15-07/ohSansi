<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Registro;


class Registrolistcontroller extends Controller
{

    public function registrarListaPostulantes(Request $request)
    {
        set_time_limit(300);
        try {
            // Validar que se haya enviado un archivo Excel, idEncargado e idOlimpiada
            $validated = $request->validate([
                'archivo' => 'required|file|mimes:xlsx,xls',
                'idEncargado' => 'required|integer|exists:encargado,id',
                'idOlimpiada' => 'required|integer|exists:olimpiada,id',
            ]);
    
            $idEncargado = $validated['idEncargado'];
            $idOlimpiada = $validated['idOlimpiada'];
            $archivo = $request->file('archivo');
    
            // Leer el archivo Excel
            $datosExcel = Excel::toArray([], $archivo)[0]; // Leer la primera hoja del Excel
    
            // Convertir los datos a UTF-8
            $datosExcel = array_map(function ($fila) {
                return array_map(function ($valor) {
                    return is_string($valor) ? mb_convert_encoding($valor, 'UTF-8', 'auto') : $valor;
                }, $fila);
            }, $datosExcel);
    
            // Validar encabezados del Excel
            $encabezados = array_map('strtolower', $datosExcel[0]); // Convertir encabezados a minúsculas
            $this->validarEncabezados($encabezados);
    
            // Procesar cada fila del Excel
            foreach ($datosExcel as $index => $fila) {
                if ($index === 0) continue; // Saltar encabezados
    
                DB::beginTransaction(); // Iniciar transacción
    
                try {
                    // Validar y procesar la fila
                    $idRegistro = $this->procesarFila($fila, $encabezados, $idEncargado, $idOlimpiada);
    
                    // Validar e insertar datos del tutor
                    $this->procesarTutores($fila, $encabezados, $idRegistro, $idOlimpiada);
    
                    DB::commit(); // Confirmar transacción
                } catch (\Exception $e) {
                    DB::rollBack(); // Revertir transacción en caso de error
                    return response()->json([
                        'success' => false,
                        'message' => "Error al procesar la fila $index: " . $e->getMessage(),
                    ], 500);
                }
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Lista de postulantes procesada exitosamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar el archivo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Procesar los datos de los tutores.
     */
    private function procesarTutores($fila, $encabezados, $idRegistro, $idOlimpiada)
    {
        if (!$idRegistro) {
            throw new \Exception("El registro no está definido.");
        }

        $idTutor = null; // Inicializar $idTutor

        foreach ($encabezados as $key => $campo) {
            // Identificar los campos relacionados con los tutores (por ejemplo, nombres(Padre))
            if (preg_match('/\((.*?)\)$/', $campo, $matches)) {
                $rol = $matches[1]; // Extraer el rol del tutor (por ejemplo, "Padre")
                $campoNombre = preg_replace('/\((.*?)\)$/', '', $campo); // Eliminar el rol del nombre del campo

                // Validar que el rol exista en la tabla rol_tutor
                $idRolTutor = DB::table('rol_tutor')
                    ->where('nombre', $rol)
                    ->value('id');

                if (!$idRolTutor) {
                    throw new \Exception("El rol de tutor '$rol' no es válido.");
                }

                // Manejar los campos básicos del tutor (nombres, apellidos, ci)
                if (in_array($campoNombre, ['nombres', 'apellidos', 'ci'])) {
                    $ciTutor = $fila[array_search('ci(' . $rol . ')', $encabezados)];
                    $nombresTutor = $fila[array_search('nombres(' . $rol . ')', $encabezados)];
                    $apellidosTutor = $fila[array_search('apellidos(' . $rol . ')', $encabezados)];

                    // Validar si el tutor ya existe
                    $tutorExistente = DB::table('tutor')
                        ->where('ci', $ciTutor)
                        ->first();

                    if (!$tutorExistente) {
                        // Insertar nuevo tutor
                        $idTutor = DB::table('tutor')->insertGetId([
                            'ci' => $ciTutor,
                            'nombres' => $nombresTutor,
                            'apellidos' => $apellidosTutor,
                        ]);
                    } else {
                        $idTutor = $tutorExistente->id;
                    }

                    // Verificar si ya existe la relación en registro_tutor
                    $registroTutorExistente = DB::table('registro_tutor')
                        ->where('id_registro', $idRegistro)
                        ->where('id_tutor', $idTutor)
                        ->where('id_rol_tutor', $idRolTutor)
                        ->exists();

                    if (!$registroTutorExistente) {
                        // Relacionar al tutor con el registro
                        DB::table('registro_tutor')->insert([
                            'id_registro' => $idRegistro,
                            'id_tutor' => $idTutor,
                            'id_rol_tutor' => $idRolTutor,
                        ]);
                    }
                } else {
                    // Manejar los campos adicionales del tutor
                    $idCampoTutor = DB::table('campo_tutor')
                        ->where('nombre', $campoNombre)
                        ->value('id');

                    if (!$idCampoTutor) {
                        throw new \Exception("El campo '$campoNombre' no es válido para el tutor.");
                    }

                    // Validar que el campo esté asociado a la olimpiada
                    $olimpiadaCampoTutor = DB::table('olimpiada_campo_tutor')
                        ->where('id_olimpiada', $idOlimpiada)
                        ->where('id_campo_tutor', $idCampoTutor)
                        ->first();

                    if (!$olimpiadaCampoTutor) {
                        throw new \Exception("El campo '$campoNombre' no está asociado a la olimpiada.");
                    }

                    // Verificar si el campo es obligatorio
                    if ($olimpiadaCampoTutor->esObligatorio && empty($fila[$key])) {
                        throw new \Exception("El campo '$campoNombre' es obligatorio para el tutor con rol '$rol'.");
                    }

                    // Asegurarse de que $idTutor esté definido antes de insertar datos adicionales
                    if (!$idTutor) {
                        throw new \Exception("No se pudo asociar datos adicionales porque el tutor no está definido.");
                    }

                    // Insertar datos adicionales del tutor
                    DB::table('dato_tutor')->insert([
                        'id_tutor' => $idTutor,
                        'valor' => $fila[$key],
                        'id_olimpiada_campo_tutor' => $olimpiadaCampoTutor->id,
                    ]);
                }
            }
        }
    }
    /**
     * Validar los encabezados del Excel.
     */
    
    private function validarEncabezados($encabezados)
    {
        $camposRequeridos = ['ci', 'nombres', 'apellidos', 'fecha_nacimiento'];
        foreach ($camposRequeridos as $campo) {
            if (!in_array($campo, $encabezados)) {
                throw new \Exception("El campo '$campo' es obligatorio en el encabezado del Excel.");
            }
        }
    }
    /**
     * Procesar una fila del Excel.
     */
    private function procesarFila($fila, $encabezados, $idEncargado, $idOlimpiada)
    {
        // Validar que los datos requeridos estén presentes
        foreach (['ci', 'nombres', 'apellidos', 'fecha_nacimiento'] as $campo) {
            if (empty($fila[array_search($campo, $encabezados)])) {
                throw new \Exception("El campo '$campo' está vacío en la fila.");
            }
        }

        // Obtener datos del postulante
        $ci = $fila[array_search('ci', $encabezados)];
        $nombres = $fila[array_search('nombres', $encabezados)];
        $apellidos = $fila[array_search('apellidos', $encabezados)];
        $fechaNacimiento = $fila[array_search('fecha_nacimiento', $encabezados)];

        // Convertir la fecha si es un valor numérico o está en otro formato
        try {
            if (is_numeric($fechaNacimiento)) {
                $fechaNacimiento = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($fechaNacimiento)->format('Y-m-d');
            } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaNacimiento)) {
                throw new \Exception("La fecha de nacimiento no tiene el formato aaaa-mm-dd.");
            }
        } catch (\Exception $e) {
            throw new \Exception("Error al procesar la fecha de nacimiento: " . $e->getMessage());
        }

        // Validar si el postulante ya existe
        $postulanteExistente = DB::table('postulante')
            ->where('ci', $ci)
            ->first();

        if ($postulanteExistente) {
            $this->validarPostulanteExistente($postulanteExistente, $idOlimpiada);
        } else {
            // Insertar nuevo postulante
            $idPostulante = DB::table('postulante')->insertGetId([
                'ci' => $ci,
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'fecha_nacimiento' => $fechaNacimiento,
            ]);

            // Insertar datos adicionales del postulante
            $this->insertarDatosPostulante($fila, $encabezados, $idPostulante, $idOlimpiada);

            // Insertar registro e inscripción
            $idRegistro = $this->insertarRegistroEInscripcion($fila, $encabezados, $idPostulante, $idEncargado, $idOlimpiada);
        }
        if (!$idRegistro) {
            throw new \Exception("No se pudo insertar el registro.");
        }
    
        return $idRegistro;
    }

    /**
     * Validar si el postulante ya existe.
     */
    private function validarPostulanteExistente($postulante, $idOlimpiada)
    {
        $registroExistente = DB::table('registro')
            ->where('id_postulante', $postulante->id)
            ->where('id_olimpiada', $idOlimpiada)
            ->first();

        if ($registroExistente) {
            $inscripcionesExistentes = DB::table('inscripcion')
                ->where('id_registro', $registroExistente->id)
                ->count();

            $maxAreas = DB::table('olimpiada')
                ->where('id', $idOlimpiada)
                ->value('max_areas');

            if ($inscripcionesExistentes >= $maxAreas) {
                throw new \Exception("El postulante ya está inscrito en el máximo de áreas permitidas.");
            }
        }
    }

    /**
     * Insertar datos adicionales del postulante.
     */
    private function insertarDatosPostulante($fila, $encabezados, $idPostulante, $idOlimpiada)
    {
        foreach ($encabezados as $key => $campo) {
            // Ignorar encabezados vacíos
            if (empty($campo)) {
                continue;
            }
    
            // Ignorar los campos básicos del postulante y los campos relacionados con tutores
            if (!in_array($campo, ['ci', 'nombres', 'apellidos', 'fecha_nacimiento']) && !preg_match('/\((.*?)\)$/', $campo)) {
                // Buscar el campo en la tabla campo_postulante
                $idCampoPostulante = DB::table('campo_postulante')
                    ->where('nombre', $campo)
                    ->value('id');
    
                if (!$idCampoPostulante) {
                    throw new \Exception("El campo '$campo' no es válido.");
                }
    
                // Validar que el campo esté asociado a la olimpiada
                $idOlimpiadaCampoPostulante = DB::table('olimpiada_campo_postulante')
                    ->where('id_olimpiada', $idOlimpiada)
                    ->where('id_campo_postulante', $idCampoPostulante)
                    ->first();
    
                if (!$idOlimpiadaCampoPostulante) {
                    throw new \Exception("El campo '$campo' no está asociado a la olimpiada.");
                }
    
                // Verificar si el campo es obligatorio y está vacío
                if ($idOlimpiadaCampoPostulante->esObligatorio && empty($fila[$key])) {
                    throw new \Exception("El campo '$campo' es obligatorio y no puede estar vacío.");
                }
    
                // Insertar el dato adicional del postulante
                DB::table('dato_postulante')->insert([
                    'id_postulante' => $idPostulante,
                    'valor' => $fila[$key],
                    'id_olimpiada_campo_postulante' => $idOlimpiadaCampoPostulante->id,
                ]);
            }
        }
    }

    /**
     * Insertar registro e inscripción.
     */
    private function insertarRegistroEInscripcion($fila, $encabezados, $idPostulante, $idEncargado, $idOlimpiada)
    {
        // Obtener el ID del grado
        $idGrado = DB::table('grado')
            ->where('nombre', $fila[array_search('grado', $encabezados)])
            ->value('id');

        if (!$idGrado) {
            throw new \Exception("El grado '" . $fila[array_search('grado', $encabezados)] . "' no es válido.");
        }

        // Insertar el registro
        $idRegistro = DB::table('registro')->insertGetId([
            'id_olimpiada' => $idOlimpiada,
            'id_encargado' => $idEncargado,
            'id_postulante' => $idPostulante,
            'id_grado' => $idGrado,
        ]);

        if (!$idRegistro) {
            throw new \Exception("No se pudo insertar el registro.");
        }

        // Obtener el ID del área
        $idArea = DB::table('area')
            ->where('nombre', $fila[array_search('area', $encabezados)])
            ->value('id');

        if (!$idArea) {
            throw new \Exception("El área '" . $fila[array_search('area', $encabezados)] . "' no es válida.");
        }

        // Obtener el ID del nivel categoría
        $idNivelCategoria = DB::table('nivel_categoria')
            ->where('nombre', $fila[array_search('nivel_categoria', $encabezados)])
            ->value('id');

        if (!$idNivelCategoria) {
            throw new \Exception("El nivel categoría '" . $fila[array_search('nivel_categoria', $encabezados)] . "' no es válido.");
        }

        // Obtener el ID de la opción de inscripción
        $idOpcionInscripcion = DB::table('opcion_inscripcion')
            ->where('id_olimpiada', $idOlimpiada)
            ->where('id_area', $idArea)
            ->where('id_nivel_categoria', $idNivelCategoria)
            ->value('id');

        if (!$idOpcionInscripcion) {
            throw new \Exception("La combinación de área, nivel categoría y olimpiada no es válida.");
        }

        // Insertar la inscripción
        DB::table('inscripcion')->insert([
            'id_registro' => $idRegistro,
            'id_opcion_inscripcion' => $idOpcionInscripcion,
        ]);
        return $idRegistro;
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
