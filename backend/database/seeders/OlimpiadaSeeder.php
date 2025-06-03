<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Olimpiada;
use Illuminate\Support\Facades\Schema;

class OlimpiadaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        Olimpiada::truncate();
        
        $Olimpiadas = [
            ['nombre' => 'OH SANSI 2025',
            'convocatoria' => null,
            'descripcion' => 'La Olimpiada de Ciencias y Tecnologías más importante de Cochabamba en su versión 2025',
            'costo' => 20,
            'max_areas' => 3,
            'fecha_inicio' => '2025-05-01',
            'fecha_fin' => '2025-07-01',
            'inicio_inscripcion' => '2025-05-01',
            'fin_inscripcion' => '2025-07-01'],
            ['nombre' => 'Olimpiada de Invierno 2025',
            'convocatoria' => null,
            'descripcion' => 'Olimpiadas de Invierno 2025 organizadas por la Universidad de San Simón',
            'costo' => 10,
            'max_areas' => null,
            'fecha_inicio' => '2025-07-01',
            'fecha_fin' => '2025-07-14',
            'inicio_inscripcion' => '2025-07-02',
            'fin_inscripcion' => '2025-07-05'],
            [
            'nombre' => 'Olimpiada Test - Inscripciones Activas',
            'convocatoria' => null,
            'descripcion' => 'Olimpiada para probar validación de fechas',
            'costo' => 15,
            'max_areas' => 2,
            'fecha_inicio' => '2025-08-01',
            'fecha_fin' => '2025-08-15',
            'inicio_inscripcion' => '2025-05-20', // Ya pasó - NO permitirá configuración
            'fin_inscripcion' => '2025-06-20'
            ],
        ];
        foreach ($Olimpiadas as $olimpiada) {
            Olimpiada::create($olimpiada);
        }
    }
}
