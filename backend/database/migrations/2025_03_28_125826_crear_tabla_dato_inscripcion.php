<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaDatoInscripcion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dato_inscripcion', function (Blueprint $table) {
            $table->id();
            $table->string('valor');

            $table->foreignId('campo_inscripcion_id')->constrained('campo_inscripcion')->onDelete('cascade');
            $table->foreignId('registro_id')->constrained('registro')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('dato_inscripcion');
    }
}
