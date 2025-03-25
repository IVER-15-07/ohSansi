<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nivel extends Model
{
    use HasFactory;

    protected $table = 'nivel';

    // Agregar propiedades para las columnas de la tabla
    protected $fillable = [
        'nombre',
        'area_id', // Clave foránea que referencia a la tabla area
        'grado_id' // Clave foránea que referencia a la tabla grado
    ];

    // Definir la relación inversa con Area
    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    // Definir la relación inversa con Grado
    public function grado()
    {
        return $this->hasOne(Grado::class);
    }
}
