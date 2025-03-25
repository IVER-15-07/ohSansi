<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categoria';

    // Agregar propiedades para las columnas de la tabla
    protected $fillable = [
        'nombre',
        'area_id' // Clave foránea que referencia a la tabla area
    ];

    // Definir la relación inversa con Area
    public function area()
    {
        return $this->belongsTo(Area::class);
    }
}
