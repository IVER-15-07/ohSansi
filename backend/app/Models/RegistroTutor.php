<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistroTutor extends Model
{
    use HasFactory;

    protected $table = 'registro_tutor';
    public $timestamps = false;
    protected $fillable = [
        'id_registro',
        'id_tutor',
        'id_rol_tutor'
    ];
    
    /**
     * Relación con el modelo RolTutor
     */
    public function rolTutor()
    {
        return $this->belongsTo(RolTutor::class, 'id_rol_tutor');
    }
    
    /**
     * Relación con el modelo Registro
     */
    public function registro()
    {
        return $this->belongsTo(Registro::class, 'id_registro');
    }
    
    /**
     * Relación con el modelo Tutor
     */
    public function tutor()
    {
        return $this->belongsTo(Tutor::class, 'id_tutor');
    }

}
