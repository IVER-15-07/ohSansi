<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AreaController;

use App\Http\Controllers\NivelCategoriaController;

use App\Http\Controllers\GradoController;

use App\Http\Controllers\ConfiguracionController;

use App\Http\Controllers\OlimpiadaController;

use App\Http\Controllers\EncargadoController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/areas', [AreaController::class, 'obtenerAreas']);

Route::post('/areas', [AreaController::class, 'almacenarArea']);


Route::get('/niveles_categorias', [NivelCategoriaController::class, 'obtenerNivelesCategorias']);

Route::post('/niveles_categorias', [NivelCategoriaController::class, 'almacenarNivelCategoria']);

Route::post('/niveles_categorias/{id}/grados', [NivelCategoriaController::class, 'asociarGrados']);


Route::get('/grados', [GradoController::class, 'obtenerGrados']);


Route::get('/configuraciones', [ConfiguracionController::class, 'obtenerConfiguraciones']);

Route::post('/configuraciones', [ConfiguracionController::class, 'almacenarConfiguracion']);

Route::get('/configuraciones/{idOlimpiada}/areas', [ConfiguracionController::class, 'obtenerAreasPorOlimpiada']);

Route::get('/configuraciones/{idOlimpiada}/mapa', [ConfiguracionController::class, 'obtenerMapaOlimpiada']);

Route::delete('/configuraciones/{idOlimpiada}', [ConfiguracionController::class, 'eliminarConfiguracionesPorOlimpiada']);

Route::get('/olimpiadas', [OlimpiadaController::class, 'obtenerOlimpiadas']);

Route::post('/olimpiadas', [OlimpiadaController::class, 'almacenarOlimpiada']);


Route::get('/encargados', [EncargadoController::class, 'obtenerEncargados']);

Route::post('/encargados', [EncargadoController::class, 'almacenarEncargado']);





