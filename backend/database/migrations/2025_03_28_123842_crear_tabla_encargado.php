<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaEncargado extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('encargado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_persona')->constrained('persona')->unique()->onDelete('cascade');
            $table->string('correo')->collation('texto_insensible')->unique();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('encargado');
    }
}
