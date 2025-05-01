import React from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from "react";
import { Await, useParams } from "react-router-dom";
import { getFormulario, saveDatosInscripcion, createRegistro} from "../../../service/formulario.api";
import { getOpcionesInscripcion } from "../../../service/opciones_inscripcion.api";
import Formulario from "./Formulario";
import OpcionInscripcion from "./OpcionInscripcion";
import DatosPostulante from "./DatosPostulante";
import Cargando from "../Cargando";
const RegistrarPostulante = () => {
    const [secciones, setSecciones] = useState([]);
    const [opcionesInscripcion, setOpcionesInscripcion] = useState([]);
    const [seleccionesInscripcion, setSeleccionesInscripcion] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState(null);
    const [datosPostulante, setDatosPostulante] = useState({
        nombres: '',
        apellidos: '',
        ci: '',
      });

    const { idOlimpiada, idEncargado} = useParams();

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
        if(secciones.length === 0){
          setFormValues(initialValues);
          return;
        }

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Enviar formValues al backend para guardarlo en dato_inscripcion
        // Por ejemplo:
        try {
          setIsLoading(true);
          for (const seleccion of seleccionesInscripcion) {
            const data = {
              ...datosPostulante,
              id_encargado: idEncargado,
              id_opcion_inscripcion: seleccion.opcionInscripcionId,
            };
      
            // Esperar a que se cree el registro
            const registroResponse = await createRegistro(data);
            const registro = registroResponse.data;
    
            if(secciones.length === 0) continue;
            // Guardar los datos de inscripción relacionados con el registro
            await saveDatosInscripcion({formValues: formValues}, registro.id);
          }
          alert("Inscripcion registrada con éxito");
        }catch (error) {
          alert(error.response.data.message);
          console.error("Error al enviar el formulario:", error);
        }finally {
          setIsLoading(false);
          console.log("Formulario enviado con éxito");
        }
        
    };

    const handleOpcionInscripcion = (nuevasSelecciones) => {
      setSeleccionesInscripcion(nuevasSelecciones);
    };
    
    console.log(JSON.stringify({ datosPostulante }));
    if (isLoading) return <Cargando />;
    if (errorFormulario) return <div>Error al cargar el formulario</div>;
    
    return (
      <div className="flex flex-col flex-grow min-h-0 bg-gray-100">
        <div className="flex-grow flex items-center justify-center overflow-y-auto">
          <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-6">

            <h2 className="text-2xl font-bold mb-4">Formulario de Inscripción</h2>
            <p className="text-gray-600 mb-4">Por favor, completa el formulario a continuación.</p>

            <DatosPostulante
              formValues={datosPostulante}
              handleInputChange={(campo, valor) => setDatosPostulante({ ...datosPostulante, [campo]: valor })}
            />

            {(secciones.length !== 0) ? 
            (<Formulario 
              secciones={secciones}
              formValues={formValues}
              handleInputChange={handleInputChange}
            /> ): null}
            

            <OpcionInscripcion
              opcionesInscripcion={opcionesInscripcion}
              handleOpcionInscripcion={handleOpcionInscripcion}
              maxAreas={2} // Cambia esto según tu lógica
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