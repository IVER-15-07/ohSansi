<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grado extends Model
{
    use HasFactory;

    protected $table = 'grado';

    // Agregar propiedades para las columnas de la tabla
    protected $fillable = [
        'nombre'
    ];

    // Definir la relación inversa con Nivel
    public function nivel()
    {
        return $this->belongsTo(Nivel::class);
    }
}
