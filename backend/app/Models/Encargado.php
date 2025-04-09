<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Encargado extends Model
{
    use HasFactory;

    protected $table = 'encargado';
    public $timestamps = false;

    protected $fillable = [
        'ci',
        'nombre',
        'apellido',
        'fecha_nacimiento',
        'telefono',	
        'correo',
    ];

    // Mutator para convertir 'correo' a minúsculas
    public function setCorreoAttribute($value)
    {
        $this->attributes['correo'] = strtolower($value);
    }

    // Mutator para convertir 'ci' a minúsculas
    public function setCiAttribute($value)
    {
        $this->attributes['ci'] = strtolower($value);
    }

    // Mutator para convertir 'telefono' a minúsculas
    public function setTelefonoAttribute($value)
    {
        $this->attributes['telefono'] = strtolower($value);
    }

    public function registros()
    {
        return $this->hasMany(Registro::class, 'id_encargado');
    }
}
