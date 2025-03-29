import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import OlympiadAreas from './OlympiadAreas'




const Olympiad = () => {

    const [olympiad, setCreate] = useState()

    const Rendercreate = () => {
        if (olympiad === 'CREAR') {
            return <OlympiadAreas />
        }
    }

    return (
        <div className="flex flex-col w-full h-screen p-4">
        {/* Primera lista */}
        <div className="border rounded-lg p-4 shadow-sm flex-1">
          <h2 className="text-lg font-bold">Lista de olimpiadas</h2>
          <div className="bg-blue-200 p-2 rounded-lg flex justify-between items-center mt-2">
            <span className="font-medium">olimpiada científica 2</span>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-1">configurar</button>
              <button className="bg-blue-700 text-white px-3 py-1">iniciar</button>
              <button className="bg-red-500 text-white px-3 py-1">eliminar</button>
            </div>
          </div>
          <button className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg">
            Agregar olimpiada
          </button>
        </div>
  
        {/* Segunda lista */}
        <div className="border rounded-lg p-4 shadow-sm flex-1 mt-4">
          <h2 className="text-lg font-bold">Lista de olimpiadas</h2>
          <p className="text-gray-400 text-sm mt-1">
            el espacio vacío es tan aburrido, intenta agregar una nueva olimpiada...
          </p>
          <div className="mt-2 space-y-1">
            {Rendercreate()}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

export default Olympiad
