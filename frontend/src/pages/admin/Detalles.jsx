import React from 'react'

const Detalles = ({prevStep,onFinish}) => {
  return (
    <div>
      <h2>Detalles</h2>
      <button onClick={prevStep} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
        Anterior
      </button>
      <button onClick={onFinish} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
        Finalizar
      </button>
    </div>
  )
}

export default Detalles
