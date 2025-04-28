<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaOlimpiada extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('olimpiada', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('convocatoria')->nullable(); 
            $table->string('descripcion')->nullable();
            $table->decimal('costo', 10, 2)->nullable();
            $table->integer('max_areas')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->date('inicio_inscripcion');
            $table->date('fin_inscripcion');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('olimpiada');
    }
}
