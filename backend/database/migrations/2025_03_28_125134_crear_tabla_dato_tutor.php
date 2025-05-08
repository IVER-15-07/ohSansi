<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaDatoTutor extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dato_tutor', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_tutor')->constrained('tutor')->onDelete('cascade');
            $table->string('valor')->collation('texto_insensible');
            $table->foreignId('id_olimpiada_campo_tutor')->constrained('olimpiada_campo_tutor')->onDelete('cascade');

            $table->unique(['id_tutor', 'valor', 'id_olimpiada_campo_tutor'], 'unique_id_tutor_valor_id_olimpiada_campo_tutor');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('dato_tutor');
    }
}
