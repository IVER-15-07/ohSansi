import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAreas } from '../../../service/areas.api';
import { getNivelesCategorias } from '../../../service/niveles_categorias.api';
import { getAreasByOlimpiada, getMapOfOlimpiada, deleteConfigurationByOlimpiada, createConfiguracion } from '../../../service/configuraciones.api';
import Cargando from '../Cargando';
import Error from '../Error';
import ElegirAreas from './ElegirAreas';
import ElegirNiveles from './ElegirNiveles';

const ConfOlimpiada = () => {
  const { id, nombreOlimpiada } = useParams();
  const [step, setStep] = useState(1);

  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [nivelesPorArea, setNivelesPorArea] = useState({});
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data: areasCatalogo, isLoading: isLoadingAreas, error: errorAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });

  const { data: nivelesCatalogo, isLoading: isLoadingNiveles, error: errorNiveles } = useQuery({
    queryKey: ['niveles_categorias'],
    queryFn: getNivelesCategorias,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areasRes = await getAreasByOlimpiada(id);
        const mapaRes = await getMapOfOlimpiada(id);
        setAreasSeleccionadas(areasRes.data || []);
        setNivelesPorArea(mapaRes.data || {});
      } catch (e) {
        console.error(e);
        setError("Error al cargar los datos. Intenta nuevamente.");
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleGuardarConfiguracion = async () => {
    setIsAdding(true);
    try {
      await deleteConfigurationByOlimpiada(id);
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

      await Promise.all(configuraciones.map((config) => createConfiguracion(config)));
      alert('Configuraciones guardadas exitosamente.');
    } catch (error) {
      console.error(error);
      setError('Error al guardar configuraciones.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoadingAreas || isLoadingNiveles) return <Cargando />;
  if (errorAreas) return <Error error={errorAreas} />;
  if (errorNiveles) return <Error error={errorNiveles} />;


  return (
    <div className="p-6 flex flex-col gap-4 w-full h-full min-h-[600px] max-h-[780px] bg-[#F9FAFB]">
    <div className="flex flex-col gap-4 h-full">
      
      {/* Contenido principal de la configuración */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 min-h-[460px] max-h-[540px] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800">
          Configuración de la Olimpiada {nombreOlimpiada}
        </h2>
  
        {step === 1 && (
          <ElegirAreas
            catalogo={areasCatalogo.data}
            seleccionadas={areasSeleccionadas}
            setSeleccionadas={setAreasSeleccionadas}
            setNivelesPorArea={setNivelesPorArea}
          />
        )}
  
        {step === 2 && (
          <ElegirNiveles
            areas={areasSeleccionadas}
            nivelesCatalogo={nivelesCatalogo.data}
            nivelesPorArea={nivelesPorArea}
            setNivelesPorArea={setNivelesPorArea}
          />
        )}
      </div>
  
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
            disabled={areasSeleccionadas.length === 0}
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            Siguiente
          </button>
        )}
  
        {step === 2 && (
          <button
            onClick={handleGuardarConfiguracion}
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
  
      {/* {error && <p className="text-red-600">{error}</p>} */}
    </div>
  </div>
  
  );
};

export default ConfOlimpiada
