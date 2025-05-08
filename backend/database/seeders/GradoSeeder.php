<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Grado;
use Illuminate\Support\Facades\Schema;

class GradoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Desactivar verificación de claves foráneas
        Schema::disableForeignKeyConstraints();
        
        // Limpiar la tabla grado
        Grado::truncate();

        $grados = [
            ['nombre' => '1ro Primaria'],
            ['nombre' => '2do Primaria'],
            ['nombre' => '3ro Primaria'],
            ['nombre' => '4to Primaria'],
            ['nombre' => '5to Primaria'],
            ['nombre' => '6to Primaria'],
            ['nombre' => '1ro Secundaria'],
            ['nombre' => '2do Secundaria'],
            ['nombre' => '3ro Secundaria'],
            ['nombre' => '4to Secundaria'],
            ['nombre' => '5to Secundaria'],
            ['nombre' => '6to Secundaria'],
        ];

        foreach ($grados as $grado) {
            Grado::create($grado);
        }

        // Reactivar verificación de claves foráneas
        Schema::enableForeignKeyConstraints();
    }
}
