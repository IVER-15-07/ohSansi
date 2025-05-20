<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpcionCampoPostulante extends Model
{
    use HasFactory;

    protected $table = 'opcion_campo_postulante';
    public $timestamps = false;

    protected $fillable = [
        'id_olimpiada_campo_postulante',
        'nombre'
    ];

    public function olimpiadaCampoPostulante()
    {
        return $this->belongsTo(OlimpiadaCampoPostulante::class, 'id_olimpiada_campo_postulante');
    }
}
