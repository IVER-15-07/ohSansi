import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query';
import CrearOlimpiada from './CrearOlimpiada'
import { getOlimpiadas, getOlimpiadasActivas, iniciarOlimpiada } from "../../../service/olimpiadas.api";
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import ConfOlimpiada from './ConfOlimpiada'
import { Plus, Settings, Play, Archive, ChartPie } from 'lucide-react'
import { LoadingSpinner, Alert, Card } from '../../components/ui';
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
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

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
                    <Card
                      key={olimp.id}
                      className="border border-gray-200 rounded-xl p-5 bg-white shadow hover:shadow-lg transition group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition">
                          <Settings size={16} />
                        </span>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition">{olimp.nombre}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {olimp.descripcion || "Sin descripción disponible"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() => navigate(`/AdminLayout/Olimpiadas/${olimp.id}/configurar/${olimp.nombre}`)}
                          className="px-3 py-1 rounded text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        >
                          
                        Áreas y Niveles
                        </button>
                        <button
                          onClick={() => navigate(`/AdminLayout/Olimpiadas/${olimp.id}/configurarParametros/${olimp.nombre}`)}
                          className="px-3 py-1 rounded text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        >
                          Parámetros
                        </button>
                        <button
                          onClick={() => navigate(`/AdminLayout/Olimpiadas/${olimp.id}/configurar-campos`)}
                          className="px-3 py-1 rounded text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        >
                          Campos Formulario
                        </button>
                        <button
                          onClick={() => handleIniciar(olimp.id)}
                          className="px-3 py-1 rounded text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition"
                        >
                          Publicar
                        </button>
                      </div>  
                    </Card>
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
                      className="border border-green-200 rounded-xl p-5 bg-green-50 shadow hover:shadow-lg transition group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-700 group-hover:bg-green-200 transition">
                          <ChartPie size={16} />
                        </span>
                        <h3 className="text-lg font-bold text-green-800 group-hover:text-green-900 transition">{olimp.nombre}</h3>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        {olimp.descripcion || "Sin descripción disponible"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() => handleReportes(olimp.id)}
                          className="px-2 py-1 rounded text-xs bg-green-100 text-green-900 hover:bg-green-200 transition"
                        >
                          Reportes
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No hay olimpiadas activas.</p>
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
