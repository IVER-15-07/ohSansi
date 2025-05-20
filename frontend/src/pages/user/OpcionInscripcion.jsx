import React, { useState } from 'react';

function OpcionInscripcion({ opcionesInscripcion, handleOpcionInscripcion, maxAreas }) {
  const [selecciones, setSelecciones] = useState([]);
  const [cantidadAreas, setCantidadAreas] = useState(0);

  const agregarArea = () => {
    setSelecciones((prev) => [
      ...prev,
      { areaId: '', opcionInscripcionId: '' }, // Nueva selección vacía
    ]);
    setCantidadAreas((prev) => prev + 1);
    if (cantidadAreas + 1 >= maxAreas) {
      alert(`Has alcanzado el máximo de ${maxAreas} áreas.`);
    }
  };

  const actualizarSeleccion = (index, campo, valor) => {
    const nuevasSelecciones = [...selecciones];
    nuevasSelecciones[index][campo] = valor;
    setSelecciones(nuevasSelecciones);
    handleOpcionInscripcion(nuevasSelecciones); // Notificar al padre
  };

  const eliminarSeleccion = (index) => {
    setCantidadAreas((prev) => prev - 1); 
    const nuevasSelecciones = selecciones.filter((_, i) => i !== index);
    setSelecciones(nuevasSelecciones);
    handleOpcionInscripcion(nuevasSelecciones); // Notificar al padre
  };

  const obtenerAreasDisponibles = (seleccionActual) => {
    const areasSeleccionadas = selecciones.map((s) => s.areaId).filter((id) => id !== seleccionActual);
    return Object.keys(opcionesInscripcion).filter((areaId) => !areasSeleccionadas.includes(areaId));
  };

  console.log("Catalogo", opcionesInscripcion);
  console.log("Selecciones", selecciones);
  return (
    <div className="space-y-6">
      {selecciones.map((seleccion, index) => (
        <div key={index} className="flex flex-col md:flex-row items-center gap-4">
          {/* Selección de área */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área
            </label>
            <select
              value={seleccion.areaId}
              onChange={(e) =>
                actualizarSeleccion(index, 'areaId', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un área</option>
              {obtenerAreasDisponibles(seleccion.areaId).map((areaId) => (
                <option key={opcionesInscripcion[areaId].id} value={areaId}>
                  {opcionesInscripcion[areaId].nombre || `Área ${opcionesInscripcion[areaId].id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de nivel/categoría */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel/Categoría
            </label>
            <select
              value={seleccion.OpcionInscripcionId}
              onChange={(e) =>
                actualizarSeleccion(index, 'opcionInscripcionId', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!seleccion.areaId} // Deshabilitar si no se seleccionó un área
            >
              <option value="">Seleccione un nivel/categoría</option>
              {seleccion.areaId &&
                opcionesInscripcion[seleccion.areaId].niveles_categorias.map((nivelCategoria) => (
                  <option key={nivelCategoria.id} value={nivelCategoria.id_opcion_inscripcion}>
                    {nivelCategoria.nombre}
                  </option>
                ))}
            </select>
          </div>

          {/* Botón para eliminar selección */}
          <button
            type="button"
            onClick={() => eliminarSeleccion(index)}
            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      ))}

      {/* Botón para agregar más áreas */}
      <button
        type="button"
        onClick={agregarArea}
        className={`px-4 py-2 ${cantidadAreas>= maxAreas ? `bg-gray-400` : `bg-green-600 text-white rounded-md hover:bg-green-700`}`}
        disabled={cantidadAreas >= maxAreas} // Deshabilitar si se alcanzó el máximo
      >
        Agregar Área
      </button>
    </div>
  );
}

export default OpcionInscripcion;