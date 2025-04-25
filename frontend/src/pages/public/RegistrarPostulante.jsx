import React from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormulario } from "../../../service/formulario.api";
const RegistrarPostulante = () => {
    const [secciones, setSecciones] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState(null);

    useEffect(() => {
        const fetchFormulario = async () => {
            setIsLoading(true);
            try {
                const data = await getFormulario();
                setSecciones(data.data);
            } catch (error) {
                setErrorFormulario(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFormulario();
    }, []);

    // Manejo de estado para los valores del formulario
    // (Podrías usar React Hook Form o similar)
    const [formValues, setFormValues] = useState({});

    // Actualizar formValues cuando secciones cambien
    useEffect(() => {
        // Inicializar formValues con los valores que vengan de la BD
        const initialValues = {};
        secciones.map((sec) => {
        sec.campos_inscripcion.map((campo) => {
            initialValues[campo.id] = campo.valor || "";
        });
        });
        setFormValues(initialValues);
    }, [secciones]);
    console.log(JSON.stringify({ formValues }));
    

    // Manejo del cambio en inputs
    const handleInputChange = (campoId, value) => {
        setFormValues(prevValues => ({
        ...prevValues,
        [campoId]: value
        }));
    };


    // Para avanzar o retroceder entre pasos
    const handleNext = () => {
        if (currentStep < secciones.length - 1) {
        setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        // Enviar formValues al backend para guardarlo en dato_inscripcion
        // Por ejemplo:
        fetch(`/api/save-form/${registroId || ""}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ formValues }),
        })
        .then((res) => res.json())
        .then((respuesta) => {
            console.log("Guardado con éxito", respuesta);
        })
        .catch((error) => console.error(error));
    };

    if (isLoading || secciones.length === 0) return <div>Cargando...</div>;
    if (errorFormulario) return <div>Error al cargar el formulario</div>;

    const seccionActual = secciones[currentStep];

    return (
        <div className="flex flex-col flex-grow min-h-0 bg-gray-100">
          <div className="flex-grow flex items-center justify-center overflow-y-auto">
            <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-center mb-6">
                {secciones.map((_, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-center mx-1 rounded-full transition-all duration-500 h-14 w-14 ${
                      index === currentStep
                        ? "bg-blue-600 text-white font-bold shadow-lg"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
      
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {seccionActual.nombre}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {seccionActual.campos_inscripcion.map((campo) => {
                    switch (campo.tipo_campo.nombre) {
                      case "text":
                      case "number":
                        return (
                          <div key={campo.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {campo.nombre}
                            </label>
                            <input
                              type={campo.tipo_campo.nombre}
                              value={formValues[campo.id]}
                              onChange={(e) =>
                                handleInputChange(campo.id, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        );
                      case "email":
                        return (
                          <div key={campo.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {campo.nombre}
                            </label>
                            <input
                              type="email"
                              value={formValues[campo.id]}
                              onChange={(e) =>
                                handleInputChange(campo.id, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="ejemplo@correo.com"
                            />
                          </div>
                        );
                      default:
                        return (
                          <div key={campo.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {campo.nombre}
                            </label>
                            <input
                              type="text"
                              value={formValues[campo.id]}
                              onChange={(e) =>
                                handleInputChange(campo.id, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        );
                    }
                  })}
                </div>
      
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className={`px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 ${
                      currentStep === 0
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                    }`}
                  >
                    Anterior
                  </button>
      
                  {currentStep < secciones.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Siguiente
                    </button>
                  )}
      
                  {currentStep === secciones.length - 1 && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Enviar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      );
}

export default RegistrarPostulante;