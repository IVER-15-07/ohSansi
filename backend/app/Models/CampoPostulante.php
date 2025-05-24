<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampoPostulante extends Model
{
    use HasFactory;

    protected $table = 'campo_postulante';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'id_tipo_campo',
        'id_dependencia'
    ];

    public function tipo_campo(){
        return $this->belongsTo(TipoCampo::class, 'id_tipo_campo');
    }

    public function olimpiadasCampoPostulante()
    {
        return $this->hasMany(OlimpiadaCampoPostulante::class, 'id_campo_postulante');
    }

    public function opcionesCampoPostulante()
    {
        return $this->hasMany(OpcionCampoPostulante::class, 'id_campo_postulante');
    }

    public function dependeDe(){
        return $this->belongsTo(CampoPostulante::class, 'id_dependencia');
    }
}
