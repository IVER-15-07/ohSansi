import React from 'react'
import { useState, useEffect } from 'react'
import { getAreas } from '../../../service/areas.api';
import { getNivelesCategorias } from '../../../service/niveles_categorias.api';

const ConfOlimpiada = () => {
  const [areasDisponibles, setAreasDisponibles] = useState([]); // Inicializa como array vacío
  const [nivelesDisponibles, setNivelesDisponibles] = useState([]); // Inicializa como array vacío
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([]);
  const [areaActiva, setAreaActiva] = useState(null);
  const [nivelesPorArea, setNivelesPorArea] = useState({});

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar áreas desde la API
        const areasResponse = await getAreas();
        setAreasDisponibles(areasResponse.data || []); // Asegúrate de que sea un array

        // Cargar niveles/categorías desde la API
        const nivelesResponse = await getNivelesCategorias();
        setNivelesDisponibles(nivelesResponse.data || []); // Asegúrate de que sea un array
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, []);

  const handleSeleccionarArea = (area) => {
    setAreaActiva(area);
  };

  const handleAñadirArea = (area) => {
    setAreasSeleccionadas([...areasSeleccionadas, area]);
    setAreasDisponibles(areasDisponibles.filter((a) => a.id !== area.id));
    setNivelesPorArea({ ...nivelesPorArea, [area.nombre]: [] });
    if (!areaActiva) setAreaActiva(area.nombre);
  };

  const handleQuitarArea = (area) => {
    setAreasSeleccionadas(areasSeleccionadas.filter((a) => a.id !== area.id));
    setAreasDisponibles([...areasDisponibles, area]);
    const nuevosNiveles = { ...nivelesPorArea };
    delete nuevosNiveles[area.nombre];
    setNivelesPorArea(nuevosNiveles);
    if (areaActiva === area.nombre) {
      setAreaActiva(areasSeleccionadas.length > 1 ? areasSeleccionadas[0].nombre : null);
    }
  };

  const handleAñadirNivel = (nivel) => {
    const nivelesActuales = nivelesPorArea[areaActiva] || [];
    if (!nivelesActuales.includes(nivel.nombre)) {
      setNivelesPorArea({
        ...nivelesPorArea,
        [areaActiva]: [...nivelesActuales, nivel.nombre],
      });
    }
  };

  const handleQuitarNivel = (nivel) => {
    setNivelesPorArea({
      ...nivelesPorArea,
      [areaActiva]: nivelesPorArea[areaActiva].filter((n) => n !== nivel.nombre),
    });
  };

  return (
    <div className="p-2 w-full h-full bg-gray-50 overflow-hidden">
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 h-full">
      <h2 className="text-xl font-bold text-gray-800">Áreas y Niveles</h2>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Áreas disponibles */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-600 mb-2">Áreas disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {areasDisponibles.map((area) => (
              <div key={area.id} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                <span>{area.nombre}</span>
                <button
                  onClick={() => handleAñadirArea(area)}
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

      {/* Carrusel de selección de áreas activas */}
      <div className="mt-2 overflow-x-auto whitespace-nowrap flex gap-2 pb-2">
        {areasSeleccionadas.map((area) => (
          <button
            key={area.id}
            className={`px-4 py-1 rounded-full text-sm font-medium transition whitespace-nowrap ${
              areaActiva === area.nombre
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => handleSeleccionarArea(area.nombre)}
          >
            {area.nombre}
          </button>
        ))}
      </div>

      {/* Configuración de niveles */}
      {areaActiva && (
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Niveles disponibles */}
          <div className="flex-1 rounded-2xl border border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-600 mb-2">Niveles disponibles</h3>
            <div className="flex flex-wrap gap-2">
              {nivelesDisponibles.map((nivel) => (
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
          <div className="flex-1 rounded-2xl border border-gray-200 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-600 mb-2">Niveles de {areaActiva}</h3>
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
    </div>
  </div>
  )
}

export default ConfOlimpiada
