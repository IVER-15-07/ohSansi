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

    // Un nivel_categoria puede ser parte de muchas opciones de inscripcion
    public function opciones_inscripcion()
    {
        return $this->hasMany(OpcionInscripcion::class, 'id_nivel_categoria');
    }

    // Relación muchos a muchos con Grado
    public function grados()
    {
        return $this->belongsToMany(Grado::class, 'nivel_categoria_grado', 'id_nivel_categoria', 'id_grado');
    }

}
