<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoDivision extends Model
{
    use HasFactory;

    protected $table = 'tipo_division';

    protected $fillable = [
        'nombre'
    ];

    // Relación uno a muchos con Division
    public function divisiones()
    {
        return $this->hasMany(Division::class, 'id_tipo_division');
    }
}
