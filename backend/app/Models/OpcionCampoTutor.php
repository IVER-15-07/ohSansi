<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpcionCampoTutor extends Model
{
    use HasFactory;

    protected $table = 'opcion_campo_tutor';
    public $timestamps = false;

    protected $fillable = [
        'id_olimpiada_campo_tutor',
        'nombre'
    ];
    
    public function olimpiadaCampoTutor()
    {
        return $this->belongsTo(OlimpiadaCampoTutor::class, 'id_olimpiada_campo_tutor');
    }
}
