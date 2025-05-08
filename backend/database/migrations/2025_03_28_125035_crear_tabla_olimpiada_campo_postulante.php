<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaOlimpiadaCampoPostulante extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('olimpiada_campo_postulante', function (Blueprint $table) {
            $table->id();
            $table->boolean('esObligatorio');

            $table->foreignId('id_olimpiada')->constrained('olimpiada')->onDelete('cascade');
            $table->foreignId('id_campo_postulante')->constrained('campo_postulante')->onDelete('cascade');

            $table->unique(['id_olimpiada', 'id_campo_postulante'], 'unique_olimpiada_campo_postulante');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('olimpiada_campo_postulante');
    }
}
