import React from 'react'
import { useState } from 'react'
import CrearOlimpiada from './CrearOlimpiada'
import { Plus, Settings, Play, Archive, Trash2 } from 'lucide-react'


const Olympiad = () => {

  const [AgregarOlimpiada, setAgregarOlimpiada] = useState(false)

  return (





    <div className="p-4 pt-2">
      {AgregarOlimpiada ? (
        // Pantalla para crear una nueva olimpiada
        <CrearOlimpiada onBack={() => setAgregarOlimpiada(false)} />
      ) : (
        // Pantalla principal con la lista de olimpiadas
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Lista de Olimpiadas</h1>

          {/* Sección de Olimpiadas Creadas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Olimpiadas Creadas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded shadow">
                <h3 className="font-bold">Olimpiada 2024</h3>
                <p className="text-sm text-gray-600">Olimpiada STEM gestión 2024</p>
                <div className="flex justify-between mt-4">
                  <button className="flex items-center text-blue-500">
                    <Settings className="mr-2" size={16} /> Configurar
                  </button>
                  <button className="flex items-center text-green-500">
                    <Play className="mr-2" size={16} /> Iniciar
                  </button>
                  <button className="flex items-center text-gray-500">
                    <Archive className="mr-2" size={16} /> Archivar
                  </button>
                </div>
              </div>
              {/* Repetir tarjeta si es necesario */}
            </div>
          </div>

          {/* Sección de Olimpiadas Iniciadas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Olimpiadas Iniciadas</h2>
            <div className="border p-4 rounded shadow">
              <h3 className="font-bold">Olimpiada 2024</h3>
              <p className="text-sm text-gray-600">Olimpiada STEM gestión 2024</p>
              <div className="flex justify-end mt-4">
                <button className="flex items-center text-red-500">
                  <Trash2 className="mr-2" size={16} /> Cancelar
                </button>
              </div>
            </div>
          </div>

          {/* Botón para agregar una nueva olimpiada */}
          <button
            onClick={() => setAgregarOlimpiada(true)}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            <Plus className="mr-2" size={16} /> Agregar Olimpiada
          </button>
        </div>
      )}
    </div>



  )
}

export default Olympiad
