<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DatoTutor;

class DatoTutorController extends Controller
{
    public function almacenarDatosTutor(Request $request)
    {
        $validatedData = $request->validate([
            'id_tutor' => 'required|integer|exists:tutor,id',
            'datos' => 'required|array|min:1',
            'datos.*.idOlimpiadaCampoTutor' => 'required|integer|exists:olimpiada_campo_tutor,id',
            'datos.*.valor' => 'nullable|string|max:255',
        ]);

        $idTutor = $validatedData['id_tutor'];
        $datos = $validatedData['datos'];

        $datosGuardados = [];
        foreach ($datos as $dato) {
            $datoTutor = DatoTutor::updateOrCreate(
                [
                    'id_tutor' => $idTutor,
                    'id_olimpiada_campo_tutor' => $dato['idOlimpiadaCampoTutor'],
                ],
                [
                    'valor' => $dato['valor'],
                ]
            );
            $datosGuardados[] = $datoTutor;
        }

        return response()->json([
            'success' => true,
            'message' => 'Datos del tutor almacenados correctamente.',
            'data' => $datosGuardados,
        ]);
    }
}
