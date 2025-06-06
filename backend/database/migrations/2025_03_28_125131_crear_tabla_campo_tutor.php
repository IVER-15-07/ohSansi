<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaCampoTutor extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('campo_tutor', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->collation('texto_insensible')->unique();

            $table->foreignId('id_dependencia')->nullable()->constrained('campo_tutor')->onDelete('cascade');
            $table->foreignId('id_tipo_campo')->constrained('tipo_campo')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('campo_tutor');
    }
}
