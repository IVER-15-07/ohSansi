<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use Illuminate\Support\Facades\Schema;

class AreaSeeder extends Seeder
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
        Area::truncate();

        $areas = [
            ['nombre' => 'Astronomía - Astrofísica'],
            ['nombre' => 'Biología'],
            ['nombre' => 'Física'],
            ['nombre' => 'Informática'],
            ['nombre' => 'Matemáticas'],
            ['nombre' => 'Química'],
            ['nombre' => 'Robótica'],
        ];

        foreach ($areas as $area) {
            Area::create($area);
        }

        // Reactivar verificación de claves foráneas
        Schema::enableForeignKeyConstraints();
    }
}
