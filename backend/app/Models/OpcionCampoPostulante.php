<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpcionCampoPostulante extends Model
{
    use HasFactory;

    protected $table = 'opcion_campo_postulante';
    public $timestamps = false;

    protected static function booted()
    {
        static::saving(function ($opcion) {
            if ($opcion->id_dependencia) {
                $opcionPadre = self::find($opcion->id_dependencia);
                $campoHijo = CampoPostulante::find($opcion->id_campo_postulante);
                if (!$opcionPadre || !$campoHijo) {
                    throw new \Exception('Dependencia inválida.');
                }
                // El campo padre debe ser el id_dependencia del campo hijo
                if ($opcionPadre->id_campo_postulante != $campoHijo->id_dependencia) {
                    throw new \Exception('La opción padre no corresponde al campo dependiente.');
                }
            }
        });
    }

    protected $fillable = [
        'id_campo_postulante',
        'valor',
        'id_dependencia',
    ];

    public function campoPostulante()
    {
        return $this->belongsTo(CampoPostulante::class, 'id_campo_postulante');
    }

    public function opcionPadre()
    {
        return $this->belongsTo(OpcionCampoPostulante::class, 'id_dependencia');
    }

    public function opcionesHijas()
    {
        return $this->hasMany(OpcionCampoPostulante::class, 'id_dependencia');
    }
}
