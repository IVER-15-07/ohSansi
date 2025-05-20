<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tutor; 
use Illuminate\Support\Facades\Schema;
class TutorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();

        Tutor::truncate();

        $tutores = [
            [
                'ci' => '12748339',
                'nombres' => 'Dylan Alexander',
                'apellidos' => 'Becerra Ricaldi',
            ], 
            [
                'ci' => '11111111',
                'nombres' => 'Lili',
                'apellidos' => 'Lili',
            ],
            [
                'ci' => '22222222',
                'nombres' => 'Lala',
                'apellidos' => 'Lala',
            ],
            [
                'ci' => '33333333',
                'nombres' => 'Lolo',
                'apellidos' => 'Lolo',
            ],
            [
                'ci' => '44444444',
                'nombres' => 'Lulu',
                'apellidos' => 'Lulu',
            ]
        ];

        foreach ($tutores as $tutor) {
            Tutor::create($tutor);
        }
    }
}
