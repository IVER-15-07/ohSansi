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
            $table->string('descripcion', 255)->nullable();
            $table->decimal('costo', 10, 2)->nullable();
            $table->string('ubicacion', 255)->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->date('inicio_inscripcion');
            $table->date('fin_inscripcion');
            $table->integer('max_areas_por_participante')->default(1);
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
