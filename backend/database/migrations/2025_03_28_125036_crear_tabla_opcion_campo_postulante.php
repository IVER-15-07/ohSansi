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
            $table->string('valor')->collation('texto_insensible');
            $table->string('valor_dependencia')->nullable()->collation('texto_insensible');
            $table->foreignId('id_campo_postulante')->constrained('campo_postulante')->onDelete('cascade');
            $table->unique(['id_campo_postulante', 'valor', 'valor_dependencia'], 'unique_opcion_id_campo_postulante');
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
