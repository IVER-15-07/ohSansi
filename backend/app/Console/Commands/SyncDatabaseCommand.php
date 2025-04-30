<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use PDO;

class SyncDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:sync {--force : Forzar sincronización sin confirmación}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincroniza la base de datos local con los datos del servidor remoto';

    // Datos de conexión remota
    protected $remoteConnection = [
        'driver' => 'pgsql',
        'host' => '34.28.247.228',
        'port' => 5432,
        'database' => 'oh-sansi-development',
        'username' => 'developerSuperNova',
        'password' => 'SuperNovaSoftDevelopment',
        'charset' => 'utf8',
        'prefix' => '',
        'schema' => 'public',
    ];

    // Lista de tablas a sincronizar (en orden adecuado para respetar las claves foráneas)
    protected $tables = [
        'area',
        'nivel_categoria',
        'grado',
        'nivel_categoria_grado',
        'olimpiada',
        'configuracion',
        'encargado',
        'pago',
        'registro',
        'tipo_campo',
        'seccion_campo',
        'campo_inscripcion',
        'dato_inscripcion',
    ];

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Iniciando sincronización de base de datos...');

        // Confirmación de seguridad
        if (!$this->option('force') && !$this->confirm('⚠️ Esta operación reemplazará los datos locales con los del servidor remoto. ¿Continuar?')) {
            $this->warn('Operación cancelada por el usuario.');
            return 0;
        }

        try {
            // Creamos una conexión temporal a la base de datos remota
            $remoteConn = $this->createRemoteConnection();

            // Sincronizamos la estructura de la base de datos
            $this->syncDatabaseStructure($remoteConn);

            // Sincronizamos cada tabla
            foreach ($this->tables as $table) {
                $this->syncTable($remoteConn, $table);
            }

            $this->info('✅ Sincronización completada exitosamente!');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error durante la sincronización: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
    }

    /**
     * Crea una conexión temporal a la base de datos remota
     */
    protected function createRemoteConnection()
    {
        $dsn = "pgsql:host={$this->remoteConnection['host']};port={$this->remoteConnection['port']};dbname={$this->remoteConnection['database']}";
        
        $this->info("Conectando a base de datos remota: {$this->remoteConnection['host']}...");
        
        return new PDO(
            $dsn,
            $this->remoteConnection['username'],
            $this->remoteConnection['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }

    /**
     * Sincroniza una tabla específica
     */
    protected function syncTable($remoteConn, $table)
    {
        $this->info("Sincronizando tabla: {$table}");

        // Verificar si la tabla existe en ambas bases de datos
        if (!Schema::hasTable($table)) {
            $this->warn("La tabla {$table} no existe en la base de datos local. Omitiendo...");
            return;
        }

        // 1. Obtener datos de la tabla remota
        $stmt = $remoteConn->prepare("SELECT * FROM {$table}");
        $stmt->execute();
        $remoteData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->info("  - Registros encontrados en remoto: " . count($remoteData));

        if (empty($remoteData)) {
            $this->warn("  - No hay datos para sincronizar en tabla {$table}. Omitiendo...");
            return;
        }

        // Obtener las columnas de la tabla local
        $localColumns = Schema::getColumnListing($table);

        // Filtrar los datos remotos para incluir solo las columnas existentes en la tabla local
        $filteredData = array_map(function ($row) use ($localColumns) {
            return array_filter(
                $row,
                function ($key) use ($localColumns) {
                    return in_array($key, $localColumns);
                },
                ARRAY_FILTER_USE_KEY
            );
        }, $remoteData);

        // 2. Eliminar datos existentes en la tabla local
        DB::table($table)->delete();
        $this->info("  - Datos locales eliminados");

        // 3. Desactivar temporalmente la verificación de claves foráneas
        DB::statement('SET CONSTRAINTS ALL DEFERRED');

        // 4. Insertar datos remotos en la tabla local
        $chunks = array_chunk($filteredData, 100); // Procesar en bloques de 100 registros
        $insertedCount = 0;

        foreach ($chunks as $chunk) {
            DB::table($table)->insert($chunk);
            $insertedCount += count($chunk);
            $this->output->write("\r  - Insertando registros: {$insertedCount}/" . count($remoteData));
        }

        $this->info("\n  - Sincronización completada para tabla {$table}");

        // 5. Reactivar la verificación de claves foráneas
        DB::statement('SET CONSTRAINTS ALL IMMEDIATE');
    }

    protected function syncDatabaseStructure($remoteConn)
    {
        $this->info("Sincronizando estructura de la base de datos...");

        // Obtener la lista de tablas de la base de datos remota
        $stmt = $remoteConn->prepare("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        $stmt->execute();
        $remoteTables = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($remoteTables as $table) {
            // Verificar si la tabla existe en la base de datos local
            if (!Schema::hasTable($table)) {
                $this->info("Creando tabla: {$table}");

                // Obtener la estructura de la tabla remota
                $stmt = $remoteConn->prepare("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = :table");
                $stmt->execute(['table' => $table]);
                $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Crear la tabla localmente
                Schema::create($table, function ($tableBlueprint) use ($columns) {
                    foreach ($columns as $column) {
                        $this->addColumnToTable($tableBlueprint, $column);
                    }
                });

                $this->info("Tabla {$table} creada exitosamente.");
            } else {
                $this->info("La tabla {$table} ya existe. Verificando columnas...");

                // Verificar columnas
                $stmt = $remoteConn->prepare("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = :table");
                $stmt->execute(['table' => $table]);
                $remoteColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $localColumns = Schema::getColumnListing($table);

                foreach ($remoteColumns as $column) {
                    if (!in_array($column['column_name'], $localColumns)) {
                        $this->info("Agregando columna: {$column['column_name']} a la tabla {$table}");

                        Schema::table($table, function ($tableBlueprint) use ($column) {
                            $this->addColumnToTable($tableBlueprint, $column);
                        });

                        $this->info("Columna {$column['column_name']} agregada exitosamente.");
                    }
                }
            }
        }

        $this->info("Estructura de la base de datos sincronizada exitosamente.");
    }

    protected function mapColumnType($remoteType)
    {
        // Mapear tipos de datos de PostgreSQL a tipos de Laravel
        $map = [
            'integer' => 'integer',
            'bigint' => 'bigInteger',
            'smallint' => 'smallInteger',
            'serial' => 'increments',
            'bigserial' => 'bigIncrements',
            'varchar' => 'string', // varchar se mapeará a string con longitud predeterminada
            'text' => 'text',
            'boolean' => 'boolean',
            'date' => 'date',
            'timestamp' => 'timestamp',
            'float' => 'float',
            'double precision' => 'double',
            'numeric' => 'decimal',
        ];

        return $map[$remoteType] ?? 'string';
    }

    protected function addColumnToTable($tableBlueprint, $column)
    {
        $type = $this->mapColumnType($column['data_type']);
        $nullable = $column['is_nullable'] === 'YES';

        // Manejar tipos de datos que requieren parámetros adicionales
        if ($type === 'string' && isset($column['character_maximum_length'])) {
            $length = $column['character_maximum_length'] ?? 255; // Longitud predeterminada
            $columnDefinition = $tableBlueprint->addColumn($type, $column['column_name'], ['length' => $length]);
        } else {
            $columnDefinition = $tableBlueprint->addColumn($type, $column['column_name']);
        }

        if ($nullable) {
            $columnDefinition->nullable();
        }
    }
}
