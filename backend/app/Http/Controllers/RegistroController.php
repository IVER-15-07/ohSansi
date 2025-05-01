<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Registro;
use App\Models\Encargado;
use App\Models\Olimpiada;
use App\Models\Pago;
use App\Models\DatoInscripcion;
use Illuminate\Support\Facades\Cache;
use App\Models\Area;
use App\Models\NivelCategoria;

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
                'id_encargado' => 'required|exists:encargado,id',
            ]);

            // Crear el registro
            $registro = new Registro();
            $registro->id_encargado = $validated['id_encargado'];
            $registro->id_configuracion = null; // Establecer id_configuracion como null
            $registro->id_pago = null; // Establecer id_pago como null
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


    public function validarComprobante(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'apellido' => 'required|string',
            'olimpiada' => 'required|string',
            'monto' => 'required|string',
        ]);

        // Buscar encargado
        $encargado = Encargado::where('nombre', 'ilike', $request->nombre)
            ->where('apellido', 'ilike', $request->apellido)
            ->first();

        if (!$encargado) {
            return response()->json(['error' => 'Encargado no encontrado'], 404);
        }

        // Buscar olimpiada
        $olimpiada = Olimpiada::where('nombre', 'ilike', $request->olimpiada)->first();
        if (!$olimpiada) {
            return response()->json(['error' => 'Olimpiada no encontrada'], 404);
        }

        // Buscar pago por monto y estado
        $pago = Pago::where('monto', $request->monto)
            ->where('estado', false)
            ->first();

        if (!$pago) {
            return response()->json(['error' => 'Pago no encontrado o ya validado'], 404);
        }

        // Buscar registro con los tres IDs
        $registro = Registro::where('id_encargado', $encargado->id)
            ->where('id_olimpiada', $olimpiada->id)
            ->where('id_pago', $pago->id)
            ->first();

        if (!$registro) {
            return response()->json(['error' => 'Registro no encontrado con esos datos'], 404);
        }

        return response()->json([
            'success' => true,
            'registro' => $registro,
        ]);
    }

    public function registrarListaPostulantes(Request $request)
    {
        try {
            // Validar los datos enviados
            $validated = $request->validate([
                'id_encargado' => 'required|exists:encargado,id',
                'id_opcion_inscripcion' => 'required|exists:opcion_inscripcion,id',
                'id_olimpiada' => 'required|exists:olimpiada,id',
                'postulantes' => 'required|array',
                'postulantes.*.nombres' => 'required|string|max:255',
                'postulantes.*.apellidos' => 'required|string|max:255',
                'postulantes.*.ci' => 'required|string|max:20|unique:registro,ci',
                'postulantes.*.area.nombre' => 'required|string|max:255',
                'postulantes.*.area.categoria' => 'required|string|max:255',
                'postulantes.*.datos_inscripcion' => 'required|array',
                'postulantes.*.datos_inscripcion.*.id_seccion_campo' => 'required|exists:seccion_campo,id',
                'postulantes.*.datos_inscripcion.*.campos' => 'required|array',
                'postulantes.*.datos_inscripcion.*.campos.*.id_campo_inscripcion' => 'required|exists:campo_inscripcion,id',
                'postulantes.*.datos_inscripcion.*.campos.*.valor' => 'required|string',
            ]);

            $idEncargado = $validated['id_encargado'];
            $idOpcionInscripcion = $validated['id_opcion_inscripcion'];
            $idOlimpiada = $validated['id_olimpiada'];

            foreach ($validated['postulantes'] as $postulanteData) {
                // Validar que el área pertenezca a la olimpiada
                $area = Area::where('nombre', $postulanteData['area']['nombre'])
                    ->whereHas('opciones_inscripcion', function ($query) use ($idOlimpiada) {
                        $query->where('id_olimpiada', $idOlimpiada);
                    })
                    ->first();

                if (!$area) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El área "' . $postulanteData['area']['nombre'] . '" no está asociada a la olimpiada especificada.',
                    ], 422);
                }

                // Validar que la categoría o nivel pertenezca a la olimpiada
                $categoriaONivel = NivelCategoria::where('nombre', $postulanteData['area']['categoria'])
                    ->whereHas('opciones_inscripcion', function ($query) use ($idOlimpiada) {
                        $query->where('id_olimpiada', $idOlimpiada);
                    })
                    ->where('esNivel', $postulanteData['area']['categoria'] === 'nivel' ? 't' : 'f') // Diferenciar nivel o categoría
                    ->first();

                if (!$categoriaONivel) {
                    return response()->json([
                        'success' => false,
                        'message' => 'La categoría o nivel "' . $postulanteData['area']['categoria'] . '" no está asociado(a) a la olimpiada especificada.',
                    ], 422);
                }

                // Crear el registro del postulante
                $registro = Registro::create([
                    'nombres' => $postulanteData['nombres'],
                    'apellidos' => $postulanteData['apellidos'],
                    'ci' => $postulanteData['ci'],
                    'id_opcion_inscripcion' => $idOpcionInscripcion,
                    'id_encargado' => $idEncargado,
                    'id_pago' => null, // No se asocia ningún pago en este paso
                    'id_area' => $area->id, // Asociar el área
                    'id_categoria' => $categoria->id, // Asociar la categoría
                ]);

                // Crear los datos de inscripción asociados
                foreach ($postulanteData['datos_inscripcion'] as $seccion) {
                    foreach ($seccion['campos'] as $campo) {
                        DatoInscripcion::create([
                            'id_registro' => $registro->id,
                            'id_campo_inscripcion' => $campo['id_campo_inscripcion'],
                            'valor' => $campo['valor'],
                        ]);
                    }
                }
            }

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

    public function obtenerDatosInscripcion()
    {
        try {
            $datosInscripcion = Cache::remember('dato_inscripcion', 3600, function () {
                return DatoInscripcion::all();
            });

            return response()->json([
                'success' => true,
                'message' => 'datos obtenidos exitosamente.',
                'data' => $datosInscripcion,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Error al obtener los datos de inscripción: ' . $e->getMessage(),
            ], 500);
        }
    }
}
