<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';
    public $timestamps = false;

    protected $fillable = [
        'monto',
        'fecha_generado',
        'concepto',
        'orden',
        'comprobante',
        'fecha_pago'
    ];

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'id_pago');
    }
}
