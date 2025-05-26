<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateOlimpiadaInscriptionDatesToNullable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('olimpiada', function (Blueprint $table) {
            $table->date('inicio_inscripcion')->nullable()->change();
            $table->date('fin_inscripcion')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('olimpiada', function (Blueprint $table) {
            $table->date('inicio_inscripcion')->nullable(false)->change();
            $table->date('fin_inscripcion')->nullable(false)->change();
        });
    }
}
