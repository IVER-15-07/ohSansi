<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpcionInscripcion extends Model
{
    use HasFactory;

    protected $table = 'opcion_inscripcion';
    public $timestamps = false;
    // Relación inversa con Olimpiada

 

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'id_olimpiada');
    }

    // Relación inversa con Area
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area');
    }

    // Relación inversa con NivelCategoria
    public function nivel_categoria()
    {
        return $this->belongsTo(NivelCategoria::class, 'id_nivel_categoria');
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'id_opcion_inscripcion');
    }
}
