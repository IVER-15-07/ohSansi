import React from 'react'
import { useState } from 'react'
import CrearOlimpiada from './CrearOlimpiada'


const Olympiad = () => {

  const [AgregarOlimpiada, setAgregarOlimpiada] = useState(false)

  return (
    <div className="p-4 pt-2">
    {AgregarOlimpiada ? (
      <CrearOlimpiada onBack={() => setAgregarOlimpiada(false)} />
    ) : (
      <>
        <h1 className="text-2xl font-bold mb-4">Lista de Olimpiadas</h1>
        <p>Aquí se mostrarán las olimpiadas creadas...</p>
        <button
          onClick={() => setAgregarOlimpiada(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Crear Olimpiada
        </button>
      </>
    )}
  </div>
  )
}

export default Olympiad
