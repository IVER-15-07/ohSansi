import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'


const LayoutRegistro = () => {
    const [currentStep, setCurrentStep] = useState(1); // Estado para controlar el paso actual
    const navigate = useNavigate();
  
    const steps = [
      
      { id: 1, label: 'Paso 1: registro de postulante' },
      { id: 2, label: 'Paso 2: registro de una lista de postulantes' },
      { id: 3, label: 'Paso 3: Generar comprobante de pago' },
      { id: 4, label: 'Paso 4: verificar comprobante de pago ' },
    

    ];
  

  return (
    
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 border-r border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-4">Navegación</h2>
        <ul className="space-y-4">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition ${
                  currentStep === step.id
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
        {currentStep === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Paso 1: Información Personal</h1>
            <p>Contenido relacionado con la información personal.</p>
          </div>
        )}
        {currentStep === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Paso 2: Información Académica</h1>
            <p>Contenido relacionado con la información académica.</p>
          </div>
        )}
        {currentStep === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Paso 3: Confirmación</h1>
            <p>Contenido relacionado con la confirmación de los datos.</p>
            <button
              onClick={() => navigate('/finalizar')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Finalizar Registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
}

export default LayoutRegistro
