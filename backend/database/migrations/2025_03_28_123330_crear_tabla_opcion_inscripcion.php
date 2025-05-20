<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaOpcionInscripcion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('opcion_inscripcion', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_olimpiada')->constrained('olimpiada')->onDelete('cascade');
            $table->foreignId('id_area')->constrained('area')->onDelete('cascade');
            $table->foreignId('id_nivel_categoria')->constrained('nivel_categoria')->onDelete('cascade');

            $table->unique(['id_olimpiada', 'id_area', 'id_nivel_categoria'], 'unique_opcion_inscripcion');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('opcion_inscripcion');
    }
}
