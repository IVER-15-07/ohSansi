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
                'id_persona' => 2,
            ], 
            [
                'id_persona' => 4,
            ],
            [
                'id_persona' => 5,
            ],
        ];

        foreach ($tutores as $tutor) {
            Tutor::create($tutor);
        }
    }
}
