import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserCheck, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import ElegirCamposPostulante from './ElegirCamposPostulante';
import ElegirCamposTutor from './ElegirCamposTutor';
import { Modal, LoadingSpinner, Card, Button, Alert } from '../../components/ui';
import { useDeviceAgent } from '../../hooks/useDeviceAgent';

import { getCatalogoCamposPostulante } from '../../../service/campos_postulante.api';
import { getCatalogoCamposTutor } from '../../../service/campos_tutor.api';
import {
  getOlimpiadaCamposPostulante,
  postOlimpiadaCampoPostulante
} from '../../../service/olimpiada_campos_postulante.api';
import {
  getOlimpiadaCamposTutor,
  postOlimpiadaCampoTutor
} from '../../../service/olimpiada_campos_tutor.api';

const ConfigurarCamposOlimpiada = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDeviceAgent();

  // Step management
  const [step, setStep] = useState(1);

  // Loading and error states
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Data states
  const [catalogoCamposPostulante, setCatalogoCamposPostulante] = useState([]);
  const [catalogoCamposTutor, setCatalogoCamposTutor] = useState([]);
  const [olimpiadaCamposPostulante, setOlimpiadaCamposPostulante] = useState([]);
  const [olimpiadaCamposTutor, setOlimpiadaCamposTutor] = useState([]);

  // Memoized filtered catalogs for performance
  const catalogoCamposPostulanteFiltrado = useMemo(() =>
    catalogoCamposPostulante.filter(campo =>
      !olimpiadaCamposPostulante.some(ocp => ocp.campo_postulante.id === campo.id)
    ), [catalogoCamposPostulante, olimpiadaCamposPostulante]
  );

  const catalogoCamposTutorFiltrado = useMemo(() =>
    catalogoCamposTutor.filter(campo =>
      !olimpiadaCamposTutor.some(oct => oct.campo_tutor.id === campo.id)
    ), [catalogoCamposTutor, olimpiadaCamposTutor]
  );

  // Responsive configuration
  const containerClasses = useMemo(() => {
    const base = "min-h-screen bg-slate-50 p-4";
    if (isMobile) return `${base} sm:p-6`;
    if (isTablet) return `${base} md:p-8`;
    return `${base} lg:p-10`;
  }, [isMobile, isTablet]);

  const cardClasses = useMemo(() => {
    const base = "bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden";
    if (isMobile) return `${base} mx-2`;
    return `${base} max-w-7xl mx-auto`;
  }, [isMobile]);

  const stepTitles = useMemo(() => ({
    1: { title: "Campos del Postulante", icon: Users },
    2: { title: "Campos del Tutor", icon: UserCheck }
  }), []);

  // Data fetching functions with improved error handling
  const fetchCatalogos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carga de catálogos...');
      
      const [catalogoPostulanteRes, catalogoTutorRes] = await Promise.all([
        getCatalogoCamposPostulante(),
        getCatalogoCamposTutor()
      ]);

      console.log('✅ Catálogos cargados exitosamente');
      setCatalogoCamposPostulante(catalogoPostulanteRes.data || []);
      setCatalogoCamposTutor(catalogoTutorRes.data || []);
      
    } catch (error) {
      console.error('❌ Error fetching catalogos:', error);
      
      // Análisis detallado del error
      let errorMessage = 'Error al cargar los catálogos de campos';
      let errorDetails = error.message;
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('📊 Error Response Status:', status);
        console.error('📝 Error Response Data:', data);
        
        if (status === 500) {
          errorMessage = 'Error interno del servidor al cargar los catálogos';
          if (data?.message?.includes('invalid input syntax for type bigint')) {
            errorMessage = 'Error de configuración de rutas en el servidor. Contacte al administrador.';
            errorDetails = 'Las rutas del backend están en conflicto. Se requiere reorganización de rutas.';
          }
        } else if (status === 404) {
          errorMessage = 'Los endpoints de catálogos no fueron encontrados';
          errorDetails = 'Verificar que las rutas /api/campos_postulante y /api/campos_tutor estén disponibles';
        } else if (status >= 400 && status < 500) {
          errorMessage = 'Error de solicitud al servidor';
          errorDetails = data?.message || `Error ${status}`;
        }
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Error de conexión con el servidor';
        errorDetails = 'Verificar que el servidor backend esté ejecutándose';
      }
      
      setError({
        message: errorMessage,
        details: errorDetails,
        canRetry: true,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOlimpiadaCampos = useCallback(async () => {
    try {
      if (!id) {
        setError({ 
          message: 'ID de olimpiada no válido', 
          details: 'No se proporcionó un ID válido para la olimpiada',
          canRetry: false 
        });
        return;
      }

      const [olimpiadaPostulanteRes, olimpiadaTutorRes] = await Promise.all([
        getOlimpiadaCamposPostulante(id),
        getOlimpiadaCamposTutor(id)
      ]);

      setOlimpiadaCamposPostulante(olimpiadaPostulanteRes.data || []);
      setOlimpiadaCamposTutor(olimpiadaTutorRes.data || []);
      
    } catch (error) {
      console.error('Error fetching olimpiada campos:', error);
      
      let errorMessage = 'Error al cargar los campos configurados';
      let errorDetails = error.message;
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'Olimpiada no encontrada';
          errorDetails = `No se encontró la olimpiada con ID ${id}`;
        } else if (status === 500) {
          errorMessage = 'Error interno del servidor al cargar campos de olimpiada';
          errorDetails = data?.message || 'Error en el servidor';
        }
      }
      
      setError({
        message: errorMessage,
        details: errorDetails,
        canRetry: error.response?.status === 500
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Initialize data on component mount
  useEffect(() => {
    fetchCatalogos();
    fetchOlimpiadaCampos();
  }, [fetchCatalogos, fetchOlimpiadaCampos]);

  // Cleanup success message on unmount
  useEffect(() => {
    return () => {
      if (successMessage) {
        setSuccessMessage(null);
      }
    };
  }, [successMessage]);
  // Optimized save handler with useCallback
  const handleSaveClick = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const handleGuardarConfiguracionCampos = useCallback(async () => {
    try {
      setIsAdding(true);
      setError(null); // Limpiar errores previos

      await Promise.all([
        ...olimpiadaCamposPostulante
          .filter(campo => campo.id === null)
          .map(async (campo) => {
            const olimpiadaCampoPostulanteNuevo = (await postOlimpiadaCampoPostulante(campo)).data;
            setOlimpiadaCamposPostulante(prev => {
              const updatedCampos = [...prev];
              const realIndex = prev.findIndex(c => c.tempId === campo.tempId);
              if (realIndex !== -1) {
                updatedCampos[realIndex] = { ...updatedCampos[realIndex], id: olimpiadaCampoPostulanteNuevo.id };
              }
              return updatedCampos;
            });
          }),
        ...olimpiadaCamposTutor
          .filter(campo => campo.id === null)
          .map(async (campo) => {
            const olimpiadaCampoTutorNuevo = (await postOlimpiadaCampoTutor(campo)).data;
            setOlimpiadaCamposTutor(prev => {
              const updatedCampos = [...prev];
              const realIndex = prev.findIndex(c => c.tempId === campo.tempId);
              if (realIndex !== -1) {
                updatedCampos[realIndex] = { ...updatedCampos[realIndex], id: olimpiadaCampoTutorNuevo.id };
              }
              return updatedCampos;
            });
          })
      ]);

      setShowConfirmModal(false);
      setSuccessMessage('¡Configuración guardada exitosamente!');

      // Redirigir después de 2 segundos para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/AdminLayout/Olimpiadas');
      }, 2000);

    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      setError('Error al guardar la configuración de campos');
      setShowConfirmModal(false);
    } finally {
      setIsAdding(false);
    }
  }, [olimpiadaCamposPostulante, olimpiadaCamposTutor, navigate]);

  // Navigation handlers
  const handleNextStep = useCallback(() => setStep(2), []);
  const handlePrevStep = useCallback(() => setStep(1), []);
  const handleBackToOlimpiadas = useCallback(() => navigate('/AdminLayout/Olimpiadas'), [navigate]);
  // Loading state with responsive design
  if (isLoading) return (
    <div className={containerClasses}>
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size={isMobile ? "lg" : "xl"} text="Cargando campos..." />
      </div>
    </div>
  );

  // Error state with Alert component and retry functionality
  if (error) return (
    <div className={containerClasses}>
      <div className="max-w-md mx-auto mt-8">
        <Alert
          variant="error"
          title="Error de Carga"
          className="mb-4"
        >
          <div className="space-y-2">
            <p className="text-red-700 font-medium">{error.message || error}</p>
            {error.details && (
              <details className="text-sm text-gray-600">
                <summary className="cursor-pointer hover:text-gray-800">
                  Ver detalles técnicos
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {error.details}
                </pre>
              </details>
            )}
            {error.timestamp && (
              <p className="text-xs text-gray-500">
                Ocurrido el: {error.timestamp}
              </p>
            )}
          </div>
        </Alert>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded border border-gray-300 hover:border-gray-400"
          >
            Cerrar
          </button>
          {error.canRetry && (
            <button
              onClick={() => {
                setError(null);
                fetchCatalogos();
                fetchOlimpiadaCampos();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Reintentar
            </button>
          )}
          <button
            onClick={handleBackToOlimpiadas}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Volver a Olimpiadas
          </button>
        </div>
      </div>
    </div>
  );

  // Success state with Alert component
  if (successMessage) return (
    <div className={containerClasses}>
      <Alert
        variant="success"
        title="Configuración guardada"
      />
      <div className="flex justify-center mt-4">
        <LoadingSpinner size="sm" text="Redirigiendo..." />
      </div>
    </div>
  );

  const currentStepConfig = stepTitles[step];
  const StepIcon = currentStepConfig.icon;
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#F9FAFB] py-8 px-2">
      {/* Botón volver alineado a la izquierda */}


      {/* Card principal */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-gray-200 px-8 py-8 flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">
          Configuración de Campos del Formulario de la Olimpiada
        </h2>

        {/* Paso 1 */}
        {step === 1 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-base">
              *Los nombres, los apellidos, la fecha de nacimiento y el grado de un postulante son campos obligatorios y esenciales para el registro.
              Estos se pedirán automáticamente y no es necesario configurarlos.
            </h3>
            <ElegirCamposPostulante
              disponibles={catalogoCamposPostulanteFiltrado}
              seleccionadas={olimpiadaCamposPostulante}
              setSeleccionadas={setOlimpiadaCamposPostulante}
              idOlimpiada={id}
            />
          </div>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-base">
              *Los nombres, los apellidos y su relación con el postulante de un tutor son campos obligatorios y esenciales para el registro.
              Estos se pedirán automáticamente y no es necesario configurarlos.
            </h3>
            <ElegirCamposTutor
              disponibles={catalogoCamposTutorFiltrado}
              seleccionadas={olimpiadaCamposTutor}
              setSeleccionadas={setOlimpiadaCamposTutor}
              idOlimpiada={id}
            />
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between items-center gap-3 mt-6">
          {/* Botón Volver a Olimpiadas a la izquierda */}
          <Button
            onClick={handleBackToOlimpiadas}
            className="flex items-center px-6 py-2 rounded-md bg-white border border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold shadow-none"
            variant="outline"
          >
            <ArrowLeft size={20} className="mr-2" /> Volver a Olimpiadas
          </Button>

          {/* Botones de navegación a la derecha */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                key="back-button"
                onClick={handlePrevStep}
                className="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
              >
                Atrás
              </Button>
            )}
            {step === 1 && (
              <Button
                key="next-button"
                variant="secondary"
                onClick={handleNextStep}
                className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Siguiente
              </Button>
            )}
            {step === 2 && (
              <Button
                variant="success"
                key="save-button"
                onClick={handleSaveClick}
                disabled={isAdding}
                className={`px-6 py-2 rounded-md text-white font-semibold ${isAdding
                  ? "bg-gray-400"
                  : "bg-blue-900 hover:bg-blue-800"
                  }`}
              >
                {isAdding ? "Guardando..." : "Guardar Configuración"}
              </Button>
            )}
          </div>
        </div>
      </div>







      {/* Modal de confirmación */}
      <Modal
        variant="warning"
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleGuardarConfiguracionCampos}
        title="Confirmar acción"
        message="¿Está seguro que desea guardar la configuración de los campos del formulario? Esta acción establecerá los datos que se pedirán en el formulario."
        confirmText="Confirmar"
        cancelText="Cancelar"
        isLoading={isAdding}
      />
    </div>
  );
}
export default ConfigurarCamposOlimpiada;