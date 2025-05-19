<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OlimpiadaCampoTutor;
use Illuminate\Support\Facades\Schema;

class OlimpiadaCampoTutorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        OlimpiadaCampoTutor::truncate();
        $olimpiadaCamposTutor = [
            [
                'id_olimpiada' => 1,
                'id_campo_tutor' => 1,
                'esObligatorio' => true,
            ],
            [
                'id_olimpiada' => 1,
                'id_campo_tutor' => 2,
                'esObligatorio' => true,
            ],
            [
                'id_olimpiada' => 2,
                'id_campo_tutor' => 1,
                'esObligatorio' => true,
            ],
            [
                'id_olimpiada' => 2,
                'id_campo_tutor' => 2,
                'esObligatorio' => false,
            ],
        ];
        
        foreach ($olimpiadaCamposTutor as $olimpiadaCampoTutor) {
            OlimpiadaCampoTutor::create($olimpiadaCampoTutor);
        };

        Schema::enableForeignKeyConstraints();
    }
}
