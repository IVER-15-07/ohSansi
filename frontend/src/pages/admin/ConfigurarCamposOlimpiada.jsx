import {useState, useEffect}from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Cargando from '../Cargando';
import ElegirCamposPostulante from './ElegirCamposPostulante';

import { getCatalogoCamposPostulante } from '../../../service/campos_postulante.api';
import { getCatalogoCamposTutor } from '../../../service/campos_tutor.api';

import { getOlimpiadaCamposPostulante } from '../../../service/olimpiada_campos_postulante.api';
import { getOlimpiadaCamposTutor } from '../../../service/olimpiada_campos_tutor.api';

const ConfigurarCamposOlimpiada = () => {
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // console.log('Catalogo Campos Postulante:', catalogoCamposPostulante);
  // console.log('Catalogo Campos Tutor:', catalogoCamposTutor);
  // console.log('Olimpiada Campos Postulante:', olimpiadaCamposPostulante);
  console.log('Olimpiada Campos Tutor:', olimpiadaCamposTutor);

  // Filtrar los catálogos para quitar los campos ya definidos en la olimpiada
  const catalogoCamposPostulanteFiltrado = catalogoCamposPostulante.filter(campo =>
    !olimpiadaCamposPostulante.some(ocp => ocp.campo_postulante.id === campo.id)
  );
  const catalogoCamposTutorFiltrado = catalogoCamposTutor.filter(campo =>
    !olimpiadaCamposTutor.some(oct => oct.campo_tutor.id === campo.id)
  );
  
  if (isLoading) return <Cargando />;
  return (
    <div className="p-6 flex flex-col gap-4 w-full h-full min-h-[600px] max-h-[780px] bg-[#F9FAFB]">
      <div className="flex flex-col gap-4 h-full">   
        {/* Botón para volver a la vista de Olimpiada */}
        <div className="flex items-center mb-2">
          <button 
            onClick={() => navigate('/AdminLayout/Olympiad')}
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Volver a Olimpiadas
          </button>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 min-h-[460px] max-h-[540px] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800">
              Configuración de Campos del Formulario de la Olimpiada
            </h2>
            {/* Ejemplo de uso de los arrays filtrados: */}
            <div>
              <h3 className="font-semibold">Campos disponibles para Postulante:</h3>
              <ElegirCamposPostulante 
                disponibles={catalogoCamposPostulanteFiltrado}
                seleccionadas={olimpiadaCamposPostulante}
                setSeleccionadas={setOlimpiadaCamposPostulante}
                idOlimpiada={id}
              />
              <ul>
                {catalogoCamposPostulanteFiltrado.map(campo => (
                  <li key={campo.id}>{campo.nombre}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Campos disponibles para Tutor:</h3>
              <ul>
                {catalogoCamposTutorFiltrado.map(campo => (
                  <li key={campo.id}>{campo.nombre}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ConfigurarCamposOlimpiada;