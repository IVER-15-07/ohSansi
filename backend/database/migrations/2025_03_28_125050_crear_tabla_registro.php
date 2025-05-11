<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaRegistro extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('registro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_olimpiada')->constrained('olimpiada')->onDelete('cascade'); 
            $table->foreignId('id_encargado')->constrained('encargado')->onDelete('cascade');
            $table->foreignId('id_postulante')->constrained('postulante')->onDelete('cascade');
            $table->foreignId('id_grado')->constrained('grado')->onDelete('cascade');

            $table->unique(['id_olimpiada', 'id_postulante'], 'unique_registro');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('registro');
    }
}
