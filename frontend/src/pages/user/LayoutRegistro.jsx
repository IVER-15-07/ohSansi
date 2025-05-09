import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import RegistrarPostulante from './RegistrarPostulante';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import RegistrarPostulante from './RegistrarPostulante';
import RegistrarListaPostulantes from './RegistrarListaPostulantes';
import OrdenDePago from './OrdenesDePago';
import ValidarComprobante from './ValidarComprobante';
import {
  UserPlus,
  ListChecks,
  FileText,
  FileCheck2
} from 'lucide-react';
import {
  UserPlus,
  ListChecks,
  FileText,
  FileCheck2
} from 'lucide-react';



const LayoutRegistro = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { idEncargado, idOlimpiada } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const { idEncargado, idOlimpiada } = useParams();

  const steps = [
    { id: 1, label: 'Registro de postulante', icon: <UserPlus className="w-4 h-4" /> },
    { id: 2, label: 'Registro de lista de postulantes', icon: <ListChecks className="w-4 h-4" /> },
    { id: 3, label: 'Generar comprobante de pago', icon: <FileText className="w-4 h-4" /> },
    { id: 4, label: 'Verificar comprobante de pago', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 1, label: 'Registro de postulante', icon: <UserPlus className="w-4 h-4" /> },
    { id: 2, label: 'Registro de lista de postulantes', icon: <ListChecks className="w-4 h-4" /> },
    { id: 3, label: 'Generar comprobante de pago', icon: <FileText className="w-4 h-4" /> },
    { id: 4, label: 'Verificar comprobante de pago', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (

    <div className="pt-22 flex min-h-screen bg-gray-100">
    {/* Sidebar */}
    <aside className="w-80 bg-white shadow-md p-5 border-r border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-blue-800">Navegación</h2>
      <nav className="space-y-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 
            ${currentStep === step.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-blue-50'
              }`}
          >
            {step.icon}
            {step.label}
          </button>
        ))}
      </nav>
    </aside>
    <div className="pt-22 flex min-h-screen bg-gray-100">
    {/* Sidebar */}
    <aside className="w-80 bg-white shadow-md p-5 border-r border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-blue-800">Navegación</h2>
      <nav className="space-y-2">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 
            ${currentStep === step.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-blue-50'
              }`}
          >
            {step.icon}
            {step.label}
          </button>
        ))}
      </nav>
    </aside>

    {/* Contenido */}
    <main className="flex-1 p-6 bg-white rounded-md shadow-inner overflow-auto">
      {currentStep === 1 && (
        <RegistrarPostulante idEncargado={idEncargado} idOlimpiada={idOlimpiada} />
      )}
      {currentStep === 2 && (
        <RegistrarListaPostulantes idEncargado={idEncargado} idOlimpiada={idOlimpiada} />
      )}
      {currentStep === 3 && (
        <OrdenDePago idEncargado={idEncargado} idOlimpiada={idOlimpiada} />
      )}
      {currentStep === 4 && (
        <ValidarComprobante idEncargado={idEncargado} idOlimpiada={idOlimpiada} />
      )}
    </main>
  </div>
);
};


export default LayoutRegistro