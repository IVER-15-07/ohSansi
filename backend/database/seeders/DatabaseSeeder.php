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

        $this->call(OlimpiadaSeeder::class); //

        $this->call(OpcionInscripcionSeeder::class);//

        $this->call(PersonaSeeder::class);//

        $this->call(EncargadoSeeder::class);//

        $this->call(PostulanteSeeder::class);//

        $this->call(RegistroSeeder::class);//

        $this->call(InscripcionSeeder::class);//

        $this->call(TutorSeeder::class);//
        
        $this->call(CampoTutorSeeder::class);

        $this->call(CampoPostulanteSeeder::class);

        $this->call(OpcionCampoPostulanteSeeder::class);
        
        $this->call(OlimpiadaCampoPostulanteSeeder::class);//

        $this->call(OlimpiadaCampoTutorSeeder::class);//

        $this->call(RolTutorSeeder::class);

        $this->call(AdministradorSeeder::class);

        $this->call(DatoPostulanteSeeder::class);
    }
}
