<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NivelCategoriaGrado extends Model
{
    use HasFactory;
    
    protected $table = 'nivel_categoria_grado'; // Nombre de la tabla
    public $timestamps = false; // Si no usas `created_at` y `updated_at`

    protected $fillable = [
        'id_grado',
        'id_nivel_categoria',
    ];
}
