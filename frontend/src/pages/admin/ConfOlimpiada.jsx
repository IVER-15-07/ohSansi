import React from 'react'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAreas } from '../../../service/areas.api';
import { getNivelesCategorias } from '../../../service/niveles_categorias.api';
import { createConfiguracion, getAreasByOlimpiada, getMapOfOlimpiada, deleteConfigurationByOlimpiada} from '../../../service/configuraciones.api';
import { useParams } from 'react-router-dom';
import { Loader2, X } from "lucide-react";
import Cargando from '../Cargando';
import Error from '../Error';

const ConfOlimpiada = () => {
  const queryClient = useQueryClient()

  const {data: areasCatalogo, isLoading: isLoadingAreasCatalogo, error: errorAreasCatalogo} = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });
  
  const {data: nivelesCatalogo, isLoading: isLoadingNivelesCatalogo, error: errorNivelesCatalogo} = useQuery({
    queryKey: ['niveles_categorias'],
    queryFn: getNivelesCategorias,
  })

  const { id, nombreOlimpiada } = useParams()
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [nivelesDisponibles, setNivelesDisponibles] = useState([]);
  const [areasSeleccionadas, setAreasSeleccionadas] = useState([])
  const [areaActiva, setAreaActiva] = useState(null)
  const [nivelesPorArea, setNivelesPorArea] = useState({})
  const [error, setError] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedSummaryArea, setSelectedSummaryArea] = useState(null)
  const [selectedSummaryLevel, setSelectedSummaryLevel] = useState(null)  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const areasOlimpiada = await getAreasByOlimpiada(id);
        setAreasSeleccionadas(areasOlimpiada.data || []);

        const mapaOlimpiada = await getMapOfOlimpiada(id);
        setNivelesPorArea(mapaOlimpiada.data || {});
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los datos. Intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (areasCatalogo) {
      // Filtrar las áreas disponibles excluyendo las seleccionadas
      const disponibles = areasCatalogo.data.filter(
        (areaCatalogo) => !areasSeleccionadas.some((areaSeleccionada) => areaSeleccionada.id === areaCatalogo.id)
      );
      setAreasDisponibles(disponibles);
    }
  }, [areasCatalogo, areasSeleccionadas]);

  // Sincronizar niveles disponibles con el catálogo de niveles
  useEffect(() => {
    if (nivelesCatalogo) {
      setNivelesDisponibles(nivelesCatalogo.data); // Inicializa los niveles disponibles con el catálogo
    }
  }, [nivelesCatalogo]);

    
  if (isLoadingNivelesCatalogo || isLoadingAreasCatalogo || isLoading ) return <Cargando/>;
  if (errorNivelesCatalogo) return <Error error ={errorNivelesCatalogo}/>;
  if (errorAreasCatalogo) return <Error error ={errorAreasCatalogo}/>;

  const handleSeleccionarArea = (area) => setAreaActiva(area.id)

  const handleAniadirArea = (area) => {

    setAreasSeleccionadas([...areasSeleccionadas, area]);

    setAreasDisponibles(areasDisponibles.filter((a) => a.id !== area.id));

    setNivelesPorArea({ ...nivelesPorArea, [area.id]: [] });

    if (!areaActiva) setAreaActiva(area.id);
  };

  const handleQuitarArea = (area) => {
    setAreasSeleccionadas(areasSeleccionadas.filter((a) => a.id !== area.id))
    setAreasDisponibles([...areasDisponibles, area])
    const nuevosNiveles = { ...nivelesPorArea }
    delete nuevosNiveles[area.id]
    setNivelesPorArea(nuevosNiveles)
    if (areaActiva === area.id) {

      const nuevasAreas = areasSeleccionadas.filter((a) => a.id !== area.id)

      setAreaActiva(nuevasAreas.length > 0 ? nuevasAreas[0].id : null)
    }
  }

  const handleAñadirNivel = (nivel) => {
    const actuales = nivelesPorArea[areaActiva] || []
    if (!actuales.includes(nivel.nombre)) {
      setNivelesPorArea({
        ...nivelesPorArea,
        [areaActiva]: [...actuales, nivel],
      });
    }
  }

  const handleQuitarNivel = (nivel) => {
    setNivelesPorArea({
      ...nivelesPorArea,
      [areaActiva]: nivelesPorArea[areaActiva].filter((n) => n.nombre !== nivel.nombre),
    })
  }

  const handleContinue = () => {
    if (areasSeleccionadas.length === 0) {
      setError("Debes seleccionar al menos un área para continuar.")
      return
    }

    // Check if at least one area has levels assigned
    const hasLevels = Object.values(nivelesPorArea).some((levels) => levels.length > 0)
    if (!hasLevels) {
      setError("Debes asignar al menos un nivel a un área para continuar.")
      return
    }

    setError(null)
    setShowSummary(true)
    setSelectedSummaryArea(null)
    setSelectedSummaryLevel(null)
  }

  const handleGuardarConfiguracion = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmGuardar = async () => {
    setIsAdding(true)
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
          })
        })
      })
      await Promise.all(configuraciones.map((config) => createConfiguracion(config)))
      alert("Configuraciones guardadas exitosamente.")
      setShowConfirmModal(false)
    } catch (error) {
      console.error(error)
      setError("Error al guardar configuraciones. Intenta nuevamente.")
    } finally {
      setIsAdding(false)
    }
  }

  const handleCancelGuardar = () => {
    setShowConfirmModal(false)
  }

  if (isLoadingNivelesDisponibles || isLoadingAreasDisponibles) return <Cargando />
  if (errorNivelesDisponibles) return <Error error={errorNivelesDisponibles} />
  if (errorAreasDisponibles) return <Error error={errorAreasDisponibles} />

  const areaActivaObj = areasSeleccionadas.find((a) => a.id === areaActiva);
  return (
    <div className="p-2 w-full h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 flex flex-col gap-6 h-full">
      <h2 className="text-xl font-bold text-gray-800">Configuración de la Olimpiada {id}</h2>

        <div className="flex gap-4 flex-1 overflow-hidden">

          {/* Áreas disponibles */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 p-4">

            <h3 className="font-semibold text-gray-600 mb-2">Áreas disponibles</h3>
            <div className="flex flex-wrap gap-2">

              {areasDisponibles.map((area) => (
                <div key={`area-disponible-${area.id}`} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">

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
                <div key={`area-seleccionada-${area.id}`} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
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
                areaActiva === area.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
              {nivelesDisponibles.map((nivel) => (
                <div key={`nivel-diponible-${nivel.id}`} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
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

              <h3 className="font-semibold text-gray-600 mb-2">Niveles de {areaActivaObj.nombre}</h3>
              <div className="flex flex-wrap gap-2">
                {nivelesPorArea[areaActiva]?.map((nivel) => (
                <>
                {console.log(areaActiva)}
                  <div key={`${areaActiva}-${nivel.id}`} className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                    <span>{nivel.nombre}</span>
                    <button
                      onClick={() => handleQuitarNivel({ nombre: nivel.nombre })}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                </>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* Botón para guardar configuraciones */}
        <div className="flex justify-end gap-4 mt-4">
  
        {error && <p className="text-red-600">{error}</p>}
          <button
            onClick={handleContinue}
            className="px-5 py-2 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-800 transition"
          >
            Ver Resumen
          </button>
  
        <button
            onClick={handleGuardarConfiguracion}
            disabled={isAdding}
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

      {/* Sección de Resumen */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Resumen de Configuración</h2>
              <button onClick={() => setShowSummary(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lista de áreas */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Áreas Seleccionadas</h3>
                <div className="flex flex-col gap-2">
                  {areasSeleccionadas.map((area) => (
                    <button
                      key={area.id}
                      className={`p-2 rounded-md text-left ${
                        selectedSummaryArea?.id === area.id
                          ? "bg-blue-100 border border-blue-300"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedSummaryArea(area)
                        setSelectedSummaryLevel(null)
                      }}
                    >
                      {area.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niveles del área seleccionada */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  {selectedSummaryArea
                    ? `Niveles de ${selectedSummaryArea.nombre}`
                    : "Selecciona un área para ver sus niveles"}
                </h3>
                {selectedSummaryArea && (
                  <div className="flex flex-col gap-2">
                    {(nivelesPorArea[selectedSummaryArea.id] || []).length > 0 ? (
                      nivelesPorArea[selectedSummaryArea.id].map((nivelNombre) => {
                        const nivel = nivelesDisponibles.data.find((n) => n.nombre === nivelNombre)
                        return (
                          <button
                            key={nivel?.id || nivelNombre}
                            className={`p-2 rounded-md text-left ${
                              selectedSummaryLevel?.nombre === nivelNombre
                                ? "bg-blue-100 border border-blue-300"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                            onClick={() => {
                              setSelectedSummaryLevel(nivel || { nombre: nivelNombre })
                            }}
                          >
                            {nivelNombre}
                          </button>
                        )
                      })
                    ) : (
                      <p className="text-gray-500 italic">No hay niveles asignados a esta área</p>
                    )}
                  </div>
                )}
              </div>

              {/* Grados del nivel seleccionado */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  {selectedSummaryLevel
                    ? `Grados de ${selectedSummaryLevel.nombre}`
                    : "Selecciona un nivel para ver sus grados"}
                </h3>
                {selectedSummaryLevel && (
                  <div className="flex flex-col gap-2">
                    {/* Aquí deberías mostrar los grados asociados al nivel seleccionado */}
                    {/* Como no tenemos esa información en el código actual, mostramos un mensaje */}
                    <p className="text-gray-500 italic">
                      Los grados asociados a este nivel se mostrarán aquí. (Necesitarás implementar la lógica para
                      obtener y mostrar los grados)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Volver a Editar
              </button>
              <button
                onClick={handleGuardarConfiguracion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Confirmar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Configuración</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas guardar esta configuración para la olimpiada? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelGuardar}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmGuardar}
                disabled={isAdding}
                className={`px-4 py-2 rounded-md transition ${
                  isAdding ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isAdding ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </span>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfOlimpiada