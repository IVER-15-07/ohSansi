<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Grado;

class GradoSeeder extends Seeder
{
    public function run(): void
    {
        $grados = [
            'Primero',
            'Segundo',
            'Tercero',
            'Cuarto',
            'Quinto',
            'Sexto'
        ];

        foreach ($grados as $nombre) {
            Grado::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
