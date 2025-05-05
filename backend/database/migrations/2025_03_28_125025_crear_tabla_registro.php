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
            $table->string('nombres')->collation('texto_insensible');
            $table->string('apellidos')->collation('texto_insensible');
            $table->string('ci')->collation('texto_insensible');
            $table->foreignId('id_grado')->constrained('grado')->onDelete('cascade');
            $table->foreignId('id_opcion_inscripcion')->constrained('opcion_inscripcion')->onDelete('cascade');
            $table->foreignId('id_encargado')->constrained('encargado')->onDelete('cascade');
            $table->foreignId('id_pago')->nullable()->constrained('pago')->onDelete('cascade');
            
            $table->unique(['ci', 'id_opcion_inscripcion'], 'unique_registro_opcion');
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
