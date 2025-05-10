<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(GradoSeeder::class);
        
        $this->call(NivelCategoriaSeeder::class);
        
        $this->call(AreaSeeder::class);

        $this->call(RolTutorSeeder::class);
    }
}
