import React from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormulario } from "../../../service/formulario.api";
import { getOpcionesInscripcion } from "../../../service/opciones_inscripcion.api";
import Formulario from "./Formulario";
import OpcionInscripcion from "./OpcionInscripcion";
const RegistrarPostulante = () => {
    const [secciones, setSecciones] = useState([]);
    const [opcionesInscripcion, setOpcionesInscripcion] = useState([]);
    const [seleccionesInscripcion, setSeleccionesInscripcion] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState(null);

    const { idOlimpiada} = useParams();

    useEffect(() => {
        const fetchFormulario = async () => {
            setIsLoading(true);
            try {
                const seccionesFormulario = await getFormulario(idOlimpiada);
                const opcionesInscripcion = await getOpcionesInscripcion(idOlimpiada);
                setSecciones(seccionesFormulario.data);
                setOpcionesInscripcion(opcionesInscripcion.data);
            } catch (error) {
                setErrorFormulario(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFormulario();
    }, [idOlimpiada]);

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

    const handleOpcionInscripcion = (nuevasSelecciones) => {
      setSeleccionesInscripcion(nuevasSelecciones);
    };
    console.log(JSON.stringify({ seleccionesInscripcion }));
    console.log(JSON.stringify({ opcionesInscripcion }));
    if (isLoading || secciones.length === 0) return <div>Cargando...</div>;
    if (errorFormulario) return <div>Error al cargar el formulario</div>;

    
    return (
      <div className="flex flex-col flex-grow min-h-0 bg-gray-100">
        <div className="flex-grow flex items-center justify-center overflow-y-auto">
          <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-6">

            <Formulario 
              secciones={secciones}
              formValues={formValues}
              handleInputChange={handleInputChange}
            />

            <OpcionInscripcion
              opcionesInscripcion={opcionesInscripcion}
              handleOpcionInscripcion={handleOpcionInscripcion}
            />

            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Enviar
            </button>
            
          </div>
        </div>
      </div>
    );
}

export default RegistrarPostulante;