import React, { useState } from "react";
import { verificarEncargado } from "../../../service/encargados.api";
import RegistroTutor from "./RegistroTutor";
import { useParams,useLocation,useNavigate} from "react-router-dom";
import { Button, FormField } from "../../components/ui";



const IdentificarEncargado = () => {
  const [ci, setCi] = useState("");
  const { idEncargado } = useParams();
  //const { idOlimpiada } = useParams(); // Obtener el id de la olimpiada desde los parámetros de la URL
  const [error, setError] = useState(null);
  const [ciError, setCiError] = useState(""); // Estado para errores específicos del CI
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarRegistroTutor, setMostrarRegistroTutor] = useState(false); // Estado para alternar contenido
  const navigate = useNavigate();
  const location = useLocation();

  const idOlimpiada = location.state?.idOlimpiada; // Recibir el idOlimpiada desde el state


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validar CI antes de enviar
    if (ciError) {
      setError("Por favor, corrija los errores en el carnet de identidad antes de continuar.");
      return;
    }
    
    if (!ci.trim()) {
      setError("El carnet de identidad es obligatorio.");
      return;
    }
    
    setIsLoading(true);

    try {
      // Verificar si el carnet ya está registrado
      const response = await verificarEncargado(ci);
      console.log(response.data);
      if (response.data.existe) {
        // Si el carnet ya está registrado, redirigir a seleccionar olimpiada
        navigate(`/registros/${response.data.id}/${idOlimpiada}`);
      } else {
        // Si no está registrado, redirigir a registro tutor
        navigate("/RegistroEncargado", { state: { ci, idOlimpiada } });
      }
    } catch (error) {
      console.error("Error al verificar el carnet:", error);
      setError("No se pudo verificar el carnet. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const volverAmenuolimpiadas = () => {
    navigate(`/olimpiadas/${idOlimpiada}`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Limpiar errores previos
    setCiError("");
    
    // Validar caracteres especiales y letras con tilde en tiempo real
    const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
    const letrasConTilde = /[áéíóúÁÉÍÓÚñÑ]/;
    
    if (caracteresEspeciales.test(value)) {
      setCiError("No se permiten caracteres especiales como !@#$%^&*(),.?\":{}|<>/\\`~_+=[];'-");
      return; // No actualizar el valor del input
    }
    
    if (letrasConTilde.test(value)) {
      setCiError("No se permiten letras con tilde (á, é, í, ó, ú, ñ)");
      return; // No actualizar el valor del input
    }
    
    // Permitir solo letras sin tilde, espacios y números
    const regex = /^[a-zA-Z0-9 ]*$/;
    if (regex.test(value)) {
      setCi(value);
    } else {
      // Si no pasa la validación, mostrar error genérico
      setCiError("Solo se permiten letras sin tilde, números y espacios");
    }
  };

  const handleVolver = () => {
    setMostrarRegistroTutor(false);
  };


  return (
    <div className="pt-24 container mx-auto py-8 px-4">
      {mostrarRegistroTutor ? (

        <RegistroTutor handleVolver={handleVolver} />
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
              <FormField
                type="text"
                id="ci"
                name="ci"
                label="Carnet de Identidad"
                value={ci}
                onChange={handleInputChange}
                required
                placeholder="Ingrese su número de carnet"
                error={ciError}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !ci.trim() || ciError}
              className={`w-full px-4 py-2 rounded-md text-white ${
                isLoading || !ci.trim() || ciError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
                }`}
            >
              {isLoading ? "Verificando..." : "Continuar"}
            </Button>

            <Button
              type="button"
              variant="accent"
              onClick={volverAmenuolimpiadas} // Cambiar al componente RegistroTutor
              className="w-full px-4 py-2 rounded-md text-white bg-blue-800 hover:bg-blue-700"
            >
              Volver a Olimpiadas
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IdentificarEncargado;