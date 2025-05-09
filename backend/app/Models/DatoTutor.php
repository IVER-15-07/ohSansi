<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DatoTutor extends Model
{
    use HasFactory;

    protected $table = 'dato_tutor';
    public $timestamps = false;

    protected $fillable = [
        'id_tutor',
        'id_olimpiada_campo_tutor',
        'valor'
    ];

    public function tutor()
    {
        return $this->belongsTo(Tutor::class, 'id_tutor');
    }

    public function olimpiadaCampoTutor()
    {
        return $this->belongsTo(OlimpiadaCampoTutor::class, 'id_olimpiada_campo_tutor');
    }
}
