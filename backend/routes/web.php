<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\DivisionController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return 'XD';
});

Route::get('prueba', function () {
    return 'Hola desde la ruta de prueba';
});


Route::get('/areas', [AreaController::class, 'obtenerAreas']);

Route::post('/areas', [AreaController::class, 'almacenarArea']);



Route::get('/divisiones', [DivisionController::class, 'obtenerDivisiones']);

Route::post('/divisiones', [DivisionController::class, 'almacenarDivision']);
