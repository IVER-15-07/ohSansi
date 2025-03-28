<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampoInscripcion extends Model
{
    use HasFactory;

    protected $table = 'campo_inscripcion';

    protected $fillable = [
        'nombre'
    ];

    public function seccion_campo(){
        return $this->belongsTo(SeccionCampo::class, 'id_seccion_campo');
    }

    public function tipo_campo(){
        return $this->belongsTo(TipoCampo::class, 'id_tipo_campo');
    }
}
