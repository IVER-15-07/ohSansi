import React from 'react'
import { useState } from 'react'
import CrearOlimpiada from './CrearOlimpiada'
import { Plus, Settings, Play, Archive, Trash2 } from 'lucide-react'


const Olympiad = () => {

  const [AgregarOlimpiada, setAgregarOlimpiada] = useState(false)

  return (



<div className="p-6 flex flex-col gap-6 w-full min-h-screen bg-gray-50">
  {AgregarOlimpiada ? (
    <CrearOlimpiada onBack={() => setAgregarOlimpiada(false)} />
  ) : (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Lista de Olimpiadas</h1>

      {/* Olimpiadas Creadas */}
      <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Olimpiadas Creadas</h2>
          <button
            onClick={() => setAgregarOlimpiada(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} /> Agregar Olimpiada
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de olimpiada */}
          <div className="border border-gray-300 rounded-xl p-5 bg-gray-50 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-900">Olimpiada 2024</h3>
            <p className="text-sm text-gray-600 mt-1">Olimpiada STEM gestión 2024</p>

            <div className="flex justify-between items-center mt-5 gap-3 text-sm font-medium">
              <button className="flex items-center text-blue-600 hover:underline">
                <Settings size={16} className="mr-1" /> Configurar
              </button>
              <button className="flex items-center text-green-600 hover:underline">
                <Play size={16} className="mr-1" /> Iniciar
              </button>
              <button className="flex items-center text-gray-500 hover:underline">
                <Archive size={16} className="mr-1" /> Archivar
              </button>
            </div>
          </div>

          {/* Puedes duplicar la tarjeta aquí si hay más olimpiadas creadas */}
        </div>
      </section>

      {/* Olimpiadas Iniciadas */}
      <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Olimpiadas Iniciadas</h2>

        <div className="border border-gray-300 rounded-xl p-5 bg-gray-50 shadow-sm hover:shadow-md transition">
          <h3 className="text-lg font-bold text-gray-900">Olimpiada 2024</h3>
          <p className="text-sm text-gray-600 mt-1">Olimpiada STEM gestión 2024</p>

          <div className="flex justify-end mt-5">
            <button className="flex items-center text-red-600 hover:underline text-sm font-medium">
              <Trash2 size={16} className="mr-1" /> Cancelar
            </button>
          </div>
        </div>
      </section>
    </div>
  )}
</div>

  )
}

export default Olympiad
