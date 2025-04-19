<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaCampoInscripcion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('campo_inscripcion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');

            $table->foreignId('id_tipo_campo')->constrained('tipo_campo')->onDelete('cascade');
            $table->foreignId('id_seccion_campo')->constrained('seccion_campo')->onDelete('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('campo_inscripcion');
    }
}
