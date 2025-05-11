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
                'ci' => '12345678',
                'nombres' => 'Juan',
                'apellidos' => 'Pérez',
                'fecha_nacimiento' => '2005-01-01',
            ],
            [
                'ci' => '87654321',
                'nombres' => 'María',
                'apellidos' => 'Gómez',
                'fecha_nacimiento' => '2006-02-02',
            ],
            [
                'ci' => '11223344',
                'nombres' => 'Carlos',
                'apellidos' => 'López',
                'fecha_nacimiento' => '2007-03-03',
            ],
            [
                'ci' => '44332211',
                'nombres' => 'Ana',
                'apellidos' => 'Martínez',
                'fecha_nacimiento' => '2008-04-04',
            ],
            [
                'ci' => '55667788',
                'nombres' => 'Luis',
                'apellidos' => 'Fernández',
                'fecha_nacimiento' => '2009-05-05',
            ],
            [
                'ci' => '99887766',
                'nombres' => 'Laura',
                'apellidos' => 'Ramírez',
                'fecha_nacimiento' => '2010-06-06',
            ],
            [
                'ci' => '22334455',
                'nombres' => 'Javier',
                'apellidos' => 'Torres',
                'fecha_nacimiento' => '2011-07-07',
            ],
            [
                'ci' => '33445566',
                'nombres' => 'Sofía',
                'apellidos' => 'Hernández',
                'fecha_nacimiento' => '2012-08-08',
            ],
            [
                'ci' => '44556677',
                'nombres' => 'Diego',
                'apellidos' => 'Gutiérrez',
                'fecha_nacimiento' => '2013-09-09',
            ],
            [
                'ci' => '55667788',
                'nombres' => 'Valentina',
                'apellidos' => 'Cruz',
                'fecha_nacimiento' => '2014-10-10',
            ],
            // Agrega más postulantes según sea necesario
        ];

        foreach ($postulantes as $postulante) {
            Postulante::create($postulante);
        }
        
        Schema::enableForeignKeyConstraints();
    }
}
