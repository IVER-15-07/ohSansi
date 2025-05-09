<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DatoPostulante extends Model
{
    use HasFactory;

    protected $table = 'dato_postulante';
    public $timestamps = false;
    protected $fillable = [
        'id_postulante',
        'id_olimpiada_campo_postulante',
        'valor'
    ];

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'id_postulante');
    }
    
    public function olimpiadaCampoPostulante()
    {
        return $this->belongsTo(OlimpiadaCampoPostulante::class, 'id_olimpiada_campo_postulante');
    }
}
