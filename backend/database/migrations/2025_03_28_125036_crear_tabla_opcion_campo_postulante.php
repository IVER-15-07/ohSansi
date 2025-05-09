<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaOpcionCampoPostulante extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('opcion_campo_postulante', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->collation('texto_insensible');
            $table->foreignId('id_olimpiada_campo_postulante')->constrained('olimpiada_campo_postulante')->onDelete('cascade');

            $table->unique(['id_olimpiada_campo_postulante', 'nombre'], 'unique_opcion_id_olimpiada_campo_postulante');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('opcion_campo_postulante');
    }
}
