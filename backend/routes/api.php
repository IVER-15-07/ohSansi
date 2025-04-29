<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AreaController;

use App\Http\Controllers\NivelCategoriaController;

use App\Http\Controllers\GradoController;

use App\Http\Controllers\OpcionInscripcionController;

use App\Http\Controllers\OlimpiadaController;

use App\Http\Controllers\EncargadoController;

use App\Http\Controllers\FormularioController;

use App\Http\Controllers\RegistroController;

use App\Http\Controllers\PagoController;
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


Route::get('/opciones_inscripcion', [OpcionInscripcionController::class, 'obtenerOpcionesInscripcion']);

Route::post('/opciones_inscripcion', [OpcionInscripcionController::class, 'almacenarOpcionInscripcion']);

Route::get('/opciones_inscripcion/{idOlimpiada}/areas', [OpcionInscripcionController::class, 'obtenerAreasPorOlimpiada']);

Route::get('/opciones_inscripcion/{idOlimpiada}/mapa', [OpcionInscripcionController::class, 'obtenerMapaOlimpiada']);

Route::delete('/opciones_inscripcion/{idOlimpiada}', [OpcionInscripcionController::class, 'eliminarOpcionesIncripcionPorOlimpiada']);


Route::get('/olimpiadas', [OlimpiadaController::class, 'obtenerOlimpiadas']);

Route::get('/olimpiadas/activas', [OlimpiadaController::class, 'obtenerOlimpiadasActivas']);

Route::post('/olimpiadas', [OlimpiadaController::class, 'almacenarOlimpiada']);

Route::get('/olimpiadas/{id}', [OlimpiadaController::class, 'obtenerOlimpiada']);


Route::get('/encargados', [EncargadoController::class, 'obtenerEncargados']);

Route::get('/encargados/verificar/{ci}', [EncargadoController::class, 'verificarEncargado']);

Route::post('/encargados', [EncargadoController::class, 'almacenarEncargado']);

Route::get('/encargados/{id}', [EncargadoController::class, 'obtenerEncargado']);

Route::get('/formulario', [FormularioController::class, 'obtenerFormulario']);

Route::post('/formulario/guardar-datos-inscripcion/{idRegistro}', [FormularioController::class, 'guardarDatosInscripcion']);

Route::get('/encargados/registros/{idEncargado}', [EncargadoController::class, 'obtenerConteoRegistros']);


Route::post('/registro', [RegistroController::class, 'crearRegistro']);


Route::post('/pagos', [PagoController::class, 'guardarPago']);