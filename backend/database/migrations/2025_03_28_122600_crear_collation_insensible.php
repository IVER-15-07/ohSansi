<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class CrearCollationInsensible extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("
            CREATE COLLATION IF NOT EXISTS texto_insensible (
              PROVIDER = icu,
              LOCALE = 'es-u-ks-level1',
              DETERMINISTIC = FALSE
            )
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("DROP COLLATION IF EXISTS texto_insensible");
    }
}
