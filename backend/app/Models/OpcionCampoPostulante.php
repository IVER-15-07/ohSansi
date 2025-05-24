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
        'id_campo_postulante',
        'valor',
        'valor_dependencia',
    ];

    public function campoPostulante()
    {
        return $this->belongsTo(CampoPostulante::class, 'id_campo_postulante');
    }
}
