import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeviceAgent } from '../../hooks/useDeviceAgent';
import { getOlimpiada } from '../../../service/olimpiadas.api';
import RegistrarPostulante from './RegistrarPostulante';
import RegistrarListaPostulantes from './RegistrarListaPostulantes';
import OrdenDePago from './OrdenesDePago';
import ValidarComprobante from './ValidarComprobante';
import {
  UserPlus,
  ListChecks,
  FileText,
  FileCheck2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

const LayoutRegistro = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, screenSize } = useDeviceAgent();

  // Estados para el sidebar responsive
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Estado para la información de la olimpiada
  const [olimpiadaInfo, setOlimpiadaInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Leer el paso guardado en localStorage o usar 1 por defecto
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('registroCurrentStep');
    return saved ? Number(saved) : 1;
  });

  // Cargar información de la olimpiada
  useEffect(() => {
    const loadOlimpiadaInfo = async () => {
      try {
        setLoading(true);
        const olimpiada = await getOlimpiada(idOlimpiada);
        setOlimpiadaInfo(olimpiada);
      } catch (error) {
        console.error('Error al cargar información de la olimpiada:', error);
        // En caso de error, mantener el ID como fallback
        setOlimpiadaInfo({ nombre: `Olimpiada ${idOlimpiada}` });
      } finally {
        setLoading(false);
      }
    };

    if (idOlimpiada) {
      loadOlimpiadaInfo();
    }
  }, [idOlimpiada]);

  // Auto-colapsar en tablet por defecto
  useEffect(() => {
    if (isTablet && !isMobile) {
      setIsCollapsed(true);
    } else if (isDesktop) {
      setIsCollapsed(false);
    }
  }, [isTablet, isMobile, isDesktop]);

  // Guardar el paso cada vez que cambie
  useEffect(() => {
    localStorage.setItem('registroCurrentStep', currentStep);
  }, [currentStep]);

  const steps = [
    { 
      id: 1, 
      label: 'Registro de Postulante', 
      icon: <UserPlus className="w-5 h-5" />,
      description: 'Registra los datos del postulante'
    },
    { 
      id: 2, 
      label: 'Registro de Lista de Postulantes', 
      icon: <ListChecks className="w-5 h-5" />,
      description: 'Gestiona la lista de postulantes'
    },
    { 
      id: 3, 
      label:'Generar Orden de Pago', 
      icon: <FileText className="w-5 h-5" />,
      description: 'Genera la orden de pago'
    },
    { 
      id: 4, 
      label: 'Validar Comprobante de Pago', 
      icon: <FileCheck2 className="w-5 h-5" />,
      description: 'Valida el comprobante de pago'
    }
  ];

  // Memoized handlers for better performance
  const handleMenuClick = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  }, [isMobile, isMobileOpen, isCollapsed]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  const handleStepChange = useCallback((stepId) => {
    setCurrentStep(stepId);
    // Cerrar el sidebar móvil al seleccionar un paso
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [isMobile]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Memoized responsive classes - Hacer que móvil sea igual a desktop
  const sidebarClasses = useMemo(() => {
    const baseClasses = 'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg';
    
    if (isMobile) {
      return `${baseClasses} fixed left-0 top-0 h-full z-30 ${
        isCollapsed ? 'w-20' : 'w-80'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`;
    }
    
    return `${baseClasses} sticky top-0 h-screen ${
      isCollapsed ? 'w-20' : 'w-80'
    }`;
  }, [isMobile, isMobileOpen, isCollapsed]);

  const mainContentClasses = useMemo(() => {
    return 'flex-1 min-h-screen bg-gray-50';
  }, []);

  // Get current step info
  const currentStepInfo = useMemo(() => {
    return steps.find(step => step.id === currentStep);
  }, [currentStep, steps]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarClasses} ${isMobile ? 'z-30' : ''}`}>
          {/* Header del Sidebar */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-blue-800 truncate">
                      Inscripciones
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                      {loading ? 'Cargando...' : (olimpiadaInfo?.nombre || `Olimpiada ${idOlimpiada}`)}
                    </p>
                  </div>
                </div>
              )}
              
              {isCollapsed && !isMobile && (
                <div className="flex items-center justify-center w-full">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              )}

              {/* Desktop collapse button */}
              {!isMobile && (
                <button
                  onClick={toggleCollapse}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 flex-shrink-0"
                  aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              )}

              {/* Mobile close button */}
              {isMobile && (
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 flex-shrink-0"
                  aria-label="Cerrar sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className={`
                    w-full flex items-center rounded-lg text-sm font-medium 
                    transition-all duration-200 min-h-[52px] group relative
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }
                    ${isCollapsed 
                      ? 'justify-center px-2 py-3' 
                      : 'justify-start px-4 py-3 gap-3'
                    }
                  `}
                  title={isCollapsed ? step.label : undefined}
                >
                  <div className="flex-shrink-0">
                    <div className={`${isActive ? 'text-white' : ''}`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="truncate font-medium">
                        {step.label}
                      </div>
                      <div className={`text-xs truncate mt-1 ${
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleGoHome}
              className={`
                w-full flex items-center rounded-lg text-sm font-medium 
                transition-all duration-200 min-h-[44px]
                text-gray-600 hover:text-gray-900 hover:bg-gray-100
                ${isCollapsed ? 'justify-center px-2 py-2' : 'justify-start px-3 py-2 gap-3'}
              `}
              title={isCollapsed ? "Volver al inicio" : undefined}
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Volver al inicio</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={mainContentClasses}>
          {/* Header con botón de menú y título */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={handleMenuClick}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  {currentStepInfo?.icon}
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                    {currentStepInfo?.label}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{currentStepInfo?.description}</span>
                    <span>• {loading ? 'Cargando...' : (olimpiadaInfo?.nombre || `Olimpiada ${idOlimpiada}`)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Indicador de paso actual */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {currentStep}/{steps.length}
              </span>
            </div>
          </div>

          {/* Contenido principal */}
          <main className={`
            p-4 md:p-6 
            ${isMobile ? 'min-h-[calc(100vh-80px)]' : 'min-h-[calc(100vh-88px)]'}
          `}>
            <div className="max-w-7xl mx-auto">
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
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LayoutRegistro;