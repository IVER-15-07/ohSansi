<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripcion';

    // Agregar propiedades para las columnas de la tabla
    protected $fillable = [
        'fecha_fin',
        'olimpiada_id' // Clave foránea que referencia a la tabla olimpiada
    ];
}
