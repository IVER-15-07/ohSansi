import React from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'


const LayoutRegistro = () => {
  const [currentStep, setCurrentStep] = useState(1); // Estado para controlar el paso actual
  const navigate = useNavigate();
  const { idEncargado, idOlimpiada } = useParams(); // Obtener ambos IDs desde la URL


  const steps = [

    { id: 1, label: 'Paso 1: registro de postulante' },
    { id: 2, label: 'Paso 2: registro de una lista de postulantes' },
    { id: 3, label: 'Paso 3: Generar comprobante de pago' },
    { id: 4, label: 'Paso 4: verificar comprobante de pago ' },


  ];


  return (

    <div className="pt-22 flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">Navegación</h2>
        <ul className="space-y-4">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition ${currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              >
                {step.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Contenido dinámico */}
      <div className="flex-1 p-6">
      {currentStep === 1 && <RegistroPostulante idEncargado={idEncargado} idOlimpiada={idOlimpiada} />}
        {currentStep === 2 && <RegistrarListaPostulantes idEncargado={idEncargado} idOlimpiada={idOlimpiada} />}
        {currentStep === 3 && <OrdenDePago idEncargado={idEncargado} idOlimpiada={idOlimpiada} />}
        {currentStep === 4 && <ValidarComprobante idEncargado={idEncargado} idOlimpiada={idOlimpiada} />}

      </div>
    </div>
  );

}

export default LayoutRegistro
