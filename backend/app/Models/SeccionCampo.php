<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeccionCampo extends Model
{
    use HasFactory;

    protected $table = 'seccion_campo';

    protected $fillable = [
        'nombre'
    ];

    public function campos_inscripcion(){
        return $this->hasMany(CampoInscripcion::class, 'id_seccion_campo');
    }
}
