<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CampoPostulante;
use App\Models\OpcionCampoPostulante;

class OpcionCampoPostulanteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Crear departamentos (sin dependencia)
        $departamentos = [
            'Beni', 'Chuquisaca', 'Cochabamba', 'La Paz', 'Oruro', 'Pando', 'Potosi', 'Santa Cruz', 'Tarija'
        ];
        $departamentoCampo = CampoPostulante::where('nombre', 'Departamento')->first();
        $provinciaCampo = CampoPostulante::where('nombre', 'Provincia')->first();
        $ciudadCampo = CampoPostulante::where('nombre', 'Ciudad')->first();
        $opcionesDepartamento = [];
        foreach ($departamentos as $dep) {
            $opcionesDepartamento[$dep] = OpcionCampoPostulante::create([
                'id_campo_postulante' => $departamentoCampo->id,
                'valor' => $dep,
                'id_dependencia' => null,
            ]);
        }

        // 2. Crear provincias (dependen de departamento)
        $provincias = [
            // Ejemplo: puedes expandir con todas las provincias
            ['nombre' => 'Cercado', 'departamento' => 'Beni'],
            ['nombre' => 'Ballivián', 'departamento' => 'Beni'],
            ['nombre' => 'Oropeza', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Murillo', 'departamento' => 'La Paz'],
            ['nombre' => 'Cercado', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Andrés Ibáñez', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Cercado', 'departamento' => 'Tarija'],
            // ...
        ];
        $opcionesProvincia = [];
        foreach ($provincias as $prov) {
            $depOpcion = $opcionesDepartamento[$prov['departamento']] ?? null;
            $opcionesProvincia[$prov['nombre'].'|'.$prov['departamento']] = OpcionCampoPostulante::create([
                'id_campo_postulante' => $provinciaCampo->id,
                'valor' => $prov['nombre'],
                'id_dependencia' => $depOpcion ? $depOpcion->id : null,
            ]);
        }

        // 3. Crear ciudades (dependen de provincia)
        $ciudades = [
            ['nombre' => 'Trinidad', 'provincia' => 'Cercado', 'departamento' => 'Beni'],
            ['nombre' => 'Sucre', 'provincia' => 'Oropeza', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'La Paz', 'provincia' => 'Murillo', 'departamento' => 'La Paz'],
            ['nombre' => 'Cochabamba', 'provincia' => 'Cercado', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Santa Cruz de la Sierra', 'provincia' => 'Andrés Ibáñez', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Tarija', 'provincia' => 'Cercado', 'departamento' => 'Tarija'],
            // ...
        ];
        foreach ($ciudades as $ciu) {
            $provKey = $ciu['provincia'].'|'.$ciu['departamento'];
            $provOpcion = $opcionesProvincia[$provKey] ?? null;
            OpcionCampoPostulante::create([
                'id_campo_postulante' => $ciudadCampo->id,
                'valor' => $ciu['nombre'],
                'id_dependencia' => $provOpcion ? $provOpcion->id : null,
            ]);
        }
    }
}
