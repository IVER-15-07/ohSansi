import React from 'react'
import { useState } from 'react'

const Datosgenerales = () => {
  const [urlMapa, setUrlMapa] = useState(''); // Estado para la URL del mapa
 

  return (
    <div className="w-full px-3 py-2">
      <h2 className="text-2xl font-bold text-gray-700 ">Datos generales de la Olimpiada</h2>

      <form className="grid grid-cols-2 gap-x-8 gap-y-4 bg-white p-4 rounded-lg shadow-md">
        {/* Nombre de la olimpiada */}
        <div className="col-span-2">
          <label className="block text-gray-600 text-sm mb-1">Nombre de la olimpiada</label>
          <input 
            type="text" 
            placeholder="Ingrese el nombre de la olimpiada" 
            className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Fechas */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Fecha inicio</label>
          <input 
            type="date" 
            className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">Fecha fin</label>
          <input 
            type="date" 
            className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Costo */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Costo de la Olimpiada</label>
          <input 
            type="number" 
            placeholder="00.00 Bs." 
            className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Modalidad */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">Modalidad</label>
          <div className="flex flex-col space-y-1 border p-2 rounded-lg">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Presencial</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Virtual</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Híbrida</span>
            </label>
          </div>
        </div>

        {/* Descripción */}
        <div className="col-span-2">
          <label className="block text-gray-600 text-sm mb-1">Descripción</label>
          <textarea 
            placeholder="Inserte descripción de la olimpiada" 
            className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300 h-24"
          />
        </div>

        {/* Ubicación y Mapa */}
        <div className="col-span-2 grid grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Ubicación</label>
            <input
              type="text"
              value={urlMapa}
              onChange={(e) => setUrlMapa(e.target.value)}
              placeholder="Ingrese ubicación"
              className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Mapa (Imagen de referencia) */}
          <div className="h-32 border rounded-lg overflow-hidden">
            <img 
              src="https://via.placeholder.com/200x150" 
              alt="Mapa"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </form>
    </div>
  )
}


export default Datosgenerales
