<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NivelCategoria extends Model
{
    use HasFactory;

    protected $table = 'nivel_categoria';
    public $timestamps = false;
    protected $fillable = [
        'nombre',
        'esNivel'
    ];

    // Relación uno a muchos con Configuracion
    public function configuraciones()
    {
        return $this->hasMany(Configuracion::class, 'id_nivel_categoria');
    }

    // Relación muchos a muchos con Grado
    public function grados()
    {
        return $this->belongsToMany(Grado::class, 'nivel_categoria_grado', 'id_nivel_categoria', 'id_grado');
    }

}
