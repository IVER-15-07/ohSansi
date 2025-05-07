<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoCampo extends Model
{
    use HasFactory;

    protected $table = 'tipo_campo';

    protected $fillable = [
        'nombre',
        'esLista'
    ];

    public function camposTutor(){
        return $this->hasMany(CampoTutor::class, 'id_tipo_campo');
    }

    public function camposPostulante(){
        return $this->hasMany(CampoPostulante::class, 'id_tipo_campo');
    }
}
