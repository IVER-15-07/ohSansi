import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import CrearOlimpiada from './CrearOlimpiada'
import { getOlimpiadas } from "../../../service/olimpiadas.api";
import { useNavigate, Outlet } from 'react-router-dom'
import ConfOlimpiada from './ConfOlimpiada'
import { Plus, Settings, Play, Archive, Trash2 } from 'lucide-react'
import Cargando from '../Cargando';
import Error from '../Error';

const VistaOlimpiadas = () => {
  const { data: olimpiadas, isLoading, error: errorOlimpiadas } = useQuery({
    queryKey: ['olimpiadas'],
    queryFn: getOlimpiadas,
  });
  const navigate = useNavigate()
  const [AgregarOlimpiada, setAgregarOlimpiada] = useState(false)
  const [isConfOlimpiada, setIsConfOlimpiada] = useState(false)

  if (isLoading) return <Cargando/>;
  if (errorOlimpiadas) return <Error error ={errorOlimpiadas} />;

  return (

    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {AgregarOlimpiada ? (
        <CrearOlimpiada onBack={() => setAgregarOlimpiada(false)} />
      ) : isConfOlimpiada ? (
        <ConfOlimpiada onBack={() => setIsConfOlimpiada(false)} />
      ) : (
        <div className="flex flex-col w-full px-6 py-4 gap-4">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

          {/* Olimpiadas Creadas */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-5 flex flex-col h-[48vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Olimpiadas Creadas</h2>
              <button
                onClick={() => navigate("/AdminLayout/VistaOlimpiadas/CrearOlimpiada")}
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
                      <button onClick={() => navigate(`/AdminLayout/VistaOlimpiadas/${olimp.id}/configurar/${olimp.nombre}`)} 
                        className="flex items-center text-blue-600 hover:underline">
                        <Settings size={16} className="mr-1" /> Configurar Areas y Niveles
                      </button>  
                      <button onClick={() => navigate(`/AdminLayout/VistaOlimpiadas/${olimp.id}/configurarParametros/${olimp.nombre}`)} 
                        className="flex items-center text-blue-600 hover:underline">
                        <Settings size={16} className="mr-1" /> Configurar Parametros
                      </button>
                      <button onClick={() => navigate(`/AdminLayout/VistaOlimpiadas/${olimp.id}/configurar-campos`)} 
                        className="flex items-center text-blue-600 hover:underline">
                        <Settings size={16} className="mr-1" /> Configurar Campos del Formulario
                      </button>
                      <button className="flex items-center text-gray-300 hover:underline">
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
            <section className="bg-white rounded-2xl shadow-md border border-gray-200 px-6 py-5 flex flex-col h-[38vh]">
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">Olimpiadas Iniciadas</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
                <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition">
                  <h3 className="text-lg font-bold text-gray-300">Olimpiada 2024</h3>
                  <p className="text-sm text-gray-300 mt-1">Olimpiada STEM gestión 2024</p>
                  <div className="flex justify-end mt-4">
                    <button className="flex items-center text-gray-300 hover:underline text-sm font-medium">
                      <Trash2 size={16} className="mr-1" /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      )}
          <Outlet />
    </div>


  )
}

export default VistaOlimpiadas
