<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inscripcion;
use Illuminate\Support\Facades\Schema;

class InscripcionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Inscripcion::truncate();

        $inscripciones = [
            [
                'id_registro' => 1,
                'id_opcion_inscripcion' => 10,
                'id_pago' => null,
            ],
            [
                'id_registro' => 2,
                'id_opcion_inscripcion' => 1,
                'id_pago' => null,
            ],
            [
                'id_registro' => 2,
                'id_opcion_inscripcion' => 7,
                'id_pago' => null,
            ],
            [
                'id_registro' => 2,
                'id_opcion_inscripcion' => 4,
                'id_pago' => null,
            ],
            [
                'id_registro' => 4,
                'id_opcion_inscripcion' => 12,
                'id_pago' => null,
            ]
        ];

        foreach ($inscripciones as $inscripcion) {
            Inscripcion::create($inscripcion);
        }
        Schema::enableForeignKeyConstraints();
    }
}
