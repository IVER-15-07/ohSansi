import React from 'react'

import { useState } from 'react'

const Areas = () => {

  const [areas, setAreas] = useState([{ name: "Química" }]);
  const [newArea, setNewArea] = useState("");

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

    <div className="p-4 pt-2 flex flex-col gap-4 w-full h-full">
      <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4">

        
        <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Lista de Áreas</h2>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2 overflow-y-auto max-h-[300px] min-h-[300px]">
            {areas.map((area, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-4 bg-gradient-to-r from-gray-100 to-gray-50 p-4 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <span className="text-gray-800 font-semibold">{area.name}</span>
                <button
                  onClick={() => handleRemoveArea(index)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-300 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Agregar áreas de competencia</h2>

          <div>
            <label className="block text-gray-700 mb-1">Nombre del área</label>
            <input
              type="text"
              placeholder="Ingrese el nombre del área"
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddArea}
            className="mt-3 bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Agregar área
          </button>
        </div>

      </div>
    </div>


  )
}

export default Areas
