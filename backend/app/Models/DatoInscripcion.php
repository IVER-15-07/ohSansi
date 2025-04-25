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
}
