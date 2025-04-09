import React from 'react'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAreas } from '../../../service/areas.api';
import { getNivelesCategorias } from '../../../service/niveles_categorias.api';
import { createConfiguracion } from '../../../service/configuraciones.api';
import { useParams } from 'react-router-dom';
import { Loader2, Plus, X } from 'lucide-react';
import Cargando from '../Cargando';
import Error from '../Error';

const ConfOlimpiada = () => {
  const queryClient = useQueryClient();

  const {data: areasDisponibles, isLoading: isLoadingAreasDisponibles, error: errorAreasDisponibles} = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });
  
  const {data: nivelesDisponibles, isLoading: isLoadingNivelesDisponibles, error: errorNivelesDisponibles} = useQuery({
    queryKey: ['niveles_categorias'],
    queryFn: getNivelesCategorias,
  });

  const { id } = useParams();
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [areaActiva, setAreaActiva] = useState(null);
  const [nivelesPorArea, setNivelesPorArea] = useState({});
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

    
  if (isLoadingNivelesDisponibles || isLoadingAreasDisponibles) return <Cargando/>;
  if (errorNivelesDisponibles) return <Error error ={errorNivelesDisponibles}/>;
  if (errorAreasDisponibles) return <Error error ={errorAreasDisponibles}/>;

  const handleSeleccionarArea = (area) => setAreaActiva(area.id);

  const handleAniadirArea = (area) => {

    setAreasSeleccionadas([...areasSeleccionadas, area]);

    setAreasDisponibles(areasDisponibles.data.filter((a) => a.id !== area.id));

    setNivelesPorArea({ ...nivelesPorArea, [area.id]: [] });

    if (!areaActiva) setAreaActiva(area.id);
  };

  const handleQuitarArea = (area) => {

    setAreasSeleccionadas(areasSeleccionadas.filter((a) => a.id !== area.id));

    setAreasDisponibles([...areasDisponibles, area]);

    const nuevosNiveles = { ...nivelesPorArea };

    delete nuevosNiveles[area.id];

    setNivelesPorArea(nuevosNiveles);
    if (areaActiva === area.id) {

      const nuevasAreas = areasSeleccionadas.filter((a) => a.id !== area.id);

      setAreaActiva(nuevasAreas.length > 0 ? nuevasAreas[0].id : null);
    }
  };

  const handleAñadirNivel = (nivel) => {
    const actuales = nivelesPorArea[areaActiva] || [];
    if (!actuales.includes(nivel.nombre)) {
      setNivelesPorArea({
        ...nivelesPorArea,
        [areaActiva]: [...actuales, nivel.nombre],
      });
    }
  };

  const handleQuitarNivel = (nivel) => {
    setNivelesPorArea({
      ...nivelesPorArea,
      [areaActiva]: nivelesPorArea[areaActiva].filter((n) => n !== nivel.nombre),
    });
  };

  const handleGuardarConfiguracion = async () => {
    setIsAdding(true);
    try {
      const configuraciones = [];
      areasSeleccionadas.forEach((area) => {
        const niveles = nivelesPorArea[area.id] || [];
        niveles.forEach((nivelNombre) => {
          configuraciones.push({
            id_olimpiada: id,
            id_area: area.id,
            id_nivel_categoria: nivelesDisponibles.data.find((n) => n.nombre === nivelNombre)?.id,
          });
        });
      });
      await Promise.all(configuraciones.map((config) => createConfiguracion(config)));
      alert('Configuraciones guardadas exitosamente.');
    } catch (error) {
      console.error(error);
      setError('Error al guardar configuraciones. Intenta nuevamente.');
    }finally{
      setIsAdding(false);
    }
  };

  const areaActivaObj = areasSeleccionadas.find((a) => a.id === areaActiva);
  
  console.log(areasSeleccionadas);
  console.log(nivelesPorArea);
  console.log(areaActiva);
  return (
    <div className="p-2 w-full h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
      
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 h-full">
        <h2 className="text-xl font-bold text-gray-800">Configuración de la Olimpiada {id}</h2>

        <div className="flex gap-4 flex-1 overflow-hidden">

          {/* Áreas disponibles */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-4">

            <h3 className="font-semibold text-gray-600 mb-2">Áreas disponibles</h3>
            <div className="flex flex-wrap gap-2">

              {areasDisponibles.data.map((area) => (
                <div key={area.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">

                  <span>{area.nombre}</span>

                  <button
                    onClick={() => handleAniadirArea(area)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm"
                  >
                    Añadir
                  </button>

                </div>
              ))}
            </div>
          </div>

          {/* Áreas seleccionadas */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-600 mb-2">Áreas seleccionadas</h3>

            <div className="flex flex-wrap gap-2">
              {areasSeleccionadas.map((area) => (
                <div key={area.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                  <span>{area.nombre}</span>
                  <button
                    onClick={() => handleQuitarArea(area)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

      {/* Carrusel de áreas seleccionadas activas */}
      <div className="mt-2 overflow-x-auto whitespace-nowrap flex gap-2 pb-2">

        {areasSeleccionadas.map((area) => (

          <button
            key={area.id}
            className={`px-4 py-1 rounded-full text-sm font-medium transition whitespace-nowrap ${
              areaActiva === area.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => handleSeleccionarArea(area)}
          >
            {area.nombre}
          </button>
        ))}
      </div>

      {/* Configuración de niveles */}
      {areaActivaObj && (
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Niveles disponibles */}
          <div className="flex-1 rounded-2xl border border-gray-200 p-4 overflow-y-auto h-full">
            <h3 className="font-semibold text-gray-600 mb-2">Niveles disponibles</h3>
            <div className="flex flex-wrap gap-2">
              {nivelesDisponibles.data.map((nivel) => (
                <div key={nivel.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                  <span>{nivel.nombre}</span>
                  <button
                    onClick={() => handleAñadirNivel(nivel)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md text-sm"
                  >
                    Añadir
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Niveles seleccionados */}
          <div className="flex-1 rounded-2xl border border-gray-200 p-4 overflow-y-auto h-full">

            <h3 className="font-semibold text-gray-600 mb-2">
              Niveles de {areaActivaObj.nombre}
            </h3>
            <div className="flex flex-wrap gap-2">
              {nivelesPorArea[areaActiva]?.map((nivel) => (
                <div key={nivel} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                  <span>{nivel}</span>
                  <button
                    onClick={() => handleQuitarNivel({ nombre: nivel })}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* Botón para guardar configuraciones */}
      <div className="flex justify-end gap-4 mt-4">

        {error && <p className="text-red-600">{error}</p>}

        <button
          onClick={handleGuardarConfiguracion}
          disabled={isAdding} // Desactiva el botón mientras se está cargando
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${
            isAdding
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-800 transition"
            }`}
        >
          {isAdding ? "Cargando..." : "Guardar Configuración"}

        </button>
      </div>
    </div>
  </div>
  )
}

export default ConfOlimpiada
