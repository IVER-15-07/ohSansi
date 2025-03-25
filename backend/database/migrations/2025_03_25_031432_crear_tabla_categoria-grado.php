<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaCategoriaGrado extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('categoria-grado', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('categoria_id')->constrained('categoria');
            $table->foreignId('grado_id')->constrained('grado');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('categoria-grado');
    }
}
