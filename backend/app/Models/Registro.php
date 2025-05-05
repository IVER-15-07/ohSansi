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
        'nombres',
        'apellidos',
        'ci',
        'id_opcion_inscripcion',
        'id_encargado',
        'id_pago'
    ];

    public function grado()
    {
        return $this->belongsTo(Grado::class, 'id_grado');
    }

    public function encargado()
    {
        return $this->belongsTo(Encargado::class, 'id_encargado');
    }

    public function pago()
    {
        return $this->belongsTo(Pago::class, 'id_pago');
    }
    
    public function opcion_inscripcion()
    {
        return $this->belongsTo(OpcionInscripcion::class, 'id_opcion_inscripcion');
    }

    public function datos(){
        return $this->hasMany(DatoInscripcion::class, 'id_registro');
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
