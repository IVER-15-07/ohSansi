<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Postulante extends Model
{
    use HasFactory;

    protected $table = 'postulante';
    public $timestamps = false;

    protected $fillable = [
        'id_persona',
    ];
    
    /**
     * Relación muchos a muchos con Registro a través de la tabla registro_tutor
     */
    public function registros()
    {
        return $this->hasMany(Registro::class, 'id_postulante');
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'id_persona');
    }
    
    public function datos(){
        return $this->hasMany(DatoPostulante::class, 'id_postulante');
    }
}
