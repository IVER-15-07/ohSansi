import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAreas, createArea } from '../../../service/areas.api';
import Cargando from '../Cargando';
import Error from '../Error';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';

const Areas = () => {
  const queryClient = useQueryClient();

  const { data: areas, isLoading, error: errorAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
    staleTime: 6000,
  });

  const [newArea, setNewArea] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (isLoading) return <Cargando />;
  if (errorAreas) return <Error error={errorAreas} />;

  // Normalizar string para comparaciones: quitar acentos y convertir a mayúsculas
  const normalizeString = (str) => {
    return str
      .normalize("NFD") // Descompone caracteres con acentos
      .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
      .toUpperCase(); // Convierte a mayúsculas para comparaciones
  };

  // Validar si un texto contiene solo caracteres permitidos: letras (con tildes), números y espacios
  const contieneSoloPermitidos = (str) => {
    // Verificamos que solo contenga caracteres permitidos (letras con tildes, números y espacios)
    return /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9\s]+$/.test(str);
  };

  // Manejar cambio de texto en el input
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Limitar a 50 caracteres reales (corregido code units)
    const area_input = Array.from(value);
    if (area_input.length > 50) {
      const valorSeguro = area_input.slice(0,50).join('');
      setNewArea(valorSeguro.toUpperCase());
      return;
    }
    
    // Convertir a mayúsculas automáticamente, pero manteniendo las tildes
    const upperCaseValue = value.toUpperCase();
    
    // Validar si contiene caracteres no permitidos
    if (value && !contieneSoloPermitidos(upperCaseValue)) {
      setErrorMessage('El nombre del área solo puede contener letras, números y espacios.');
    } else {
      setErrorMessage('');
    }
    
    setNewArea(upperCaseValue);
  };

  // Validar antes de mostrar el modal de confirmación
  const handleShowModal = () => {
    if (newArea.trim() === '') {
      setErrorMessage('El campo de nombre del área es obligatorio.');
      return;
    }

    if (Array.from(newArea).length > 50) {
      setErrorMessage('El nombre del área no puede exceder los 50 caracteres.');
      return;
    }


    // Normalizar el nombre antes de comparar
    const normalizedNewArea = normalizeString(newArea.trim());

    const nombreExiste = areas.data.some(
      (area) => normalizeString(area.nombre) === normalizedNewArea
    );

    if (nombreExiste) {
      setErrorMessage('El nombre del área ya existe en el catálogo.');
      return;
    }

    // Si pasa todas las validaciones, mostrar el modal de confirmación
    setIsModalOpen(true);
  };

  const handleAddArea = async () => {
    setIsAdding(true);
    try {
      const nombreArea = newArea.trim(); // elimina espacios en blanco 
      const nuevaArea = await createArea({ nombre: nombreArea });
      setNewArea('');
      setErrorMessage('');
      queryClient.setQueryData(['areas'], (oldData) => ({
        ...oldData,
        data: [...oldData.data, nuevaArea.data],
      }));
      queryClient.invalidateQueries(['areas']);
      setSuccessMessage('Área creada exitosamente.');
    } catch (error) {
      // Mostrar mensaje de duplicado si viene del backend
      if (error.response && error.response.data && error.response.data.errors && error.response.data.errors.nombre) {
        setErrorMessage(error.response.data.errors.nombre[0]);
      } else if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Hubo un error al agregar el área. Inténtalo nuevamente.');
      }
      console.error('Error al agregar el área:', error);
    } finally {
      setIsAdding(false);
      setIsModalOpen(false);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del área (máx. 50 caracteres)</label>
            <input
              type="text"
              placeholder="INGRESE EL NOMBRE DEL ÁREA"
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newArea}
              onChange={handleInputChange}
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !errorMessage && newArea.trim() !== '') handleShowModal();
              }}
            />
            {errorMessage && <p className="text-red-600 text-sm mt-1">{errorMessage}</p>}
            <p className="text-gray-500 text-sm mt-1">{Array.from(newArea).length}/50 caracteres</p>
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
                
                handleAddArea();
                setIsModalOpen(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Agregar Área
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddArea}
        title="Confirmar acción"
        message={`¿Estás seguro de que deseas agregar el área ${newArea}?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        isLoading={isAdding}
        confirmButtonColor="blue"
      />
      
      {/* Modal de Éxito */}
      {successMessage && (
        <Modal 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
      )}
    </div>
  )
}

export default Areas
