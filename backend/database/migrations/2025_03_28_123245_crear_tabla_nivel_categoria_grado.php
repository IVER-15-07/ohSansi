<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaNivelCategoriaGrado extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nivel_categoria_grado', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_grado')->constrained('grado')->onDelete('cascade');
            $table->foreignId('id_nivel_categoria')->constrained('nivel_categoria')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nivel_categoria_grado');
    }
}
