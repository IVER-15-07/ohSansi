import React from 'react'

const Divisiones = ({prevStep, nextStep}) => {
  return (
    <div>
      <h2>Divisiones</h2>
      <button onClick={prevStep} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
        Anterior
      </button>
      <button onClick={nextStep} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Siguiente
      </button>
    </div>
  )
}

export default Divisiones
