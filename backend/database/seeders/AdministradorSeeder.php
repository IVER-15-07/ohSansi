<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdministradorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('administrador')->insert([
            [
                'usuario' => 'admin',
                'password' => Hash::make('SuperNovaSoftEsLaLey2025'),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
