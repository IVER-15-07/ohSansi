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
            // Beni
            ['nombre' => 'Cercado', 'departamento' => 'Beni'],
            ['nombre' => 'Ballivián', 'departamento' => 'Beni'],
            ['nombre' => 'Moxos', 'departamento' => 'Beni'],
            ['nombre' => 'Marbán', 'departamento' => 'Beni'],
            ['nombre' => 'Yacuma', 'departamento' => 'Beni'],
            ['nombre' => 'Vaca Díez', 'departamento' => 'Beni'],
            ['nombre' => 'Mamoré', 'departamento' => 'Beni'],
            ['nombre' => 'Iténez', 'departamento' => 'Beni'],
            // Chuquisaca
            ['nombre' => 'Oropeza', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Azurduy', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Tomina', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Yamparáez', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Zudáñez', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Hernando Siles', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Belisario Boeto', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Luis Calvo', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Nor Cinti', 'departamento' => 'Chuquisaca'],
            ['nombre' => 'Sud Cinti', 'departamento' => 'Chuquisaca'],
            // Cochabamba
            ['nombre' => 'Cercado', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Arani', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Arque', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Ayopaya', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Capinota', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Carrasco', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Chapare', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Esteban Arce', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Germán Jordán', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Mizque', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Punata', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Quillacollo', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Tapacarí', 'departamento' => 'Cochabamba'],
            ['nombre' => 'Tiraque', 'departamento' => 'Cochabamba'],
            // La Paz
            ['nombre' => 'Murillo', 'departamento' => 'La Paz'],
            ['nombre' => 'Abel Iturralde', 'departamento' => 'La Paz'],
            ['nombre' => 'Aroma', 'departamento' => 'La Paz'],
            ['nombre' => 'Bautista Saavedra', 'departamento' => 'La Paz'],
            ['nombre' => 'Caranavi', 'departamento' => 'La Paz'],
            ['nombre' => 'Eliodoro Camacho', 'departamento' => 'La Paz'],
            ['nombre' => 'Franz Tamayo', 'departamento' => 'La Paz'],
            ['nombre' => 'Gualberto Villarroel', 'departamento' => 'La Paz'],
            ['nombre' => 'Ingavi', 'departamento' => 'La Paz'],
            ['nombre' => 'Inquisivi', 'departamento' => 'La Paz'],
            ['nombre' => 'José Ramón Loayza', 'departamento' => 'La Paz'],
            ['nombre' => 'Larecaja', 'departamento' => 'La Paz'],
            ['nombre' => 'Los Andes', 'departamento' => 'La Paz'],
            ['nombre' => 'Manco Kapac', 'departamento' => 'La Paz'],
            ['nombre' => 'Muñecas', 'departamento' => 'La Paz'],
            ['nombre' => 'Nor Yungas', 'departamento' => 'La Paz'],
            ['nombre' => 'Omasuyos', 'departamento' => 'La Paz'],
            ['nombre' => 'Pacajes', 'departamento' => 'La Paz'],
            ['nombre' => 'Pedro Domingo Murillo', 'departamento' => 'La Paz'],
            ['nombre' => 'Sud Yungas', 'departamento' => 'La Paz'],
            // Oruro
            ['nombre' => 'Cercado', 'departamento' => 'Oruro'],
            ['nombre' => 'Carangas', 'departamento' => 'Oruro'],
            ['nombre' => 'Eduardo Avaroa', 'departamento' => 'Oruro'],
            ['nombre' => 'Ladislao Cabrera', 'departamento' => 'Oruro'],
            ['nombre' => 'Litoral', 'departamento' => 'Oruro'],
            ['nombre' => 'Mejillones', 'departamento' => 'Oruro'],
            ['nombre' => 'Nor Carangas', 'departamento' => 'Oruro'],
            ['nombre' => 'Pantaleón Dalence', 'departamento' => 'Oruro'],
            ['nombre' => 'Poopó', 'departamento' => 'Oruro'],
            ['nombre' => 'Sajama', 'departamento' => 'Oruro'],
            ['nombre' => 'San Pedro de Totora', 'departamento' => 'Oruro'],
            ['nombre' => 'Saucarí', 'departamento' => 'Oruro'],
            ['nombre' => 'Sebastián Pagador', 'departamento' => 'Oruro'],
            ['nombre' => 'Sud Carangas', 'departamento' => 'Oruro'],
            // Pando
            ['nombre' => 'Abuná', 'departamento' => 'Pando'],
            ['nombre' => 'Federico Román', 'departamento' => 'Pando'],
            ['nombre' => 'Madre de Dios', 'departamento' => 'Pando'],
            ['nombre' => 'Manuripi', 'departamento' => 'Pando'],
            ['nombre' => 'Nicolás Suárez', 'departamento' => 'Pando'],
            // Potosí
            ['nombre' => 'Alonso de Ibáñez', 'departamento' => 'Potosi'],
            ['nombre' => 'Antonio Quijarro', 'departamento' => 'Potosi'],
            ['nombre' => 'Bernardino Bilbao', 'departamento' => 'Potosi'],
            ['nombre' => 'Charcas', 'departamento' => 'Potosi'],
            ['nombre' => 'Chayanta', 'departamento' => 'Potosi'],
            ['nombre' => 'Cornelio Saavedra', 'departamento' => 'Potosi'],
            ['nombre' => 'Daniel Campos', 'departamento' => 'Potosi'],
            ['nombre' => 'Enrique Baldivieso', 'departamento' => 'Potosi'],
            ['nombre' => 'José María Linares', 'departamento' => 'Potosi'],
            ['nombre' => 'Modesto Omiste', 'departamento' => 'Potosi'],
            ['nombre' => 'Nor Chichas', 'departamento' => 'Potosi'],
            ['nombre' => 'Nor Lípez', 'departamento' => 'Potosi'],
            ['nombre' => 'Rafael Bustillo', 'departamento' => 'Potosi'],
            ['nombre' => 'Sud Chichas', 'departamento' => 'Potosi'],
            ['nombre' => 'Sud Lípez', 'departamento' => 'Potosi'],
            ['nombre' => 'Tomás Frías', 'departamento' => 'Potosi'],
            // Santa Cruz
            ['nombre' => 'Andrés Ibáñez', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Ángel Sandoval', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Chiquitos', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Cordillera', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Florida', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Germán Busch', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Guarayos', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Ichilo', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Ignacio Warnes', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Manuel María Caballero', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Ñuflo de Chávez', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Obispo Santistevan', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Sara', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Vallegrande', 'departamento' => 'Santa Cruz'],
            ['nombre' => 'Velasco', 'departamento' => 'Santa Cruz'],
            // Tarija
            ['nombre' => 'Aniceto Arce', 'departamento' => 'Tarija'],
            ['nombre' => 'Burnet O’Connor', 'departamento' => 'Tarija'],
            ['nombre' => 'Cercado', 'departamento' => 'Tarija'],
            ['nombre' => 'Eustaquio Méndez', 'departamento' => 'Tarija'],
            ['nombre' => 'Gran Chaco', 'departamento' => 'Tarija'],
            ['nombre' => 'José María Avilés', 'departamento' => 'Tarija'],
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
