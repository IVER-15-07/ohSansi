<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoCampo extends Model
{
    use HasFactory;

    protected $table = 'tipo_campo';

    protected $fillable = [
        'nombre'
    ];

    public function campos_inscripcion(){
        return $this->hasMany(CampoInscripcion::class, 'id_tipo_campo');
    }
}
