<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OlimpiadaCampoTutor extends Model
{
    use HasFactory;

    protected $table = 'olimpiada_campo_tutor';
    public $timestamps = false;

    protected $fillable = [
        'id_olimpiada',
        'id_campo_tutor',
        'obligatorio'
    ];

    public function campo_tutor()
    {
        return $this->belongsTo(CampoTutor::class, 'id_campo_tutor');
    }
    
    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'id_olimpiada');
    }

    public function datos_tutor($idTutor)
    {
        return $this->hasMany(DatoTutor::class, 'id_olimpiada_campo_tutor')
            ->where('id_tutor', $idTutor);
    }

}
