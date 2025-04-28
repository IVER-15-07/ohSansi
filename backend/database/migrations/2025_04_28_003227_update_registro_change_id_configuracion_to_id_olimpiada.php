<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateRegistroChangeIdConfiguracionToIdOlimpiada extends Migration
{
    public function up()
    {
        Schema::table('registro', function (Blueprint $table) {
            $table->dropForeign(['id_configuracion']);
            $table->dropColumn('id_configuracion');
            $table->foreignId('id_olimpiada')->nullable()->constrained('olimpiada')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('registro', function (Blueprint $table) {
            // Si se quiere revertir
            $table->dropForeign(['id_olimpiada']);
            $table->dropColumn('id_olimpiada');

            $table->foreignId('id_configuracion')->nullable()->constrained('configuracion')->onDelete('cascade');
        });
    }
}
