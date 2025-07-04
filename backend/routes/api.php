<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AreaController;

use App\Http\Controllers\NivelCategoriaController;

use App\Http\Controllers\GradoController;

use App\Http\Controllers\OpcionInscripcionController;

use App\Http\Controllers\OlimpiadaController;

use App\Http\Controllers\CampoPostulanteController;

use App\Http\Controllers\CampoTutorController;

use App\Http\Controllers\OlimpiadaCampoPostulanteController;

use App\Http\Controllers\DatoPostulanteController;

use App\Http\Controllers\OlimpiadaCampoTutorController;

use App\Http\Controllers\DatoTutorController;

use App\Http\Controllers\PersonaController;

use App\Http\Controllers\EncargadoController;

use App\Http\Controllers\InscripcionController;

use App\Http\Controllers\RegistroController;

use App\Http\Controllers\TutorController;

use App\Http\Controllers\SeccionController;

use App\Http\Controllers\PagoController;

use App\Http\Controllers\Registrolistcontroller;

use App\Http\Controllers\PostulanteController;

use App\Http\Controllers\RegistroTutorController;

use App\Http\Controllers\OpcionCampoPostulanteController;

use App\Http\Controllers\AuthController;

use App\Http\Controllers\ReporteController;
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

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE AREAS
Route::get('/areas', [AreaController::class, 'obtenerAreas']);

Route::get('/areasOlimpiada/{idOlimpiada}', [AreaController::class, 'areadeOlimpiada']);




// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE NIVELES/CATEGORÍAS
Route::get('/niveles_categorias', [NivelCategoriaController::class, 'obtenerNivelesCategorias']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE GRADOS
Route::get('/grados', [GradoController::class, 'obtenerGrados']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE PERSONAS 
Route::get('/personas/ci/{ci}', [PersonaController::class, 'verificarPersona']);

// RUTAS PARA OBTENER LOS REIGSTROS DE TUTORES
Route::get('/registros_tutores/{idRegistro}', [RegistroTutorController::class, 'obtenerRegistrosTutoresPorRegistro']);
Route::post('/registros_tutores', [RegistroTutorController::class, 'crearRegistroTutor']);
Route::delete('/registros_tutores/{idRegistroTutor}', [RegistroTutorController::class, 'eliminarRegistroTutor']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE OPCIONES DE INSCRIPCIÓN A UNA OLIMPIADA 
Route::get('/opciones_inscripcion/{idOlimpiada}', [OpcionInscripcionController::class, 'obtenerOpcionesInscripcion']);
Route::get('/opciones_inscripcion/{idOlimpiada}/areas', [OpcionInscripcionController::class, 'obtenerAreasPorOlimpiada']);
Route::get('/opciones_inscripcion/{idOlimpiada}/mapa', [OpcionInscripcionController::class, 'obtenerMapaOlimpiada']);
Route::get('/opciones_inscripcion/{idOlimpiada}/con-postulantes', [OpcionInscripcionController::class, 'verificarOpcionesConPostulantes']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE OLIMPIADAS
Route::get('/olimpiadas', [OlimpiadaController::class, 'obtenerOlimpiadas']);
Route::get('/olimpiadas/activas', [OlimpiadaController::class, 'obtenerOlimpiadasActivas']);
Route::get('/olimpiadas/{id}', [OlimpiadaController::class, 'obtenerOlimpiada']);


// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE CAMPOS DE POSTULANTE
Route::get('/campos_postulante', [CampoPostulanteController::class, 'obtenerCatalogoCamposPostulante']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE CAMPOS DE TUTOR
Route::get('/campos_tutor', [CampoTutorController::class, 'obtenerCatalogoCamposTutor']);


//RUTAS PARA LOS DATOS DEL POSTULANTE
Route::post('/datos_postulante', [DatoPostulanteController::class, 'almacenarDatosPostulante']);

//RUTAS PARA LOS DATOS DEL TUTOR
Route::post('/datos_tutor', [DatoTutorController::class, 'almacenarDatosTutor']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE ENCARGADOS DE INSCRIPCIÓN 
Route::get('/encargados', [EncargadoController::class, 'obtenerEncargados']);
Route::get('/encargados/verificar/{ci}', [EncargadoController::class, 'verificarEncargado']);
Route::post('/encargados', [EncargadoController::class, 'almacenarEncargado']);
Route::get('/encargados/{id}', [EncargadoController::class, 'obtenerEncargado']);

//RUTAS PARA LOS CAMPOS DE TUTOR DADA UNA OLIMPIADA
Route::get('/olimpiadas-campos_tutor/{idOlimpiada}/{idTutor}', [OlimpiadaCampoTutorController::class, 'obtenerCamposTutor']);
Route::get('/olimpiadas-campos_tutor/{idOlimpiada}', [OlimpiadaCampoTutorController::class, 'obtenerCamposTutor']);      

//RUTAS PARA LOS CAMPOS DE POSTULANTE DADA UNA OLIMPIADA
Route::get('/olimpiadas-campos_postulante/{idOlimpiada}/{idPostulante}', [OlimpiadaCampoPostulanteController::class, 'obtenerCamposPostulante']);
Route::get('/olimpiadas-campos_postulante/{idOlimpiada}', [OlimpiadaCampoPostulanteController::class, 'obtenerCamposPostulante']);

// RUTAS PARA REGISTRO DE POSTULANTE A UNA OLIMPIADA
Route::post('/registro', [RegistroController::class, 'crearRegistro']);
Route::get('/registro/olimpiada/{idOlimpiada}/postulante/{ci}', [RegistroController::class, 'obtenerRegitroAOlimpiadaPorCI']);
Route::get('registro/{idRegistro}/tutores', [RegistroController::class, 'obtenerTutoresDeRegistro']);
Route::post('registro/{idRegistro}/tutores', [RegistroController::class, 'asociarTutoresARegistro']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE TUTORES 
Route::get('/tutores/{ciTutor}', [TutorController::class, 'obtenerTutor']);
Route::post('/tutores', [TutorController::class, 'almacenarTutor']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE ROLES DE TUTORES
Route::get('/roles-tutor', [TutorController::class, 'obtenerRoles']);

// RUTAS PARA ADMINISTRAR EL CATÁLOGO DE POSTULANTES
Route::get('/postulantes/ci/{ci}', [PostulanteController::class, 'obtenerPostulantePorCI']);
Route::post('/postulante_nuevo', [PostulanteController::class, 'crearPostulante']);

// RUTAS PARA ADMINISTRAR LAS INSCRIPCIONES
Route::get('/inscripciones/{idEncargado}/{idOlimpiada}', [InscripcionController::class, 'obtenerInscripciones']);
Route::get('/inscripciones-registro/{idRegistro}', [InscripcionController::class, 'obtenerInscripcionesPorRegistro']);
Route::post('/inscripciones', [InscripcionController::class, 'crearInscripcion']);
Route::delete('/inscripciones/{idInscripcion}', [InscripcionController::class, 'eliminarInscripcion']);

// RUTAS PARA VALIDAR COMPROBANTES DE PAGOS
Route::post('/pagos/obtenerPagoAsociado', [PagoController::class, 'obtenerPagoAsociado']);
Route::post('/pagos/validarComprobantePago', [PagoController::class, 'validarComprobantePago']);


// RUTAS PARA REGISTRO DE LISTA DE POSTULANTES
Route::post('/postulantes_lote', [Registrolistcontroller::class, 'registrarListaPostulantes']);
Route::get('/registro_lista', [Registrolistcontroller::class, 'obtenerListaPostulantes']);
Route::post('/registro_lista/importar', [Registrolistcontroller::class, 'importar']);



//RUTAS PARA GENERAR ORDEN DE PAGO
Route::post('/pagos/generarDatosPago', [PagoController::class, 'generarDatosDeOrden']);
Route::post('/pagos/guardarOrdenPago', [PagoController::class, 'guardarOrdenPago']);
Route::post('/pagos/obtenerOrdenesDePago/{idEncargado}/{idOlimpiada}', [PagoController::class, 'obtenerOrdenesDePago']);

// RUTAS PARA LAS OPCIONES DE CAMPO DE POSTULANTE
Route::get('/opciones_campo_postulante/agrupadas/{idCampoPostulante}', [OpcionCampoPostulanteController::class, 'opcionesAgrupadas']);

// RUTAS DE REPOSRTE  DE INSCRITOS POR OLIMPIADA
Route::get('/reporte_inscritos/{idOlimpiada}', [ReporteController::class, 'inscritosPorOlimpiada']);
Route::get('/reporte/areas/{idOlimpiada}', [ReporteController::class, 'ReportePorArea']);

// Endpoint para login de administrador
Route::post('/admin/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::delete('/olimpiadas-campos_tutor/{idOlimpiadaCampoTutor}', [OlimpiadaCampoTutorController::class, 'eliminarCampoTutor']);
    Route::post('/olimpiadas-campos_tutor', [OlimpiadaCampoTutorController::class, 'almacenarCampoTutor']);

   
    Route::delete('/olimpiadas-campos_postulante/{idOlimpiadaCampoPostulante}', [OlimpiadaCampoPostulanteController::class, 'eliminarCampoPostulante']);
    Route::post('/olimpiadas-campos_postulante', [OlimpiadaCampoPostulanteController::class, 'almacenarCampoPostulante']);

    Route::post('/niveles_categorias', [NivelCategoriaController::class, 'almacenarNivelCategoria']);
    Route::post('/niveles_categorias/{id}/grados', [NivelCategoriaController::class, 'asociarGrados']);

    Route::post('/areas', [AreaController::class, 'almacenarArea']);

    Route::put('/olimpiadas/{id}/modificar', [OlimpiadaController::class, 'modificarOlimpiada']);

    Route::post('/opciones_inscripcion', [OpcionInscripcionController::class, 'almacenarOpcionInscripcion']);
    Route::delete('/opciones_inscripcion/{idOlimpiada}', [OpcionInscripcionController::class, 'eliminarOpcionesIncripcionPorOlimpiada']);

    Route::post('/olimpiadas', [OlimpiadaController::class, 'almacenarOlimpiada']);
    Route::post('/activarolimpiada/{id}', [OlimpiadaController::class, 'activarOlimpiada']);
});