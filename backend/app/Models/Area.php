<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $table = 'areas';

    // Agregar propiedades para las columnas de la tabla
    protected $fillable = [
        'nombre',
        'descripcion',
        'olimpiada_id' // Clave foránea que referencia a la tabla olimpiada
    ];

    // Definir la relación inversa con Olimpiada
    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class);
    }

    // Definir la relación con Categoria
    public function categorias()
    {
        return $this->hasMany(Categoria::class);
    }

    // Definir la relación con Nivel
    public function niveles()
    {
        return $this->hasMany(Nivel::class);
    }
}
