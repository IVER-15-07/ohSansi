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
        'id_campo_tutor',
        'valor',
        'valor_dependencia',
    ];
    
    public function campoTutor()
    {
        return $this->belongsTo(CampoTutor::class, 'id_campo_tutor');
    }
}
