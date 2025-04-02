import React from 'react'

const Datosgenerales = ({nextStep}) => {
  return (
    <div>

<div>
      <h2>Datos Generales</h2>
      <button onClick={nextStep} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Siguiente
      </button>
    </div>
      
    </div>
  )
}

export default Datosgenerales
