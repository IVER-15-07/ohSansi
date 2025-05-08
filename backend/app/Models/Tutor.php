<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutor extends Model
{
    use HasFactory;

    protected $table = 'tutor';
    public $timestamps = false;

    protected $fillable = [
        'nombres',
        'apellidos',
        'ci'
    ];
    

    /**
     * Relación muchos a muchos con Registro a través de la tabla registro_tutor
     */
    public function registros()
    {
        return $this->belongsToMany(Registro::class, 'registro_tutor', 'id_tutor', 'id_registro')
                    ->withPivot('id_rol_tutor') // Incluir el rol del tutor en la relación
                    ->using(RegistroTutor::class); // Usar el modelo RegistroTutor para la relación
    }
    
    public function datos(){
        return $this->hasMany(DatoTutor::class, 'id_tutor');
    }

    /**
     * Obtener todos los roles que tiene el tutor
     */
    public function roles()
    {
        return $this->hasManyThrough(
            RolTutor::class,
            RegistroTutor::class,
            'id_tutor', // Clave externa en la tabla registro_tutor
            'id', // Clave primaria en la tabla rol_tutor
            'id', // Clave primaria en la tabla tutor
            'id_rol_tutor' // Clave externa en la tabla registro_tutor que apunta a rol_tutor
        );
    }
}
