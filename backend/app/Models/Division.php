<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $table = 'division';
    public $timestamps = false;
    protected $fillable = [
        'nombre'
    ];

    // Relación uno a muchos con Configuracion
    public function configuraciones()
    {
        return $this->hasMany(Configuracion::class, 'id_division');
    }

    // Relación uno a muchos con TipoDivision
    public function tipoDivision()
    {
        return $this->belongsTo(TipoDivision::class, 'id_tipo_division');
    }
}
