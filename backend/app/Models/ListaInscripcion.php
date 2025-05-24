<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListaInscripcion extends Model
{
    use HasFactory;
    protected $table = 'lista_inscripcion';
    public $timestamps = false;

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'id_lista_inscripcion');
    }
}
