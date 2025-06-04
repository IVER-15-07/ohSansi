import React, { useState, useEffect } from 'react';
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

const LayoutRegistro = () => {
  const { idEncargado, idOlimpiada } = useParams();

  // Leer el paso guardado en localStorage o usar 1 por defecto
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('registroCurrentStep');
    return saved ? Number(saved) : 1;
  });

  // Guardar el paso cada vez que cambie
  useEffect(() => {
    localStorage.setItem('registroCurrentStep', currentStep);
  }, [currentStep]);

  const steps = [
    { id: 1, label: 'Registro de postulante', icon: <UserPlus className="w-4 h-4" /> },
    { id: 2, label: 'Registro de lista de postulantes', icon: <ListChecks className="w-4 h-4" /> },
    { id: 3, label: 'Generar orden de pago', icon: <FileText className="w-4 h-4" /> },
    { id: 4, label: 'Validar comprobante de pago', icon: <FileCheck2 className="w-4 h-4" /> }
  ];

  return (
    <div className="pt-20 flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar fija a la izquierda */}
      <aside className="pt-24 w-80 h-full fixed top-0 left-0 bg-white shadow-md p-5 border-r border-gray-200 z-10">
        <h2 className="text-xl font-bold mb-6 text-blue-800">Apartado de Inscripciones</h2>
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

      {/* Contenido desplazable a la derecha */}
      <main className="ml-80 flex-1 overflow-y-auto p-6 bg-white rounded-md shadow-inner">
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

export default LayoutRegistro;