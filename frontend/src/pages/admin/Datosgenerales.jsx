import React from 'react'
import { useState } from 'react'

const Datosgenerales = () => {
  const [urlMapa, setUrlMapa] = useState(''); // Estado para la URL del mapa
 

  return (
    <div className="p-0 ">
    <h2 className="text-2xl font-bold mb-6 text-gray-700">Datos generales de la Olimpiada</h2>
    
    <form className="grid grid-cols-2 gap-6">
      {/* Nombre de la olimpiada */}
      <div className="col-span-2">
        <label className="block text-gray-600 text-sm mb-2">Nombre de la olimpiada</label>
        <input 
          type="text" 
          placeholder="Ingrese el nombre de la olimpiada" 
          className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
        />
      </div>
      
      {/* Fechas */}
      <div>
        <label className="block text-gray-600 text-sm mb-2">Fecha inicio</label>
        <input 
          type="date" 
          className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
        />
      </div>
      <div>
        <label className="block text-gray-600 text-sm mb-2">Fecha fin</label>
        <input 
          type="date" 
          className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
        />
      </div>
      
      {/* Costo */}
      <div>
        <label className="block text-gray-600 text-sm mb-2">Costo de la Olimpiada</label>
        <input 
          type="number" 
          placeholder="00.00 Bs." 
          className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
        />
      </div>
      
      {/* Modalidad */}
      <div>
        <label className="block text-gray-600 text-sm mb-2">Modalidad</label>
        <div className="flex flex-col space-y-1">
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
        <label className="block text-gray-600 text-sm mb-2">Descripción</label>
        <textarea 
          placeholder="Inserte descripción de la olimpiada" 
          className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
        />
      </div>
      
      {/* Ubicación */}

      <div className="col-span-2">
          <label className="block text-gray-600 text-sm mb-2">URL del Mapa</label>
          <input
            type="text"
            value={urlMapa}
            onChange={(e) => setUrlMapa(e.target.value)}
            placeholder="https://www.google.com/maps?q=latitud,longitud"
            className="w-full p-2 border rounded-lg border-gray-300 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Botón para copiar la URL */}
        <div className="col-span-2">
          <button
            type="button"
            onClick={() => alert(`URL copiada: ${urlMapa}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Copiar URL
          </button>
        </div>
    </form>
    </div>
  )
}


export default Datosgenerales
