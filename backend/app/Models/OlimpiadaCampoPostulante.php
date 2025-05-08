<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OlimpiadaCampoPostulante extends Model
{
    use HasFactory;

    protected $table = 'olimpiada_campo_postulante';
    public $timestamps = false;

    protected $fillable = [
        'id_olimpiada',
        'id_campo_postulante',
        'esObligatorio'
    ];

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'id_olimpiada');
    }

    public function campoPostulante()
    {
        return $this->belongsTo(CampoPostulante::class, 'id_campo_postulante');
    }

    public function datosPostulante()
    {
        return $this->hasMany(DatoPostulante::class, 'id_olimpiada_campo_postulante');
    }

    public function opcionesCampoPostulante()
    {
        return $this->hasMany(OpcionCampoPostulante::class, 'id_olimpiada_campo_postulante');
    }
}
