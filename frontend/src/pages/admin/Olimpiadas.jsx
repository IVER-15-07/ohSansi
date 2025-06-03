import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query';
import CrearOlimpiada from './CrearOlimpiada'
import { getOlimpiadas, getOlimpiadasActivas, iniciarOlimpiada } from "../../../service/olimpiadas.api";
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import ConfOlimpiada from './ConfOlimpiada'
import { Plus, Settings, Play, Archive, ChartPie } from 'lucide-react'
import { LoadingSpinner, Alert } from '../../components/ui';
import Error from '../Error';

const Olimpiadas = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [olimpiadasActivas, setOlimpiadasActivas] = useState([]);
  const [error, setError] = useState('');
  const [isConfOlimpiada, setIsConfOlimpiada] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: olimpiadas, isLoading, error: errorOlimpiadas } = useQuery({
    queryKey: ['olimpiadas'],
    queryFn: getOlimpiadas,
  });

  // Manejar mensaje de éxito desde navegación
  useEffect(() => {
    if (location.state?.successMessage && location.state?.olimpiadaCreada) {
      setSuccessMessage(location.state.successMessage);
      // Limpiar el estado de navegación para evitar que se muestre nuevamente
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Solo olimpiadas activas
  useEffect(() => {
    const fetchOlimpiadasActivas = async () => {
      try {
        const response = await getOlimpiadasActivas();
        setOlimpiadasActivas(response.data);
      } catch (err) {
        setError("Error al cargar las olimpiadas activas.");
        console.error(err);
      }
    };
    fetchOlimpiadasActivas();
  }, []);

  const handleIniciar = async (id) => {
    try {
      const result = await iniciarOlimpiada(id);
      alert(result.message); // Mensaje de éxito del backend
    } catch (error) {
      // Aquí recibes el objeto lanzado arriba
      alert(error.message || "Ocurrió un error inesperado");
    }
  };

  const handleReportes = (idOlimpiada) => {
    navigate(`/AdminLayout/Reportes/${idOlimpiada}`);
  };


  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <LoadingSpinner size="xl" text="Cargando olimpiadas..." />
    </div>
  );
  
  if (errorOlimpiadas) return <Error error={errorOlimpiadas} />;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {isConfOlimpiada ? (
        <ConfOlimpiada onBack={() => setIsConfOlimpiada(false)} />
      ) : (
        <div className="flex flex-col w-full px-6 py-4 gap-4">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

          {/* Mensaje de éxito */}
          {successMessage && (
            <Alert 
              variant="success" 
              title="¡Éxito!" 
              className="mb-4"
              autoClose={true}
              autoCloseDelay={5000}
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </Alert>
          )}

          {/* Olimpiadas Creadas */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-5 flex flex-col h-[48vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Olimpiadas Creadas</h2>
              <button
                onClick={() => navigate("/AdminLayout/Olimpiadas/CrearOlimpiada")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus size={18} /> Agregar Olimpiada
              </button>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
                {olimpiadas.data.length > 0 ? (
                  olimpiadas.data.map((olimp) => (
                    <div
                      key={olimp.id}
                      className="border border-gray-300 rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="text-lg font-bold text-gray-900">{olimp.nombre}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {olimp.descripcion || "Sin descripción disponible"}
                      </p>
                      <div className="flex justify-between items-center mt-4 gap-3 text-sm font-medium">
                        <button onClick={() => navigate(`/AdminLayout/Olimpiadas/${olimp.id}/configurar/${olimp.nombre}`)}
                          className="flex items-center text-blue-600 hover:underline">
                          <Settings size={16} className="mr-1" /> Configurar Areas y Niveles
                        </button>
                        <button onClick={() => navigate(`/AdminLayout/Olimpiadas/${olimp.id}/configurarParametros/${olimp.nombre}`)}
                          className="flex items-center text-blue-600 hover:underline">
                          <Settings size={16} className="mr-1" /> Configurar Parametros
                        </button>
                        <button onClick={() => navigate(`/AdminLayout/Olimpiadas/${olimp.id}/configurar-campos`)}
                          className="flex items-center text-blue-600 hover:underline">
                          <Settings size={16} className="mr-1" /> Configurar Campos del Formulario
                        </button>
                        <button onClick={() => handleIniciar(olimp.id)} className="flex items-center text-blue-600 hover:underline">
                          <Play size={16} className="mr-1" /> Iniciar
                        </button>
                        <button className="flex items-center text-gray-300 hover:underline">
                          <Archive size={16} className="mr-1" /> Archivar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay olimpiadas creadas aún.</p>
                )}
              </div>
            </section>

            {/* Olimpiadas Iniciadas */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-5 flex flex-col h-[38vh] mt-6">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Olimpiadas Activas</h2>
              {error && (
                <Alert variant="error" title="Error" className="mb-4">
                  {error}
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
                {olimpiadasActivas.length > 0 ? (
                  olimpiadasActivas.map((olimp) => (
                    <div
                      key={olimp.id}
                      className="border border-green-300 rounded-xl p-4 bg-green-50 shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="text-lg font-bold text-green-900">{olimp.nombre}</h3>
                      <p className="text-sm text-green-700 mt-1">
                        {olimp.descripcion || "Sin descripción disponible"}
                      </p>
                      <div className="flex justify-between items-center mt-4 gap-3 text-sm font-medium">
                        <button onClick={() => handleReportes(olimp.id)} className="flex items-center text-green-900 hover:underline">
                          <ChartPie size={16} className="mr-1" /> Reportes
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay olimpiadas activas.</p>
                )}
              </div>
            </section>

          </div>
        </div>
      )}
      <Outlet />
    </div>
  )
}

export default Olimpiadas
