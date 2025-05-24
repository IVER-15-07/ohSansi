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
                'id_persona' => 2,
                'correo' => 'dylanalex.becerraricaldi2014@gmail.com',
            ],
            [
                'id_persona' => 1,
                'correo' => 'lili@gmail.com',
            ],
        ];
        
        foreach ($encargados as $encargado) {
            Encargado::create($encargado);
        }

        Schema::enableForeignKeyConstraints();
    }
}
