import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAreas, createArea } from '../../../service/areas.api';
import Cargando from '../Cargando';
import Error from '../Error';

const Areas = () => {
  const queryClient = useQueryClient();

  const {data: areas, isLoading, error: errorAreas} = useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
  });

  const [newArea, setNewArea] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) return <Cargando/>;
  if (errorAreas) return <Error error ={errorAreas} />;

  const handleAddArea = async () => {
    if (newArea.trim() !== "") {
      setIsAdding(true); 
      try {
        const nuevaArea = await createArea({ nombre: newArea }); // Llama a la API para crear el área
        setNewArea(""); // Limpia el campo de entrada
        
        // Actualiza la caché de React Query inmediatamente
        queryClient.setQueryData(['areas'], (oldData) => {
          return {
            ...oldData,
            data: [...oldData.data, nuevaArea.data], // Agrega la nueva área a la lista existente
          };	
        });

        queryClient.invalidateQueries(['areas']); // Invalida la consulta para actualizar la lista
      } catch (error) {
        console.error("Error al agregar el área:", error);
        alert("Hubo un error al agregar el área. Inténtalo nuevamente.");
      } finally {
        setIsAdding(false); // Restablece el estado de carga
      }
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
          />
        </div>
  
        <div className="flex justify-center">
          <button
           onClick={handleAddArea}
           disabled={isAdding} // Desactiva el botón mientras se está cargando
           className={`px-5 py-2 rounded-md text-sm font-medium transition ${
             isAdding
               ? "bg-gray-400 text-gray-700 cursor-not-allowed"
               : "bg-blue-900 text-white hover:bg-blue-800"
           }`}
         >
           {isAdding ? "Cargando..." : "Agregar área"}
          </button>
        </div>
      </div>
    </div>
  </div>
  

  )
}

export default Areas
