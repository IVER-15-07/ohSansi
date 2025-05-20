<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearSeccionCampo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('seccion_campo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->collation('texto_insensible');
            
            $table->foreignId('id_olimpiada')->constrained('olimpiada')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('seccion_campo');
    }
}
