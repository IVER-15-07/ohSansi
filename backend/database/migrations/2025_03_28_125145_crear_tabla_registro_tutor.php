<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaRegistroTutor extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('registro_tutor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_registro')->constrained('registro')->onDelete('cascade');
            $table->foreignId('id_tutor')->constrained('tutor')->onDelete('cascade');
            $table->foreignId('id_rol_tutor')->constrained('rol_tutor')->onDelete('cascade');
            
            $table->unique(['id_registro', 'id_tutor', 'id_rol_tutor'], 'unique_registro_rol_tutor');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('registro_tutor');
    }
}
