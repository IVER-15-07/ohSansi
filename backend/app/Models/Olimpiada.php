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
        'convocatoria',
        'descripcion',
        'costo',
        'max_areas',
        'fecha_inicio',
        'fecha_fin',
        'inicio_inscripcion',
        'fin_inscripcion'
    ];

    // Relación uno a muchos con Configuracion
    public function configuraciones()
    {
        return $this->hasMany(Configuracion::class, 'id_olimpiada');
    }

    public function registros()
    {
        return $this->hasMany(Registro::class, 'id_olimpiada');
    }

}
