<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdenDePago extends Model
{
    use HasFactory;

    protected $table = 'orden-de-pago';

    // Agregar propiedades para las columnas de la tabla
    protected $fillable = [
        'fecha',
        'monto',
        'concepto',
        'olimpiada_id' // Clave foránea que referencia a la tabla inscripcion
    ];

    // Definir la relación inversa con olimpiada
    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class);
    }
}
