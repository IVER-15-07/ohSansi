<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Postulante;
use Illuminate\Support\Facades\Schema;

class PostulanteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        
        // Limpiar la tabla postulante
        Postulante::truncate();

        // Crear 10 postulantes de ejemplo
        $postulantes = [
            [
                'id_persona' => 1,
            ],
            [
                'id_persona' => 3,
            ],
            [
                'id_persona' => 6
            ],
            [
                'id_persona' => 7,
            ],
            [
                'id_persona' => 8,
            ],
        ];

        foreach ($postulantes as $postulante) {
            Postulante::create($postulante);
        }

        Schema::enableForeignKeyConstraints();
    }
}
