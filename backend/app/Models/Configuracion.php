<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    use HasFactory;

    protected $table = 'configuracion';

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

    // Relación inversa con Grado
    public function grado()
    {
        return $this->belongsTo(Grado::class, 'id_grado');
    }

    // Relación inversa con Division
    public function nivel_categoria()
    {
        return $this->belongsTo(NivelCategoria::class, 'id_nivel_categoria');
    }

    public function registros()
    {
        return $this->hasMany(Registro::class, 'id_configuracion');
    }

}
