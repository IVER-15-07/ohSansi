import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAreas } from '../../../service/areas.api';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { getOlimpiada } from '../../../service/olimpiadas.api';

import { getNivelesCategorias } from '../../../service/niveles_categorias.api';
import { getAreasByOlimpiada, getMapOfOlimpiada, deleteOpcionesInscripcionByOlimpiada, createOpcionInscripcion, getOpcionesConPostulantes } from '../../../service/opciones_inscripcion.api';
import Error from '../Error';
import ElegirAreas from './ElegirAreas';
import ElegirNiveles from './ElegirNiveles';
import { Modal, Alert, LoadingSpinner } from '../../components/ui';

const ConfOlimpiada = () => {
  const { id, nombreOlimpiada } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [nivelesPorArea, setNivelesPorArea] = useState({});
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [opcionesConPostulantes, setOpcionesConPostulantes] = useState([]);
  const [areasConPostulantes, setAreasConPostulantes] = useState([]);
  const [nivelesConPostulantesPorArea, setNivelesConPostulantesPorArea] = useState({});
  const [modalError, setModalError] = useState("");
  const [modalErrorNiveles, setModalErrorNiveles] = useState("");

  const { data: areasCatalogo, isLoading: isLoadingAreas, error: errorAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
    staleTime: 1000 * 60 * 10, //10 min
  });

  const { data: nivelesCatalogo, isLoading: isLoadingNiveles, error: errorNiveles } = useQuery({
    queryKey: ['niveles_categorias'],
    queryFn: getNivelesCategorias,
    staleTime: 1000 * 60 * 5, //5 min
  });

  useEffect(() => {
    // Validar fecha de inscripcion antes de mostrar la vista
    const validarFechas = async () => {
      try {
        const response = await getOlimpiada(id);
        const olimpiada = response;
        console.log(response)
        if (!olimpiada) {
          setModalError("La información de la olimpiada no está disponible.");
          return;
        }

        if (olimpiada.inicio_inscripcion) {
          const hoy = new Date();
          const inicioInscripcion = new Date(olimpiada.inicio_inscripcion);
          
          // Normalizar las fechas para comparar solo fecha (sin hora)
          hoy.setHours(0, 0, 0, 0);
          inicioInscripcion.setHours(0, 0, 0, 0);
          
          if (hoy >= inicioInscripcion) {
            setModalError("Las inscripciones están en curso o ya han comenzado. No se puede modificar la configuración de áreas y niveles de la olimpiada.");
            return;
          }
        }
        
        // Si inicio_inscripcion es null, permitir configuración sin validación de fechas
        console.log("Olimpiada sin fechas de inscripción configuradas - permitiendo configuración");
      
      } catch (e) {
        console.error("Error al validar la información de la olimpiada:", e);
        setModalError("Error al validar la información de la olimpiada. Por favor, intente nuevamente.");
      }
    };
    
    if (id) {
      validarFechas();
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [areasRes, mapaRes, opcionesConPostulantesRes] = await Promise.all([
        getAreasByOlimpiada(id),
        getMapOfOlimpiada(id),
        getOpcionesConPostulantes(id)
      ]);
        
        setAreasSeleccionadas(areasRes.data || []);
        setNivelesPorArea(mapaRes.data || {});
        
        // Procesar opciones con postulantes
        const opciones = opcionesConPostulantesRes.data || [];
        setOpcionesConPostulantes(opciones);
        
        // Extraer áreas con postulantes
        const areasIds = [...new Set(opciones.map(opcion => opcion.id_area))];
        setAreasConPostulantes(areasIds);
        
        // Agrupar niveles con postulantes por área
        const nivelesAgrupados = {};
        opciones.forEach(opcion => {
          if (!nivelesAgrupados[opcion.id_area]) {
            nivelesAgrupados[opcion.id_area] = [];
          }
          nivelesAgrupados[opcion.id_area].push(opcion.id_nivel_categoria);
        });
        setNivelesConPostulantesPorArea(nivelesAgrupados);
      } catch (e) {
        console.error(e);
        setError("Error al cargar los datos. Intenta nuevamente.");
      } finally {	
        setIsLoading(false);	
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleSaveClick = () => {
    // Validar que cada área seleccionada tenga al menos un nivel asociado
    const areasSinNiveles = areasSeleccionadas.filter(area => {
      const niveles = nivelesPorArea[area.id];
      return !niveles || niveles.length === 0;
    });
    if (areasSinNiveles.length > 0) {
      setModalErrorNiveles("Cada área seleccionada debe tener al menos un nivel/categoría asociado antes de guardar la configuración.");
      return;
    }
    setShowConfirmModal(true);
  };
  const handleGuardarConfiguracion = async () => {
  setIsAdding(true);
  setShowConfirmModal(false);
  try {
    // Intentar eliminar, pero continuar si falla
    try {
      await deleteOpcionesInscripcionByOlimpiada(id);
      console.log('Opciones anteriores eliminadas exitosamente');
    } catch (deleteError) {
      console.warn('No se pudieron eliminar las opciones anteriores:', deleteError);
      // Continuar con la creación de las nuevas opciones
    }
    
    // Crear nuevas configuraciones
    const configuraciones = [];

    areasSeleccionadas.forEach((area) => {
      const niveles = nivelesPorArea[area.id] || [];
      niveles.forEach((nivel) => {
        configuraciones.push({
          id_olimpiada: id,
          id_area: area.id,
          id_nivel_categoria: nivel.id,
        });
      });
    });

    // Crear las nuevas opciones
    await Promise.all(configuraciones.map((config) => createOpcionInscripcion(config)));
    
    setSuccessMessage('Configuración guardada exitosamente.');
    setTimeout(() => {
        navigate('/AdminLayout/Olimpiadas');
    }, 2000);
  } catch (error) {
    console.error(error);
    const errorMessage = error.response?.data?.message || 'Error al guardar opciones de inscripcion.';
    setError(errorMessage);
  } finally {
    setIsAdding(false);
  }
};

  // Mostrar modal de error si corresponde
  if (modalError) {
    return (
      <Modal
        variant="danger"
        isOpen={true}
        onClose={() => navigate('/AdminLayout/Olimpiadas')}
        title="Inscripciones en curso"
        message={modalError}
        confirmText="Volver a Olimpiadas"
        showCancelButton={false}
        preventCloseOnBackdrop={true}
      />
    );
  }
  
  if (modalErrorNiveles) {
    return (
      <Modal 
        variant='danger'
        isOpen={true}
        onClose={() => setModalErrorNiveles("")}
        title="Error de Configuración"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-gray-600 mb-6">{modalErrorNiveles}</p>
          <button
            onClick={() => setModalErrorNiveles("")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </Modal>
    );
  }

  if (isLoadingAreas || isLoadingNiveles || isLoading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <LoadingSpinner size="xl" text="Cargando configuración..." />
    </div>
  );
  if (errorAreas) return <Error error={errorAreas} />;
  if (errorNiveles) return <Error error={errorNiveles} />;

  return (
    <div className="p-6 flex flex-col gap-4 w-full h-full min-h-[600px] max-h-[780px] bg-[#F9FAFB]">
    <div className="flex flex-col gap-4 h-full">
      <h2 className="text-xl font-bold text-gray-800">
          Configuración de áreas y niveles de {nombreOlimpiada}
        </h2>
      
      {/* Contenido principal de la configuración */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 min-h-[460px] max-h-[540px] overflow-y-auto">
        {/* Botón para volver a la vista de Olimpiada */}
      <div className="flex items-center mb-2">
        <button 
          onClick={() => navigate('/AdminLayout/Olimpiadas')}
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" /> Volver a Olimpiadas
        </button>
      </div>
            
  
        {step === 1 && (
          <ElegirAreas
            catalogo={areasCatalogo.data}
            seleccionadas={areasSeleccionadas}
            setSeleccionadas={setAreasSeleccionadas}
            setNivelesPorArea={setNivelesPorArea}
            areasConPostulantes={areasConPostulantes}
          />
        )}
  
        {step === 2 && (
          <ElegirNiveles
            areas={areasSeleccionadas}
            nivelesCatalogo={nivelesCatalogo.data}
            nivelesPorArea={nivelesPorArea}
            setNivelesPorArea={setNivelesPorArea}
            nivelesConPostulantesPorArea={nivelesConPostulantesPorArea}
          />
        )}
      </div>
  
      {/* Botones de navegación */}
      <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-md border border-gray-200">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200 font-medium"
            >
              Atrás
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={areasSeleccionadas.length === 0}
              className={`px-5 py-2 rounded-md font-medium transition-colors duration-200 ${
                areasSeleccionadas.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Siguiente
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleSaveClick}
              disabled={isAdding}
              className={`px-5 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                isAdding
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-900 hover:bg-blue-800"
              }`}
            >
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </div>
              ) : (
                "Guardar Configuración"
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Modal de confirmación */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleGuardarConfiguracion}
        title="Confirmar acción"
        message="¿Está seguro que desea guardar la configuración de la olimpiada? Esta acción establecerá las áreas y niveles/categorías disponibles para inscripción."
        confirmText="Confirmar"
        cancelText="Cancelar"
        isLoading={isAdding}
        variant="warning"
      />
      
      {/* Modal de éxito */}
      {successMessage && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSuccessMessage('');
            navigate('/AdminLayout/Olimpiadas');
          }}
          title="¡Éxito!"
          message={successMessage}
          variant="success"
          confirmText="Volver a Olimpiadas"
          showCancelButton={false}
        />
      )}
  
      {error && (
        <Alert 
          variant="error" 
          title="Error de Configuración"
          onClose={() => setError(null)}
          autoClose={true}
          autoCloseDelay={5000}
        >
          <div>{error}</div>
        </Alert>
      )}
    </div>
  </div>
  );
};

export default ConfOlimpiada;
