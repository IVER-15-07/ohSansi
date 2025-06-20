<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DatoPostulante;
use Illuminate\Support\Facades\Schema;

class DatoPostulanteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        DatoPostulante::truncate();

        $datos = [
            [
                'id_postulante' => 1,
                'valor' => 'Unidad Educativa San Martín',
                'id_olimpiada_campo_postulante' => 1,
            ],
            [
                'id_postulante' => 1,
                'valor' => 'Chuquisaca',
                'id_olimpiada_campo_postulante' => 2,
            ],
            [
                'id_postulante' => 1,
                'valor' => 'Tomina',
                'id_olimpiada_campo_postulante' => 3,
            ],
            [
                'id_postulante' => 1,
                'valor' => 'ElPro54@gmail.com',
                'id_olimpiada_campo_postulante' => 4,
            ],
            [
                'id_postulante' => 2,
                'valor' => 'Unidad Educativa Don Bosco',
                'id_olimpiada_campo_postulante' => 1,
            ],
            [
                'id_postulante' => 2,
                'valor' => 'Cochabamba',
                'id_olimpiada_campo_postulante' => 2,
            ],
            [
                'id_postulante' => 2,
                'valor' => 'Cercado',
                'id_olimpiada_campo_postulante' => 3,
            ],
            [
                'id_postulante' => 2,
                'valor' => 'nuyeRE@gmail.com',
                'id_olimpiada_campo_postulante' => 4,
            ],
            [
                'id_postulante' => 3,
                'valor' => 'Unidad Educativa San Alejandro',
                'id_olimpiada_campo_postulante' => 1,
            ],
            [
                'id_postulante' => 3,
                'valor' => 'Santa Cruz',
                'id_olimpiada_campo_postulante' => 2,
            ],
            [
                'id_postulante' => 3,
                'valor' => 'Andrés Ibáñez',
                'id_olimpiada_campo_postulante' => 3,
            ],
            [
                'id_postulante' => 3,
                'valor' => 'najidn@gmail.com',
                'id_olimpiada_campo_postulante' => 4,
            ],
            [
                'id_postulante' => 4,
                'valor' => 'Unidad Educativa Marillac',
                'id_olimpiada_campo_postulante' => 1,
            ],
            [
                'id_postulante' => 4,
                'valor' => 'Beni',
                'id_olimpiada_campo_postulante' => 2,
            ],
            [
                'id_postulante' => 4,
                'valor' => 'Cercado',
                'id_olimpiada_campo_postulante' => 3,
            ],
            [
                'id_postulante' => 4,
                'valor' => '66hdh@gmail.com',
                'id_olimpiada_campo_postulante' => 4,
            ],
        ];

        foreach ($datos as $dato) {
            DatoPostulante::create($dato);
        }

        Schema::enableForeignKeyConstraints();
    }
}