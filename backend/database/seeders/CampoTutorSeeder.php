<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CampoTutor;
use Illuminate\Support\Facades\Schema;

class CampoTutorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        CampoTutor::truncate();
        $campos = [
            [
                'nombre' => "Correo Electronico",
                'id_tipo_campo' => 2,
            ],
            [
                'nombre' => "Telefono",
                'id_tipo_campo' => 11,
            ],
        ];
        foreach ($campos as $campo) {
            CampoTutor::create($campo);
        }
        Schema::enableForeignKeyConstraints();
    }
}
