<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Administrador extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    protected $table = 'administrador';
    protected $fillable = [
        'usuario',
        'password',
    ];
    protected $hidden = [
        'password',
    ];
}
