<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DatoInscripcion extends Model
{
    use HasFactory;
    protected $table = 'dato_inscripcion';
    public $timestamps = false;

    protected $fillable = [
        'id_registro',
        'id_campo_inscripcion',
        'valor',
    ];


    public function campo_inscripcion()
    {
        return $this->belongsTo(CampoInscripcion::class, 'id_campo_inscripcion');
    }

    public function registro()
    {
        return $this->belongsTo(Registro::class, 'id_registro');
    }
}
