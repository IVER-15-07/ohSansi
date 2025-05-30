import {useState, useEffect}from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Cargando from '../Cargando';
import ElegirCamposPostulante from './ElegirCamposPostulante';
import ElegirCamposTutor from './ElegirCamposTutor';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

import { getCatalogoCamposPostulante } from '../../../service/campos_postulante.api';
import { getCatalogoCamposTutor } from '../../../service/campos_tutor.api';

import { getOlimpiadaCamposPostulante, postOlimpiadaCampoPostulante} from '../../../service/olimpiada_campos_postulante.api';
import { getOlimpiadaCamposTutor, postOlimpiadaCampoTutor } from '../../../service/olimpiada_campos_tutor.api';

const ConfigurarCamposOlimpiada = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [catalogoCamposPostulante, setCatalogoCamposPostulante] = useState([]);
  const [catalogoCamposTutor, setCatalogoCamposTutor] = useState([]);

  const [olimpiadaCamposPostulante, setOlimpiadaCamposPostulante] = useState([]);
  const [olimpiadaCamposTutor, setOlimpiadaCamposTutor] = useState([]);

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        setIsLoading(true);
        const catalogoCamposPostulanteRes = (await getCatalogoCamposPostulante()).data;
        setCatalogoCamposPostulante(catalogoCamposPostulanteRes);

        const catalogoCamposTutorRes = (await getCatalogoCamposTutor()).data;
        setCatalogoCamposTutor(catalogoCamposTutorRes);
      } catch (error) {
        console.error('Error fetching catalogos:', error);
        setError(error);
      }finally {
        setIsLoading(false);
      }
    }

    const fetchOlimpiadaCampos = async () => {
      try{
        const olimpiadaCamposPostulanteRes = (await getOlimpiadaCamposPostulante(id)).data;
        setOlimpiadaCamposPostulante(olimpiadaCamposPostulanteRes);

        const olimpiadaCamposTutorRes = (await getOlimpiadaCamposTutor(id)).data;
        setOlimpiadaCamposTutor(olimpiadaCamposTutorRes);
      }catch (error) {
        console.error('Error fetching catalogos configurados:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCatalogos();
    fetchOlimpiadaCampos();
  }, [id]); 


  // Filtrar los catálogos para quitar los campos ya definidos en la olimpiada
  const catalogoCamposPostulanteFiltrado = catalogoCamposPostulante.filter(campo =>
    !olimpiadaCamposPostulante.some(ocp => ocp.campo_postulante.id === campo.id)
  );
  const catalogoCamposTutorFiltrado = catalogoCamposTutor.filter(campo =>
    !olimpiadaCamposTutor.some(oct => oct.campo_tutor.id === campo.id)
  );
  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleGuardarConfiguracionCampos = async () => {
    try{
      setIsAdding(true);
      await Promise.all([
        ...olimpiadaCamposPostulante.map(async (campo, index) => 
        {
          const olimpiadaCampoPostulanteNuevo = (await postOlimpiadaCampoPostulante(campo)).data;
          setOlimpiadaCamposPostulante( prev => {
            const updatedCampos = [...prev];
            updatedCampos[index] = {...updatedCampos[index], id: olimpiadaCampoPostulanteNuevo.id};
            return updatedCampos;
          });
        }),
        ...olimpiadaCamposTutor.map(async (campo, index) => 
        {
          console.log("Campo Tutor", campo);
          const olimpiadaCampoTutorNuevo = (await postOlimpiadaCampoTutor(campo)).data;
          setOlimpiadaCamposTutor( prev => {
            const updatedCampos = [...prev];
            updatedCampos[index] = {...updatedCampos[index], id: olimpiadaCampoTutorNuevo.id};
            return updatedCampos;
          });
        })
      ]);
      setShowConfirmModal(false);
    }catch (error) {
      console.error('Error al guardar la configuración:', error);
      setError(error);
    }finally{
      setIsAdding(false);
    }
  };
  console.log(olimpiadaCamposPostulante);
  console.log(olimpiadaCamposTutor);
  if (isLoading) return <Cargando />;
  return (
    <div className="flex flex-col p-6 gap-4 w-full h-full min-h-[600px] max-h-[780px] bg-[#F9FAFB]">
      <div className="flex flex-col gap-4 h-full">   
        {/* Botón para volver a la vista de Olimpiada */}
        <div className="flex flex-col items-center mb-2">
          <button 
            onClick={() => navigate('/AdminLayout/VistaOlimpiadas')}
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
                <h3 className="font-semibold">Campos disponibles para Postulante:</h3>
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
                <h3 className='font-semibold'>Campos disponibles para Tutor</h3>
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
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleGuardarConfiguracionCampos}
            title="Confirmar acción"
            message="¿Está seguro que desea guardar la configuración de los campos del formulario? Esta acción establecerá los datos que se pedirán en el formulario."
            confirmText="Confirmar"
            cancelText="Cancelar"
            isLoading={isAdding}
            confirmButtonColor="blue"
          />

          {/* Botones de navegación */}
          <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-md border border-gray-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Atrás
              </button>
            )}
      
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Siguiente
              </button>
            )}
      
            {step === 2 && (
              <button
                onClick={handleSaveClick}
                disabled={isAdding}
                className={`px-5 py-2 rounded-md text-white ${
                  isAdding
                    ? "bg-gray-400"
                    : "bg-blue-900 hover:bg-blue-800"
                }`}
              >
                {isAdding ? "Guardando..." : "Guardar Configuración"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ConfigurarCamposOlimpiada;