<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Encargado;
use Illuminate\Support\Facades\Schema;

class EncargadoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();

        Encargado::truncate();
        $encargados = [
            [
                'ci' => '12748339',
                'nombre' => 'Dylan Alexander',
                'apellido' => 'Becerra Ricaldi',
                'fecha_nacimiento' => '2004-04-02',
                'telefono' => '72299681',
                'correo' => 'dylanalex.becerraricaldi2014@gmail.com',
            ],
            [
                'ci' => '11111111',
                'nombre' => 'Lili',
                'apellido' => 'Lili',
                'fecha_nacimiento' => '2011-11-01',
                'telefono' => '11111111',
                'correo' => 'lili@gmail.com',
            ],
            [
                'ci' => '22222222',
                'nombre' => 'Lala',
                'apellido' => 'Lala',
                'fecha_nacimiento' => '2012-12-02',
                'telefono' => '22222222',
                'correo' => 'lala@gmail.com',
            ],
            [
                'ci' => '33333333',
                'nombre' => 'Lolo',
                'apellido' => 'Lolo',
                'fecha_nacimiento' => '2013-01-03',
                'telefono' => '33333333',
                'correo' => 'lolo@gmail.com',
            ],
            [
                'ci' => '44444444',
                'nombre' => 'Lulu',
                'apellido' => 'Lulu',
                'fecha_nacimiento' => '2014-02-04',
                'telefono' => '44444444',
                'correo' => 'lulu@gmail.com',
            ],
        ];
        
        foreach ($encargados as $encargado) {
            Encargado::create($encargado);
        }

        Schema::enableForeignKeyConstraints();
    }
}
