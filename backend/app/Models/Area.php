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

    // Un area puede tener ser de muchas opciones de inscripcion
    public function opciones_inscripcion()
    {
        return $this->hasMany(OpcionInscripcion::class, 'id_area');
    }
}
