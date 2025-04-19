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

            $table->foreignId('id_configuracion')->nullable()->constrained('configuracion')->onDelete('cascade');
            $table->foreignId('id_encargado')->constrained('encargado')->onDelete('cascade');
            $table->foreignId('id_pago')->nullable()->constrained('pago')->onDelete('cascade');
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
