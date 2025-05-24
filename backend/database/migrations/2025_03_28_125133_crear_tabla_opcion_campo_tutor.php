<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaOpcionCampoTutor extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('opcion_campo_tutor', function (Blueprint $table) {
            $table->id();
            $table->string('valor')->collation('texto_insensible');
            $table->string('valor_dependencia')->nullable()->collation('texto_insensible');
            $table->foreignId('id_campo_tutor')->constrained('campo_tutor')->onDelete('cascade');

            $table->unique(['id_campo_tutor', 'valor', 'valor_dependencia'], 'unique_id_olimpiada_campo_tutor');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('opcion_campo_tutor');
    }
}
