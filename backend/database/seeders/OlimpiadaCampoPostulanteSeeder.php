<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OlimpiadaCampoPostulante;
use Illuminate\Support\Facades\Schema;


class OlimpiadaCampoPostulanteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        OlimpiadaCampoPostulante::truncate();
        $olimpiadaCamposPostulante = [
            [
                'id_olimpiada' => 1,
                'id_campo_postulante' => 1,
                'esObligatorio' => true,
            ],
            [
                'id_olimpiada' => 1,
                'id_campo_postulante' => 2,
                'esObligatorio' => true,
            ],
            [
                'id_olimpiada' => 1,
                'id_campo_postulante' => 3,
                'esObligatorio' => true,
            ],
            [
                'id_olimpiada' => 1,
                'id_campo_postulante' => 4,
                'esObligatorio' => false,
            ],
            [
                'id_olimpiada' => 2,
                'id_campo_postulante' => 1,
                'esObligatorio' => false,
            ],
            [
                'id_olimpiada' => 2,
                'id_campo_postulante' => 2,
                'esObligatorio' => true,
            ],
            [
                'id_olimpiada' => 2,
                'id_campo_postulante' => 3,
                'esObligatorio' => true,
            ],
        ];
        foreach ($olimpiadaCamposPostulante as $olimpiadaCampoPostulante) {
            OlimpiadaCampoPostulante::create($olimpiadaCampoPostulante);
        }
        Schema::enableForeignKeyConstraints();
    }
}
