import React, { useState } from 'react';

function OpcionInscripcion({ opcionesInscripcion, handleOpcionInscripcion }) {
  const [selecciones, setSelecciones] = useState([]);

  const agregarArea = () => {
    setSelecciones((prev) => [
      ...prev,
      { areaId: '', nivelCategoriaId: '' }, // Nueva selección vacía
    ]);
  };

  const actualizarSeleccion = (index, campo, valor) => {
    const nuevasSelecciones = [...selecciones];
    nuevasSelecciones[index][campo] = valor;
    setSelecciones(nuevasSelecciones);
    handleOpcionInscripcion(nuevasSelecciones); // Notificar al padre
  };

  const eliminarSeleccion = (index) => {
    const nuevasSelecciones = selecciones.filter((_, i) => i !== index);
    setSelecciones(nuevasSelecciones);
    handleOpcionInscripcion(nuevasSelecciones); // Notificar al padre
  };

  console.log("Claves de opcionesInscripcion:", opcionesInscripcion[0]);
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
              {Object.keys(opcionesInscripcion).map((areaId) => (
                <option key={opcionesInscripcion[areaId].id} value={opcionesInscripcion[areaId].id}>
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
              value={seleccion.nivelCategoriaId}
              onChange={(e) =>
                actualizarSeleccion(index, 'nivelCategoriaId', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!seleccion.areaId} // Deshabilitar si no se seleccionó un área
            >
              <option value="">Seleccione un nivel/categoría</option>
              {seleccion.areaId &&
                opcionesInscripcion[seleccion.areaId].map((nivelCategoria) => (
                  <option key={nivelCategoria.id} value={nivelCategoria.id}>
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
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Agregar Área
      </button>
    </div>
  );
}

export default OpcionInscripcion;