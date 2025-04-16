import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RegistrosPostulantes = () => {
  const { idEncargado, idOlimpiada } = useParams();
  const navigate = useNavigate();

  // Datos simulados de postulantes
  const [postulantes, setPostulantes] = useState([
    {
      nombre: "Juan Pérez",
      ci: "12345678",
      comprobante: "https://example.com/comprobante1.pdf",
      habilitado: true,
    },
    {
      nombre: "María López",
      ci: "87654321",
      comprobante: null,
      habilitado: false,
    },
    {
      nombre: "Carlos Gómez",
      ci: "45678912",
      comprobante: "https://example.com/comprobante2.pdf",
      habilitado: true,
    },
  ]);

  const handleRegistrarPostulante = () => {
    navigate(`/RegistrarPostulante/${idEncargado}/${idOlimpiada}`);
  };

  const handleRegistrarListaPostulantes = () => {
    navigate(`/RegistrarListaPostulantes/${idEncargado}/${idOlimpiada}`);
  };

  const handleOrdenesPago = () => {
    navigate(`/OrdenesDePago/${idEncargado}/${idOlimpiada}`);
  };

  const handleValidarComprobante = () => {
    navigate(`/ValidarComprobante/${idEncargado}/${idOlimpiada}`);
  };
  

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Registros de Postulantes</h1>

      {/* Tabla de postulantes */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Carnet</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Comprobante de Pago</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Habilitado</th>
            </tr>
          </thead>
          <tbody>
            {postulantes.map((postulante, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2 text-sm text-gray-700">{postulante.nombre}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{postulante.ci}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {postulante.comprobante ? (
                    <a
                      href={postulante.comprobante}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver Comprobante
                    </a>
                  ) : (
                    "No disponible"
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {postulante.habilitado ? (
                    <span className="text-green-600 font-medium">Sí</span>
                  ) : (
                    <span className="text-red-600 font-medium">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botones de acciones */}

      <div className="mt-6 space-y-4">
        <div className="flex justify-end gap-4"> 
            <button 
              onClick={handleRegistrarPostulante}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Registrar Postulante
            </button>

            <button 
              onClick={handleRegistrarListaPostulantes}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Registrar una Lista de Postulantes
            </button>
        </div>
        
        <div className="flex mt-20 justify-center gap-20"> 
            <button 
              onClick={handleOrdenesPago}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Órdenes de Pago
            </button>

            <button 
              onClick={handleValidarComprobante}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Validar Comprobante de Pago
            </button>
        </div>
        
      </div>
    </div>
  );
};

export default RegistrosPostulantes;