<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampoTutor extends Model
{
    use HasFactory;

    protected $table = 'campo_tutor';
    public $timestamps = false;
    protected $fillable = [
        'nombre',
        'id_tipo_campo',
    ];

    public function tipo_campo(){
        return $this->belongsTo(TipoCampo::class, 'id_tipo_campo');
    }

    public function olimpiadasCampoTutor()
    {
        return $this->hasMany(OlimpiadaCampoTutor::class, 'id_campo_tutor');
    }
}
