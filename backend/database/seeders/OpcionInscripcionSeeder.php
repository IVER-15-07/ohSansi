<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OpcionInscripcion;
use Illuminate\Support\Facades\Schema;

class OpcionInscripcionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        
        OpcionInscripcion::truncate();

        $opcionesInscripcion = [
            [
                'id_olimpiada' => 1,
                'id_area' => 3,
                'id_nivel_categoria' => 1,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 3,
                'id_nivel_categoria' => 2,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 3,
                'id_nivel_categoria' => 3,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 5,
                'id_nivel_categoria' => 1,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 5,
                'id_nivel_categoria' => 2,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 5,
                'id_nivel_categoria' => 3,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 6,
                'id_nivel_categoria' => 1,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 6,
                'id_nivel_categoria' => 2,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 6,
                'id_nivel_categoria' => 3,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 4,
                'id_nivel_categoria' => 7,
            ],
            [
                'id_olimpiada' => 1,
                'id_area' => 4,
                'id_nivel_categoria' => 8,
            ],
            [
                'id_olimpiada' => 2,
                'id_area' => 1,
                'id_nivel_categoria' => 4,
            ],
            [
                'id_olimpiada' => 2,
                'id_area' => 1,
                'id_nivel_categoria' => 5,
            ],
            [
                'id_olimpiada' => 2,
                'id_area' => 2,
                'id_nivel_categoria' => 6,
            ],
        ];
        foreach ($opcionesInscripcion as $opcionInscripcion) {
            $opcion = new OpcionInscripcion();
            $opcion->id_olimpiada = $opcionInscripcion['id_olimpiada'];
            $opcion->id_area = $opcionInscripcion['id_area'];
            $opcion->id_nivel_categoria = $opcionInscripcion['id_nivel_categoria'];
            $opcion->save();
        }
        Schema::enableForeignKeyConstraints();
    }
}
