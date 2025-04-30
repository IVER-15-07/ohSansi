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

    // Una olimpiada puede tener ser de muchas opciones de inscripcion
    public function opciones_inscripcion()
    {
        return $this->hasMany(OpcionInscripcion::class, 'id_olimpiada');
    }

    public function registros()
    {
        return $this->hasMany(Registro::class, 'id_olimpiada');
    }

}
