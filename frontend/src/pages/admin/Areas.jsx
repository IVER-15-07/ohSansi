import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAreas, createArea } from '../../../service/areas.api';
import Cargando from '../Cargando';
import Error from '../Error';

const Areas = () => {
  const queryClient = useQueryClient();

  const { data: areas, isLoading, error: errorAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });

  const [newArea, setNewArea] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (isLoading) return <Cargando />;
  if (errorAreas) return <Error error={errorAreas} />;

  const normalizeString = (str) => {
    return str
      .normalize("NFD") // Descompone caracteres con acentos
      .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
      .toLowerCase(); // Convierte a minúsculas
  };

  const handleAddArea = async () => {
    if (newArea.trim() === '') {
      setErrorMessage('El campo de nombre del área es obligatorio.');
      return;
    }

    if (newArea.length > 50) {
      setErrorMessage('El nombre del área no puede exceder los 50 caracteres.');
      return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(newArea)) {
      setErrorMessage('El nombre del área solo puede contener letras, números y espacios.');
      return;
    }

    // Normalizar el nombre antes de comparar
    const normalizedNewArea = normalizeString(newArea);

    const nombreExiste = areas.data.some(
      (area) => normalizeString(area.nombre) === normalizedNewArea
    );

    if (nombreExiste) {
      setErrorMessage('El nombre del área ya existe en el catálogo.');
      return;
    }

    setIsAdding(true);
    try {
      const nuevaArea = await createArea({ nombre: newArea });
      setNewArea('');
      setErrorMessage('');
      queryClient.setQueryData(['areas'], (oldData) => ({
        ...oldData,
        data: [...oldData.data, nuevaArea.data],
      }));
      queryClient.invalidateQueries(['areas']);
      alert('Área creada exitosamente.');
    } catch (error) {
      console.error('Error al agregar el área:', error);
      setErrorMessage('Hubo un error al agregar el área. Inténtalo nuevamente.');
    } finally {
      setIsAdding(false);
    }
  };

  return (

    <div className="p-6 flex flex-col gap-4 w-full h-full min-h-[600px] max-h-[780px] bg-[#F9FAFB]">
      {/* Lista de Áreas */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 py-4 min-h-[400px] max-h-[360px]">
        <h1 className="text-2xl font-bold text-[#20335C] mb-4 text-center">Áreas creadas</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[300px] pr-1">
          {areas.data.map((area, index) => (
            <div
              key={index}
              className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]
            ${index % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}
            >
              <span className="text-[#20335C] font-medium">{area.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario Agregar Área */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 pt-4">
        <h2 className="text-xl font-bold text-[#20335C] mb-4 text-center">Agregar área de competencia</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del área</label>
            <input
              type="text"
              placeholder="Ingrese el nombre del área"
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddArea(); // Ejecuta al presionar Enter
              }}
            />
            {errorMessage && <p className="text-red-600 text-sm mt-1">{errorMessage}</p>}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                if (newArea.trim() === '') {
                  setErrorMessage('El campo de nombre del área es obligatorio.');
                  return;
                }
                if (newArea.length > 50) {
                  setErrorMessage('El nombre del área no puede exceder los 50 caracteres.');
                  return;
                }
                if (!/^[a-zA-Z0-9\s]+$/.test(newArea)) {
                  setErrorMessage('El nombre del área solo puede contener letras, números y espacios.');
                  return;
                }
                handleAddArea();
                setIsModalOpen(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-120">
            <h2 className="text-lg text-center font-bold text-gray-800 mb-4">Confirmar acción</h2>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas agregar el área <strong>{newArea}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsModalOpen(false)} // Cierra el modal
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleAddArea(); // Llama a la función para agregar el área
                  setIsModalOpen(false); // Cierra el modal
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Areas
