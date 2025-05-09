<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaInscripcion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inscripcion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_registro')->constrained('registro')->onDelete('cascade'); 
            $table->foreignId('id_opcion_inscripcion')->constrained('opcion_inscripcion')->onDelete('cascade');
            $table->foreignId('id_pago')->nullable()->constrained('pago')->onDelete('cascade');

            $table->unique(['id_registro', 'id_opcion_inscripcion'], 'unique_registro_opcion_inscripcion');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inscripcion');
    }
}
