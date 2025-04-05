import React from 'react'
import { useState } from 'react'

const Datosgenerales = () => {
  const [urlMapa, setUrlMapa] = useState(''); // Estado para la URL del mapa
 

  return (
<div className="w-full px-6 py-4 bg-gray-50 rounded-xl">
  <h2 className="text-2xl font-bold text-gray-700 mb-4">Datos generales de la Olimpiada</h2>

  <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-white p-6 rounded-2xl shadow border border-gray-200">
    
    {/* Nombre de la olimpiada */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-600 mb-1">Nombre de la olimpiada</label>
      <input 
        type="text" 
        placeholder="Ingrese el nombre de la olimpiada" 
        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Fechas de la olimpiada */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de inicio</label>
      <input 
        type="date" 
        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de finalización</label>
      <input 
        type="date" 
        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Fechas de inscripción */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de inicio de inscripción</label>
      <input 
        type="date" 
        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de fin de inscripción</label>
      <input 
        type="date" 
        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Costo */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">Costo de la Olimpiada</label>
      <input 
        type="number" 
        placeholder="00.00 Bs." 
        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Modalidad */}
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">Modalidad</label>
      <div className="flex flex-col gap-1 border p-3 rounded-lg bg-gray-50">
        {["Presencial", "Virtual", "Híbrida"].map((mod, i) => (
          <label key={i} className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" className="form-checkbox" />
            <span>{mod}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Descripción */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
      <textarea 
        placeholder="Inserte descripción de la olimpiada" 
        className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
      />
    </div>

    {/* Ubicación y Mapa */}
    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Ubicación</label>
        <input
          type="text"
          value={urlMapa}
          onChange={(e) => setUrlMapa(e.target.value)}
          placeholder="Ingrese ubicación"
          className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
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
