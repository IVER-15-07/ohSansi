<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CampoPostulante;
use Illuminate\Support\Facades\Schema;

class CampoPostulanteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        CampoPostulante::truncate();
        $campos = [
            [
                'nombre' => "Unidad Educativa",
                'id_tipo_campo' => 1,
            ],
            [
                'nombre' => "Departamento",
                'id_tipo_campo' => 7,
                'esLista'=> true,
            ],
            [
                'nombre' => "Provincia",
                'id_tipo_campo' => 7,
                'id_dependencia' => 2,
                'esLista'=> true,
            ],
            [
                'nombre' => "Ciudad",
                'id_tipo_campo' => 7,
                'id_dependencia' => 3,
                'esLista'=> true,
            ],
            [
                'nombre' => "Correo Electronico",
                'id_tipo_campo' => 2,
            ],
        ];
        foreach ($campos as $campo) {
            CampoPostulante::create($campo);
        }
        Schema::enableForeignKeyConstraints();
    }
}
