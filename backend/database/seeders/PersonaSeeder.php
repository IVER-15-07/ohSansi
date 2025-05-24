<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Persona;
use Illuminate\Support\Facades\Schema;

class PersonaSeeder extends Seeder
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
        Persona::truncate();

        // Crear 10 postulantes de ejemplo
        $personas = [
            [
                'ci' => '11111111',
                'nombres' => 'Lili',
                'apellidos' => 'Lili',
                'fecha_nacimiento' => '2011-11-11',
            ],
            [
                'ci' => '12748339',
                'nombres' => 'Dylan Alexander',
                'apellidos' => 'Becerra Ricaldi',
                'fecha_nacimiento' => '2004-04-02',
            ],
            [
                'ci' => '22222222',
                'nombres' => 'Lulu',
                'apellidos' => 'Lulu',
                'fecha_nacimiento' => '2012-12-12',
            ],
            [
                'ci' => '12345678',
                'nombres' => 'Jose Miguel',
                'apellidos' => 'Rodriguez',
                'fecha_nacimiento' => '2003-03-31',
            ],
            [
                'ci' => '66666666',
                'nombres' => 'Leonardo Johnny',
                'apellidos' => 'Rivas Olivera',
                'fecha_nacimiento' => '2004-05-19',
            ],
            [
                'ci' => '77777777',
                'nombres' => 'Jorge',
                'apellidos' => 'Ramírez',
                'fecha_nacimiento' => '2010-06-06',
            ],
            [
                'ci' => '88888888',
                'nombres' => 'Ana Maria',
                'apellidos' => 'Gonzalez',
                'fecha_nacimiento' => '2013-07-07',
            ],
            [
                'ci' => '99999999',
                'nombres' => 'Carlos Alberto',
                'apellidos' => 'Fernandez',
                'fecha_nacimiento' => '2014-08-08',
            ],
        ];

        foreach ($personas as $persona) {
            Persona::create($persona);
        }

        Schema::enableForeignKeyConstraints();
    }
}
