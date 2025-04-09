<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grado extends Model
{
    use HasFactory;

    protected $table = 'grado';
    public $timestamps = false;

    protected $fillable = [
        'nombre'
    ];

    // Relación muchos a muchos con NivelCategoria
    public function nivelesCategorias()
    {
        return $this->belongsToMany(NivelCategoria::class, 'nivel_categoria_grado', 'id_grado', 'id_nivel_categoria');
    }
}
