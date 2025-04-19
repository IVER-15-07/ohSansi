<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registro extends Model
{
    use HasFactory;

    protected $table = 'registro';
    public $timestamps = false;

    public function encargado()
    {
        return $this->belongsTo(Encargado::class, 'id_encargado');
    }

    public function pago()
    {
        return $this->belongsTo(Pago::class, 'id_pago');
    }
    
    public function configuracion()
    {
        return $this->belongsTo(Configuracion::class, 'id_configuracion');
    }

    public function datos(){
        return $this->hasMany(DatoInscripcion::class, 'id_registro');
    }
}
