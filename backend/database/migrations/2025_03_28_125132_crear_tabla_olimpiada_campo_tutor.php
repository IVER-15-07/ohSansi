<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrearTablaOlimpiadaCampoTutor extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('olimpiada_campo_tutor', function (Blueprint $table) {
            $table->id();
            $table->boolean('esObligatorio');

            $table->foreignId('id_olimpiada')->constrained('olimpiada')->onDelete('cascade');
            $table->foreignId('id_campo_tutor')->constrained('campo_tutor')->onDelete('cascade');

            $table->unique(['id_olimpiada', 'id_campo_tutor'], 'unique_olimpiada_campo_tutor');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('olimpiada_campo_tutor');
    }
}
