<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Olimpiada extends Model
{
    use HasFactory;

    protected $table = 'olimpiada';

    // Agregar propiedades para las columnas de la tabla
    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'lugar',
        'descripcion'
    ];

    // Definir la relación con Area
    public function areas()
    {
        return $this->hasMany(Area::class);
    }

    // Definir la relación con Inscripcion
    public function inscripcion()
    {
        return $this->hasOne(Inscripcion::class);
    }

    // Definir la relación con OrdenDePago
    public function ordenDePago()
    {
        return $this->hasOne(OrdenDePago::class);
    }
}
