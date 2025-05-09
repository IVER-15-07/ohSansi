<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registro extends Model
{
    use HasFactory;

    protected $table = 'registro';
    public $timestamps = false;

    protected $fillable = [
        'id_olimpiada',
        'id_encargado',
        'id_postulante',
        'id_grado'
    ];

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'id_olimpiada');
    }

    public function encargado()
    {
        return $this->belongsTo(Encargado::class, 'id_encargado');
    }

    public function postulante()
    {
        return $this->belongsTo(Postulante::class, 'id_postulante');
    }

    public function grado()
    {
        return $this->belongsTo(Grado::class, 'id_grado');
    }

    public function inscripciones(){
        return $this->hasMany(Inscripcion::class, 'id_registro');
    }
    
    /**
     * Relación muchos a muchos con Tutor a través de la tabla registro_tutor
     */
    public function tutores()
    {
        return $this->belongsToMany(Tutor::class, 'registro_tutor', 'id_registro', 'id_tutor')
                    ->withPivot('id_rol_tutor') // Incluir el rol del tutor en la relación
                    ->using(RegistroTutor::class); // Usar el modelo RegistroTutor para la relación
    }
}
