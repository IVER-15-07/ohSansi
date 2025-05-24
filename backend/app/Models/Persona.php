<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    use HasFactory;
    protected $table = 'persona';
    protected $fillable = [
        'ci',
        'nombres',
        'apellidos',
        'fecha_nacimiento',
    ];

    public function encargado()
    {
        return $this->hasOne(Encargado::class, 'id_persona');
    }

    public function postulante()
    {
        return $this->hasOne(Postulante::class, 'id_persona');
    }
    
    public function tutor()
    {
        return $this->hasOne(Tutor::class, 'id_persona');
    }
}
