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
            $table->string('ci')->unique();
            $table->string('nombre')->collation('texto_insensible');
            $table->string('apellido')->collation('texto_insensible');
            $table->date('fecha_nacimiento');
            $table->string('telefono')->unique();
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
