<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NivelCategoria;
use App\Models\Grado;
use App\Models\NivelCategoriaGrado;
use Illuminate\Support\Facades\Schema;

class NivelCategoriaSeeder extends Seeder
{
    public function run()
    {
        // Desactivar verificación de claves foráneas
        Schema::disableForeignKeyConstraints();
        
        // Limpiar la tabla nivel_categoria
        NivelCategoria::truncate();
        
        // También limpiamos la tabla pivot que relaciona niveles con grados (si existe)
        if (Schema::hasTable('nivel_categoria_grado')) {
            NivelCategoriaGrado::truncate();
        }
        
        // Definir niveles y categorías
        $nivelesCategoria = [
            // Niveles (esNivel = true)
            [
                'nombre' => 'Primer Nivel',
                'esNivel' => true,
                'grados' => [7], // IDs de grados asociados
            ],
            [
                'nombre' => 'Segundo Nivel',
                'esNivel' => true,
                'grados' => [8], // IDs de grados asociados
            ],
            [
                'nombre' => 'Tercer Nivel',
                'esNivel' => true,
                'grados' => [9], // IDs de grados asociados
            ],
            [
                'nombre' => 'Cuarto Nivel',
                'esNivel' => true,
                'grados' => [10], // IDs de grados asociados
            ],
            [
                'nombre' => 'Quinto Nivel',
                'esNivel' => true,
                'grados' => [11], // IDs de grados asociados
            ],
            [
                'nombre' => 'Sexto Nivel',
                'esNivel' => true,
                'grados' => [12], // IDs de grados asociados
            ],
            
            // Categorías (esNivel = false)
            [
                'nombre' => 'Guacamayo',
                'esNivel' => false,
                'grados' => [5, 6], // IDs de grados asociados
            ],
            [
                'nombre' => 'Guanaco',
                'esNivel' => false,
                'grados' => [7, 8, 9], // IDs de grados asociados
            ],
            [
                'nombre' => 'Londra',
                'esNivel' => false,
                'grados' => [7, 8, 9], // IDs de grados asociados
            ],
            [
                'nombre' => 'Jucumari',
                'esNivel' => false,
                'grados' => [10, 11, 12], // IDs de grados asociados
            ],
        ];
        
        // Verificar que existan los grados
        $this->verificarGrados();
        
        // Insertar niveles y categorías y establecer relaciones con grados
        foreach ($nivelesCategoria as $item) {
            // Extraer los grados asociados
            $gradosAsociados = $item['grados'] ?? [];
            unset($item['grados']);
            
            // Crear el nivel o categoría
            $nivelCategoria = NivelCategoria::create($item);
            
            // Asociar los grados correspondientes
            if (!empty($gradosAsociados)) {
                $this->asociarGrados($nivelCategoria, $gradosAsociados);
            }
        }
        
        // Reactivar verificación de claves foráneas
        Schema::enableForeignKeyConstraints();
    }
    
    /**
     * Verificar que existan todos los grados necesarios
     * Si no existen, ejecutar el GradoSeeder
     */
    private function verificarGrados()
    {
        if (Grado::count() == 0) {
            $this->call(GradoSeeder::class);
        }
    }
    
    /**
     * Asociar los grados a un nivel o categoría
     */
    private function asociarGrados($nivelCategoria, $gradosIds)
    {
        // Suponiendo que existe una tabla pivot nivel_categoria_grado
        foreach ($gradosIds as $gradoId) {
            // Verificar que el grado existe
            $grado = Grado::find($gradoId);
            
            if ($grado) {
                // Crear la relación en la tabla pivot
                NivelCategoriaGrado::create([
                    'id_nivel_categoria' => $nivelCategoria->id,
                    'id_grado' => $grado->id,
                ]);
                
            }
        }
    }
}