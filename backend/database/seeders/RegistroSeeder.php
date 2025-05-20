<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Registro;
use Illuminate\Support\Facades\Schema;

class RegistroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Registro::truncate();

        $registros = [
            [
                'id_olimpiada' => 1,
                'id_encargado' => 1,
                'id_postulante' => 1,
                'id_grado' => 6,
            ],
            [
                'id_olimpiada' => 1,
                'id_encargado' => 1,
                'id_postulante' => 2,
                'id_grado' => 7,
            ],
            [
                'id_olimpiada' => 1,
                'id_encargado' => 1,
                'id_postulante' => 3,
                'id_grado' => 8,
            ],
            [
                'id_olimpiada' => 2,
                'id_encargado' => 1,
                'id_postulante' => 1,
                'id_grado' => 10,
            ],
            [
                'id_olimpiada' => 1,
                'id_encargado' => 2,
                'id_postulante' => 4,
                'id_grado' => 10,
            ]
        ];
        foreach ($registros as $registro) {
            Registro::create($registro);
        };
        Schema::enableForeignKeyConstraints();
    }
}
