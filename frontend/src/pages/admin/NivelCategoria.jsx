import React from 'react'
import { useState } from 'react'

const NivelCategoria = () => {

  const [isNivel, setIsNivel] = useState(true);
  return (
    <div className="p-6 flex flex-col gap-6 w-full h-full min-h-[665px] max-h-[800px] bg-gray-50">
    {/* Vista previa de niveles y categorías */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 min-h-[340px]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Niveles y Categorías</h1>
  
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Nivel</h2>
          <p className="text-gray-600">Hola, somos nivel</p>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Categoría</h2>
          <p className="text-gray-600">Hola, somos categoría</p>
        </div>
      </div>
    </div>
  
    {/* Formulario */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 pt-3 min-h-[280px]">
      {/* Switch buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            isNivel
              ? 'bg-blue-900 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setIsNivel(true)}
        >
          Nivel
        </button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            !isNivel
              ? 'bg-blue-900 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setIsNivel(false)}
        >
          Categoría
        </button>
      </div>
  
      {/* Formulario dinámico */}
      {isNivel ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del nivel
            </label>
            <input
              type="text"
              placeholder="Ingrese el nombre del nivel"
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grado
            </label>
            <select className="w-full p-2 border rounded-md text-gray-800 bg-gray-100">
              <option>1ro de secundaria</option>
              <option>2do de secundaria</option>
              <option>3ro de secundaria</option>
              <option>4to de secundaria</option>
              <option>5to de secundaria</option>
              <option>6to de secundaria</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la categoría
            </label>
            <input
              type="text"
              placeholder="Ingrese el nombre de la categoría"
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel inicial
              </label>
              <select className="w-full p-2 border rounded-md text-gray-800 bg-gray-100">
                <option>1ro de secundaria</option>
                <option>2do de secundaria</option>
                <option>3ro de secundaria</option>
                <option>4to de secundaria</option>
                <option>5to de secundaria</option>
                <option>6to de secundaria</option>
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel final
              </label>
              <select className="w-full p-2 border rounded-md text-gray-800 bg-gray-100">
                <option>1ro de secundaria</option>
                <option>2do de secundaria</option>
                <option>3ro de secundaria</option>
                <option>4to de secundaria</option>
                <option>5to de secundaria</option>
                <option>6to de secundaria</option>
              </select>
            </div>
          </div>
        </div>
      )}
  
      <div className="flex justify-center mt-6">
        <button className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
          {isNivel ? 'Agregar nivel' : 'Agregar categoría'}
        </button>
      </div>
    </div>
  </div>
  
  
  )
}

export default NivelCategoria
