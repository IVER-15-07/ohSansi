<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DatoPostulante;

class DatoPostulanteController extends Controller
{
    public function almacenarDatosPostulante(Request $request)
    {
        $validatedData = $request->validate([
            'id_postulante' => 'required|integer|exists:postulante,id',
            'datos' => 'required|array|min:1',
            'datos.*.idOlimpiadaCampoPostulante' => 'required|integer|exists:olimpiada_campo_postulante,id',
            'datos.*.valor' => 'nullable|string|max:255',
        ]);

        $idPostulante = $validatedData['id_postulante'];
        $datos = $validatedData['datos'];

        $datosGuardados = [];
        foreach ($datos as $dato) {
            $datoPostulante = DatoPostulante::updateOrCreate(
                [
                    'id_postulante' => $idPostulante,
                    'id_olimpiada_campo_postulante' => $dato['idOlimpiadaCampoPostulante'],
                ],
                [
                    'valor' => $dato['valor'],
                ]
            );
            $datosGuardados[] = $datoPostulante;
        }

        return response()->json([
            'success' => true,
            'message' => 'Datos del postulante almacenados correctamente.',
            'data' => $datosGuardados,
        ]);
    }
}
