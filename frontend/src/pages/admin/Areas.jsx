import React from 'react'
import {getAreas} from '../../../service/areas.api'

import { useState, useEffect } from 'react'

const Areas = () => {

  const [areas, setAreas] = useState([]);
  const [newArea, setNewArea] = useState("");


  useEffect(() => {
    const areas = getAreas();
    areas.then((response) => {
      setAreas(response.data);
    }).catch((error) => {
      console.error("Error fetching areas:", error);
    });
  }, []);


    
  const handleAddArea = () => {
    if (newArea.trim() !== "") {
      setAreas([...areas, { name: newArea }]);
      setNewArea("");
    }
  };

  const handleRemoveArea = (index) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  return (

    <div className="p-6 flex flex-col gap-6 w-full h-full bg-gray-50">
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col gap-6">
      
      {/* Sección: Lista de Áreas */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Áreas</h2>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[300px] min-h-[300px] pr-2">
          {areas.map((area, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-4 bg-gradient-to-r from-gray-100 to-gray-50 p-4 rounded-xl shadow hover:shadow-lg transition-all"
            >
              <span className="text-gray-800 font-medium">{area.nombre}</span>
              <button
                onClick={() => handleRemoveArea(index)}
                className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
  
      {/* Sección: Agregar Área */}
      <div className="pt-4 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar área de competencia</h2>
  
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
  
          <div className="flex justify-start">
            <button
              onClick={handleAddArea}
              className="bg-blue-900 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition"
            >
              Agregar área
            </button>
          </div>
        </div>
      </div>
  
    </div>
  </div>
  


  )
}

export default Areas
