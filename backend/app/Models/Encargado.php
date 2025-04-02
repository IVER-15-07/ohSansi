<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Encargado extends Model
{
    use HasFactory;

    protected $table = 'encargado';

    protected $fillable = [
        'ci',
        'nombre',
        'apellido',
        'fecha_nacimiento'
    ];

    public function registros()
    {
        return $this->hasMany(Registro::class, 'id_encargado');
    }
}
