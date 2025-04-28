import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verificarEncargado } from "../../../service/encargados.api";
import RegistroTutor from "./RegistroTutor";

const IdentificarEncargado = () => {
  const [ci, setCi] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarRegistroTutor, setMostrarRegistroTutor] = useState(false); // Estado para alternar contenido
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Verificar si el carnet ya está registrado
      const response = await verificarEncargado(ci);
      if (response.data.existe) {
        // Si el carnet ya está registrado, redirigir a seleccionar olimpiada
        navigate(`/SeleccionarOlimpiada/${response.data.id}`);
      } else {
        // Si no está registrado, redirigir a registro tutor
        navigate("/RegistroEncargado", { state: { ci } });
      }
    } catch (error) {
      console.error("Error al verificar el carnet:", error);
      setError("No se pudo verificar el carnet. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistro = () => {
    // Cambiar el estado para mostrar el componente RegistroTutor
    setMostrarRegistroTutor(true);
  };

  const handleVolver = () => {
    setMostrarRegistroTutor(false); // Volver al componente IdentificarEncargado
  };


  return (
    <div className="pt-24 container mx-auto py-8 px-4">
      {mostrarRegistroTutor ? (
      
        <RegistroTutor handleVolver={handleVolver}/>
      ) : (
        // Mostrar el componente IdentificarEncargado
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Identificar Encargado</h1>
          <p className="text-gray-600 mb-4 text-center">
            Ingrese su número de carnet de identidad para continuar.
          </p>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="ci" className="block text-sm font-medium text-gray-700 mb-1">
                Carnet de Identidad
              </label>
              <input
                type="text"
                id="ci"
                name="ci"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ingrese su número de carnet"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !ci}
              className={`w-full px-4 py-2 rounded-md text-white ${
                isLoading || !ci
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {isLoading ? "Verificando..." : "Continuar"}
            </button>

            <button
              type="button"
              onClick={handleRegistro} // Cambiar al componente RegistroTutor
              className="w-full px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Registrarse como encargado
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IdentificarEncargado;