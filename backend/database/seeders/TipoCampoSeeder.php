<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TipoCampo;
use Illuminate\Support\Facades\Schema;

class TipoCampoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        TipoCampo::truncate();
        
        $TiposCampo = [
            [
                'nombre' => 'text',
                'esLista' => 0,
            ],
            [
                'nombre' => 'email',
                'esLista' => 0,
            ],
            [
                'nombre' => 'date',
                'esLista' => 0,
            ],
            [
                'nombre' => 'number',
                'esLista' => 0,
            ],
            [
                'nombre' => 'textarea',
                'esLista' => 0,
            ],
            [
                'nombre' => 'select',
                'esLista' => 1,
            ],
            [
                'nombre' => 'checkbox',
                'esLista' => 1,
            ],
            [
                'nombre' => 'radio',
                'esLista' => 1,
            ],
            [
                'nombre' => 'file',
                'esLista' => 0,
            ],
            [
                'nombre' => 'url',
                'esLista' => 0,
            ],
            [
                'nombre' => 'tel',
                'esLista' => 0,
            ],
        ];
        foreach ($TiposCampo as $tipoCampo) {
            TipoCampo::create($tipoCampo);
        }
    }
}
