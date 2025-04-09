<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';

    protected $fillable = [
        'codigo',
        'fecha',
        'monto',
        'estado'
    ];

    public function registros()
    {
        return $this->hasMany(Registro::class, 'id_pago');
    }
}
