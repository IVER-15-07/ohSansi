<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Olimpiada extends Model
{
    use HasFactory;

    protected $table = 'olimpiada';
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'costo',
        'ubicacion',
        'fecha_inicio',
        'fecha_fin',
        'inicio_inscripcion',
        'fin_inscripcion',
    ];

    // Relación uno a muchos con Configuracion
    public function configuraciones()
    {
        return $this->hasMany(Configuracion::class, 'id_olimpiada');
    }
}
