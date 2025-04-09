import React from 'react';

const Error = ({ error }) => {
    // Verificar si el error tiene una respuesta
    const mensaje = error?.response
      ? error.response.data.message || "Ocurrió un error al procesar la solicitud."
      : "No se pudo conectar con el servidor. Por favor, revise su conexión a internet o intente más tarde.";
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700 mb-6">{mensaje}</p>
        <a href="/" className="text-blue-500 hover:underline">Volver a la página principal</a>
      </div>
    );
  };
export default Error;