<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RolTutor;
use Illuminate\Support\Facades\Schema;

class RolTutorSeeder extends Seeder
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
        RolTutor::truncate();

        $rolesTutor = [
            ['nombre' => 'Profesor'],
            ['nombre' => 'Papá'],
            ['nombre' => 'Mamá'],
        ];

        foreach ($areas as $area) {
            RolTutor::create($rolesTutor);
        }

        // Reactivar verificación de claves foráneas
        Schema::enableForeignKeyConstraints();
    }
}
