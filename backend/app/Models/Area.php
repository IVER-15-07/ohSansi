<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $table = 'area';
    public $timestamps = false;
    protected $fillable = [
        'nombre'
    ];

    // Relación uno a muchos con Configuracion
    public function configuraciones()
    {
        return $this->hasMany(Configuracion::class, 'id_area');
    }
}
