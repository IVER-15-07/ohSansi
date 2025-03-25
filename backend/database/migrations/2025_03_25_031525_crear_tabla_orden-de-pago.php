<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaOrdenDePago extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orden-de-pago', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->decimal('monto', 8, 2);
            $table->string('concepto');
            $table->timestamps();

            $table->foreignId('olimpiada_id')->constrained('olimpiada');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orden-de-pago');
    }
}
