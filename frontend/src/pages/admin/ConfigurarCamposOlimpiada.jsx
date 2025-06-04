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

  // Data fetching functions
  const fetchCatalogos = useCallback(async () => {
    try {
      setIsLoading(true);
      const [catalogoPostulanteRes, catalogoTutorRes] = await Promise.all([
        getCatalogoCamposPostulante(),
        getCatalogoCamposTutor()
      ]);
      
      setCatalogoCamposPostulante(catalogoPostulanteRes.data);
      setCatalogoCamposTutor(catalogoTutorRes.data);
    } catch (error) {
      console.error('Error fetching catalogos:', error);
      setError('Error al cargar los catálogos de campos');
    }
  }, []);

  const fetchOlimpiadaCampos = useCallback(async () => {
    try {
      const [olimpiadaPostulanteRes, olimpiadaTutorRes] = await Promise.all([
        getOlimpiadaCamposPostulante(id),
        getOlimpiadaCamposTutor(id)
      ]);
      
      setOlimpiadaCamposPostulante(olimpiadaPostulanteRes.data);
      setOlimpiadaCamposTutor(olimpiadaTutorRes.data);
    } catch (error) {
      console.error('Error fetching olimpiada campos:', error);
      setError('Error al cargar los campos configurados');
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
                updatedCampos[realIndex] = {...updatedCampos[realIndex], id: olimpiadaCampoPostulanteNuevo.id};
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
                updatedCampos[realIndex] = {...updatedCampos[realIndex], id: olimpiadaCampoTutorNuevo.id};
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

  // Error state with Alert component
  if (error) return (
    <div className={containerClasses}>
      <Alert 
        type="error" 
        message={error} 
        onClose={() => setError(null)}
        className="max-w-md mx-auto mt-8"
      />
    </div>
  );

  // Success state with Alert component
  if (successMessage) return (
    <div className={containerClasses}>
      <Alert 
        type="success" 
        message={successMessage} 
        className="max-w-md mx-auto mt-8"
      />
      <div className="flex justify-center mt-4">
        <LoadingSpinner size="sm" text="Redirigiendo..." />
      </div>
    </div>
  );

  const currentStepConfig = stepTitles[step];
  const StepIcon = currentStepConfig.icon;
  return (
    <div className="flex flex-col p-6 gap-4 w-full h-full min-h-[600px] max-h-[780px] bg-[#F9FAFB]">
      <div className="flex flex-col gap-4 h-full">   
        {/* Botón para volver a la vista de Olimpiada */}
        <div className="flex flex-col items-center mb-2">
          <button 
            onClick={handleBackToOlimpiadas}
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Volver a Olimpiadas
          </button>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 min-h-[460px] max-h-[540px] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800">
              Configuración de Campos del Formulario de la Olimpiada 
            </h2>
            {/* Ejemplo de uso de los arrays filtrados: */}
            {step == 1 &&(
              <div>
                <h2 className="font-semibold text-xl py-4">Campos disponibles para Postulante:</h2>
                <ElegirCamposPostulante 
                  disponibles={catalogoCamposPostulanteFiltrado}
                  seleccionadas={olimpiadaCamposPostulante}
                  setSeleccionadas={setOlimpiadaCamposPostulante}
                  idOlimpiada={id}
                />
              </div>
            )}

            {step == 2 &&(
              <div>
                <h3 className='font-semibold text-xl py-4'>Campos disponibles para Tutor</h3>
                <ElegirCamposTutor
                disponibles={catalogoCamposTutorFiltrado}
                seleccionadas={olimpiadaCamposTutor}
                setSeleccionadas={setOlimpiadaCamposTutor}
                idOlimpiada={id}
                />
              </div>
            )}
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

          {/* Botones de navegación */}
          <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  key="back-button"
                  onClick={handlePrevStep}
                  className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Atrás
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {step === 1 && (
                <Button
                  key="next-button"
                  variant="secondary"
                  onClick={handleNextStep}
                  className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
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
                  className={`px-5 py-2 rounded-md text-white ${
                    isAdding
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
      </div>
    </div>
  );
}
export default ConfigurarCamposOlimpiada;