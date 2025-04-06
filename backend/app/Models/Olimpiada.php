<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Olimpiada extends Model
{
    use HasFactory;

    protected $table = 'olimpiada';

    protected $fillable = [
        'nombre',
        'descripcion',
        'costo',
        'ubicacion',
        'fecha_inicio',
        'fecha_fin'
    ];

    // Relación uno a muchos con Configuracion
    public function configuraciones()
    {
        return $this->hasMany(Configuracion::class, 'id_olimpiada');
    }
}
