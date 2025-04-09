import React from "react";

const Cargando = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      <p className="text-lg mt-4 p-2 text-gray-700">Cargando...</p>
    </div>
  );
}

export default Cargando;