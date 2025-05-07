<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaDatoPostulante extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dato_postulante', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_postulante')->constrained('postulante')->onDelete('cascade');
            $table->string('valor')->collation('texto_insensible');
            $table->foreignId('id_olimpiada_campo_postulante')->constrained('olimpiada_campo_postulante')->onDelete('cascade');

            $table->unique(['id_postulante', 'valor', 'id_olimpiada_campo_postulante'], 'unique_id_postulante_valor_id_olimpiada_campo_postulante');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('dato_postulante');
    }
}
