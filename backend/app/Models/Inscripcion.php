<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    use HasFactory;
    protected $table = 'inscripcion';
    public $timestamps = false;

    protected $fillable = [
        'id_registro',
        'id_opcion_inscripcion',
        'id_pago',
    ];

    public function registro()
    {
        return $this->belongsTo(Registro::class, 'id_registro');
    }

    public function opcionInscripcion()
    {
        return $this->belongsTo(OpcionInscripcion::class, 'id_opcion_inscripcion');
    }
    
    public function pago()
    {
        return $this->belongsTo(Pago::class, 'id_pago');
    }
}
