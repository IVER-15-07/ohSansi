<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolTutor extends Model
{
    use HasFactory;
    protected $table = 'rol_tutor';
    public $timestamps = false;
    
    protected $fillable = [
        'nombre'
    ];
    
    /**
     * Relación con registros_tutores
     */
    public function registrosTutores()
    {
        return $this->hasMany(RegistroTutor::class, 'id_rol_tutor');
    }
    
    /**
     * Obtener todos los tutores que tienen este rol
     */
    public function tutores()
    {
        return $this->hasManyThrough(
            Tutor::class,
            RegistroTutor::class,
            'id_rol_tutor', // Clave externa en la tabla registro_tutor
            'id', // Clave primaria en la tabla tutor
            'id', // Clave primaria en la tabla rol_tutor
            'id_tutor' // Clave externa en la tabla registro_tutor que apunta a tutor
        );
    }
}
