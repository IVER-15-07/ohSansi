import React from "react";
import { LoadingSpinner } from "../components/ui";

const Cargando = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <LoadingSpinner size="xl" text="Cargando..." />
    </div>
  );
}

export default Cargando;