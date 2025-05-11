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
        $this->call(TipoCampoSeeder::class);

        $this->call(GradoSeeder::class);
        
        $this->call(NivelCategoriaSeeder::class);
        
        $this->call(AreaSeeder::class);

        $this->call(OlimpiadaSeeder::class);

        $this->call(OpcionInscripcionSeeder::class);

        $this->call(PostulanteSeeder::class);
        
        $this->call(CampoTutorSeeder::class);

        $this->call(PostulanteSeeder::class);

        $this->call(RolTutorSeeder::class);
    }
}
