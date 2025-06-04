import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Search } from "lucide-react";
import { Button, LoadingSpinner, Card, CardHeader, CardContent, Modal } from "../../components/ui";
import { FormField, TutorForm, InscripcionForm } from "../../components/forms";
import { useDeviceAgent } from "../../hooks/useDeviceAgent";

import { getOlimpiada } from "../../../service/olimpiadas.api";
import { getOlimpiadaCamposPostulante } from "../../../service/olimpiada_campos_postulante.api";
import { saveDatosPostulante } from "../../../service/datos_postulante.api";
import { getOlimpiadaCamposTutor } from "../../../service/olimpiada_campos_tutor.api";
import { saveDatosTutor } from "../../../service/datos_tutor.api";
import { getInscripcionesPorRegistro, createInscripcion, deleteInscripcion } from "../../../service/inscripcion.api";
import { getRegistrosTutorPorRegistro, createRegistroTutor, deleteRegistroTutor} from "../../../service/registro_tutor.api";
import { getRegistroByCI, createRegistro } from "../../../service/registros.api";
import { getTutor, createTutor, getRolesTutor} from "../../../service/tutores.api";
import { getPostulanteByCI, createPostulante} from "../../../service/postulantes.api";
import { getGrados } from "../../../service/grados.api";
import { getOpcionesInscripcion } from "../../../service/opciones_inscripcion.api";
import { getPersonaByCI } from "../../../service/personas.api";
import { getOpcionesCampoPostulante } from "../../../service/opciones_campo_postulante.api";


const initialPostulanteState = {
  idPersona: null,
  ci: "",
  nombres: "",
  apellidos: "",
  fecha_nacimiento: "",
  grado: { id: "", nombre: "" },
  idPostulante: null,
  idRegistro: null,
  buscado: false,
  datos: []
};

const RegistrarPostulante = () => {
  const { idOlimpiada, idEncargado } = useParams();
  const deviceInfo = useDeviceAgent();
  
  // Estados principales
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Estados para modales de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Estados de datos
  const [maxArea, setMaxArea] = useState(null);
  const [personaPostulante, setPersonaPostulate] = useState(null);
  const [postulante, setPostulante] = useState(initialPostulanteState);
  const [catalogoGrados, setCatalogoGrados] = useState([]);
  const [rolesTutor, setRolesTutor] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [opcionesInscripcionCatalogo, setOpcionesInscripcionCatalogo] = useState([]);
  const [opcionesInscripcion, setOpcionesInscripcion] = useState([]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);

  // Funciones para formatear y parsear fechas mejoradas
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return "";
    
    // Si ya está en formato YYYY-MM-DD (para input date)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Si está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split("/");
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    
    return dateStr;
  }, []);

  const parseDate = useCallback((dateStr) => {
    if (!dateStr) return "";
    
    // Si está en formato YYYY-MM-DD, mantener así
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Si está en formato DD/MM/YYYY, convertir a YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [dd, mm, yyyy] = dateStr.split("/");
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    
    return dateStr;
  }, []);

  // Función de validación de campos mejorada
  const validateField = useCallback((name, value) => {
    const newErrors = { ...formErrors };

    switch (name) {
      case "nombres":
      case "apellidos":
        if (!value.trim()) {
          newErrors[name] = `${name === "nombres" ? "El nombre" : "El apellido"} es obligatorio`;
        } else if (value.length > 100) {
          newErrors[name] = `${name === "nombres" ? "El nombre" : "El apellido"} no debe exceder los 100 caracteres`;
        } else {
          // Validar caracteres especiales (permitir tildes y ñ)
          const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
          if (caracteresEspeciales.test(value)) {
            newErrors[name] = "No se permiten caracteres especiales";
          } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
            newErrors[name] = "Solo se permiten letras y espacios";
          } else {
            delete newErrors[name];
          }
        }
        break;
      
      case "ci":
        if (!value.trim()) {
          newErrors.ci = "El Carnet de Identidad es obligatorio";
        } else {
          // Validar CI sin caracteres especiales ni tildes
          const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
          const letrasConTilde = /[áéíóúÁÉÍÓÚñÑ]/;
          
          if (caracteresEspeciales.test(value) || letrasConTilde.test(value)) {
            newErrors.ci = "El CI no puede contener caracteres especiales ni tildes";
          } else if (!/^[a-zA-Z0-9 ]*$/.test(value)) {
            newErrors.ci = "El CI solo puede contener letras, números y espacios";
          } else {
            delete newErrors.ci;
          }
        }
        break;
      
      case "fecha_nacimiento":
        if (!value) {
          newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
        } else {
          delete newErrors.fecha_nacimiento;
        }
        break;
      
      case "grado":
        if (!value) {
          newErrors.grado = "El grado es obligatorio";
        } else {
          delete newErrors.grado;
        }
        break;
      
      default:
        break;
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formErrors]);

  {/**ESTA PARTE SE ENCARGA DEL RENDERIZADO DE LA PÁGINA**/}
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const olimpiadaRes = await getOlimpiada(idOlimpiada);
        const gradosRes = await getGrados();
        const opcionesInscripcionRes = await getOpcionesInscripcion(idOlimpiada);
        const rolesTutorRes = await getRolesTutor();
        
        setMaxArea(olimpiadaRes.max_areas);
        setCatalogoGrados(gradosRes.data);
        setOpcionesInscripcionCatalogo(opcionesInscripcionRes.data);
        setRolesTutor(rolesTutorRes.data);
      } catch (err) {
        setError("Error al cargar el formulario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idOlimpiada]);
  {/**ESTA PARTE SE ENCARGA DE LA BUSQUEDA DE UN REGISTRO**/}	
  const buscarRegistro = async () => {
    if (!postulante.ci) {
      alert("Por favor, ingrese el CI del postulante antes de buscar.");
      return;
    }
    setIsLoading(true);
    try{
      const registroBuscado = await getRegistroByCI(idOlimpiada, postulante.ci);
      if (!registroBuscado.data) {
        await buscarPostulante();
        return;
      }
      const registroEncontrado = registroBuscado.data;
      const camposPostulanteRes = (await getOlimpiadaCamposPostulante(idOlimpiada, registroEncontrado.id_postulante)).data;
      const datosIniciales = [];
      camposPostulanteRes.forEach(async (campo) =>  {
        const campoNuevo = {};
        campoNuevo["idOlimpiadaCampoPostulante"] = campo.id;
        campoNuevo["idCampoPostulante"] = campo.campo_postulante.id;
        campoNuevo["idDependencia"] = campo.campo_postulante.id_dependencia;
        campoNuevo["tipo_campo"] = campo.campo_postulante.tipo_campo.nombre;
        campoNuevo["esObligatorio"] = campo.esObligatorio;
        campoNuevo["nombre_campo"] = campo.campo_postulante.nombre;
        campoNuevo["valor"] = campo.datos_postulante?.length > 0
        ? campo.datos_postulante[0].valor
        : "";
        if(campo.campo_postulante.tipo_campo.esLista){
          const opcionesCampoPostulante = (await getOpcionesCampoPostulante(campo.campo_postulante.id)).data;
          if(campoNuevo["idDependencia"] === undefined || campoNuevo["idDependencia"] === null) {
            campoNuevo["opciones"] = opcionesCampoPostulante["ROOT"];
            const opcionSeleccionada = campoNuevo["opciones"].find((opcion) => opcion.valor === campoNuevo["valor"]);
            if(opcionSeleccionada) {
              campoNuevo["idValor"] = opcionSeleccionada.id;
            }else{
              campoNuevo["idValor"] = null;
            }
          }else{
            campoNuevo["opciones"] = opcionesCampoPostulante;
            const campoDependencia = datosIniciales.find(
              c => c.idCampoPostulante === campoNuevo["idDependencia"]
            );
            if(campoDependencia.idValor !== null && campoDependencia.idValor !== undefined) {
              const opcionSeleccionada = campoNuevo["opciones"][campoDependencia.idValor].find((opcion) => opcion.valor === campoNuevo["valor"]);
              if(opcionSeleccionada) {
                campoNuevo["idValor"] = opcionSeleccionada.id;
              }else{
                campoNuevo["idValor"] = null;
              }
            }else{
              campoNuevo["idValor"] = null;
            }
          }
        }
        datosIniciales.push(campoNuevo);
      });
      setPostulante({
        ...postulante,
        idPersona: registroEncontrado.postulante.persona.id,
        nombres: registroEncontrado.postulante.persona.nombres,
        apellidos: registroEncontrado.postulante.persona.apellidos,
        fecha_nacimiento: registroEncontrado.postulante.persona.fecha_nacimiento,
        idPostulante: registroEncontrado.id_postulante,
        grado: registroEncontrado.grado,
        idRegistro: registroEncontrado.id,
        buscado: true,
        datos: datosIniciales,
      });

      setPersonaPostulate(registroEncontrado.postulante.persona);

      handleGradoChange(registroEncontrado.grado.id);

      {/**CARGAR LAS OPCIONES INSCRIPCION YA HECHAS*/}
      const inscripciones = ( await getInscripcionesPorRegistro(registroEncontrado.id) ).data;
      const opcionesInscripcionGuardadas = [];
      inscripciones.forEach((inscripcion) => {
         opcionesInscripcionGuardadas.push({ idInscripcion: inscripcion.id, idOpcionInscripcion: inscripcion.id_opcion_inscripcion, idPago: inscripcion.id_pago });
      });
      setOpcionesSeleccionadas(opcionesInscripcionGuardadas);

      {/**CARGAR LOS TUTORES YA HECHOS*/}
      const registrosTutores = ( await getRegistrosTutorPorRegistro(registroEncontrado.id) ).data;
      const tutoresGuardados = await Promise.all(
        registrosTutores.map(async (registro) => {
          const camposTutor = (await getOlimpiadaCamposTutor(idOlimpiada, registro.id_tutor)).data;
          const datosIniciales = [];
          camposTutor.forEach((campo) => {
            const campoNuevo = {};
            campoNuevo["idOlimpiadaCampoTutor"] = campo.id;
            campoNuevo["tipo_campo"] = campo.campo_tutor.tipo_campo.nombre;
            campoNuevo["esObligatorio"] = campo.esObligatorio;
            campoNuevo["nombre_campo"] = campo.campo_tutor.nombre;
            campoNuevo["valor"] = campo.datos_tutor?.length > 0
            ? campo.datos_tutor[0].valor
            : "";
            datosIniciales.push(campoNuevo);
          });
          return {
            idRegistroTutor: registro.id,
            idPersona: registro.tutor.persona.id, 
            idTutor: registro.id_tutor,
            ci: registro.tutor.persona.ci,
            nombres: registro.tutor.persona.nombres,
            apellidos: registro.tutor.persona.apellidos,
            idRol: registro.id_rol_tutor,
            buscado: true,
            datos: datosIniciales,
          };
        })
      );
      setTutores(tutoresGuardados);
    }catch (error) {
      console.error("Error al buscar el registro:", error);
      alert("Error al buscar el registro: " + error.message);
    }finally {
      setIsLoading(false);
    }
  }

  const handleGradoChange = (gradoId) => {
    // Buscar el objeto grado completo basado en el ID seleccionado
    const gradoSeleccionado = catalogoGrados.find(grado => grado.id == gradoId) || {id: gradoId, nombre: ""};
    setPostulante(prevState => ({
      ...prevState,
      grado: gradoSeleccionado
    }));

    // Filtrar opciones de inscripción según el grado seleccionado
    const opcionesFiltradas = [];

    Object.entries(opcionesInscripcionCatalogo).forEach(([areaId, area]) => {
      // Filtrar niveles_categorias que tengan el id_grado igual al seleccionado
      const nivelesFiltrados = area.niveles_categorias.filter(nc => nc.grados.some(g => g.id == gradoId));
      if (nivelesFiltrados.length > 0){
        opcionesFiltradas.push({
          ...area,
          niveles_categorias: nivelesFiltrados
        });
      }
    });
    setOpcionesInscripcion(opcionesFiltradas);
    setOpcionesSeleccionadas([]);
  };

  // Función mejorada para manejar cambios en postulante
  const handlePostulanteChange = useCallback((field, value) => {
    // Para el campo CI, aplicar validación en tiempo real
    if (field === "ci") {
      const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
      const letrasConTilde = /[áéíóúÁÉÍÓÚñÑ]/;
      
      if (caracteresEspeciales.test(value) || letrasConTilde.test(value)) {
        return; // No actualizar si contiene caracteres no permitidos
      }
      
      if (!/^[a-zA-Z0-9 ]*$/.test(value)) {
        return; // No actualizar si no cumple el patrón
      }
    }
    
    // Para nombres y apellidos, validar caracteres especiales pero permitir tildes
    if (field === "nombres" || field === "apellidos") {
      const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
      if (caracteresEspeciales.test(value)) {
        return; // No actualizar si contiene caracteres especiales no permitidos
      }
      
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(value)) {
        return; // No actualizar si no cumple el patrón
      }
    }

    // Para fecha de nacimiento, manejar directamente como string
    if (field === "fecha_nacimiento") {
      setPostulante(prev => ({
        ...prev,
        [field]: value
      }));
      validateField(field, value);
      return;
    }

    // Limpiar errores del campo
    setFormErrors(prev => ({ ...prev, [field]: undefined }));

    // Si el field es del tipo datos[índice].valor
    const match = field.match(/^datos\[(\d+)\]\.valor$/);
    if (match) {
      const idx = Number(match[1]);
      setPostulante(prev => ({
        ...prev,
        datos: prev.datos.map((dato, i) =>
          i === idx ? { ...dato, valor: value } : dato
        ),
      }));
    } else {
      setPostulante(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Validar el campo
    validateField(field, value);
  }, [validateField]);

  const buscarPostulante = async () => {
    if (!postulante.ci) {
      alert("Por favor, ingrese el CI del postulante antes de buscar.");
      return;
    }
    setIsLoading(true);
    setPostulante({ ...postulante, buscado: false });
    try{
      const postulanteBuscado = await getPostulanteByCI(postulante.ci);
      if (!postulanteBuscado.data) {
        alert("No se encontró algún postulante con ese CI.");
        const camposPostulanteRes = await getOlimpiadaCamposPostulante(idOlimpiada);
        const datosIniciales = [];
        camposPostulanteRes.data.forEach(async (campo) =>  {
          const campoNuevo = {};
          campoNuevo["idOlimpiadaCampoPostulante"] = campo.id;
          campoNuevo["idCampoPostulante"] = campo.campo_postulante.id;
          campoNuevo["idDependencia"] = campo.campo_postulante.id_dependencia;
          campoNuevo["tipo_campo"] = campo.campo_postulante.tipo_campo.nombre;
          campoNuevo["esObligatorio"] = campo.esObligatorio;
          campoNuevo["nombre_campo"] = campo.campo_postulante.nombre;
          campoNuevo["valor"] = campo.datos_postulante?.length > 0
          ? campo.datos_postulante[0].valor
          : "";
          if(campo.campo_postulante.tipo_campo.esLista){
            const opcionesCampoPostulante = (await getOpcionesCampoPostulante(campo.campo_postulante.id)).data;
            if(campoNuevo["idDependencia"] === undefined || campoNuevo["idDependencia"] === null) {
              campoNuevo["opciones"] = opcionesCampoPostulante["ROOT"];
              const opcionSeleccionada = campoNuevo["opciones"].find((opcion) => opcion.id === campoNuevo["valor"]);
              if(opcionSeleccionada) {
                campoNuevo["idValor"] = opcionSeleccionada.id;
              }else{
                campoNuevo["idValor"] = null;
              }
            }else{
              campoNuevo["opciones"] = opcionesCampoPostulante;
              const campoDependencia = datosIniciales.find(
                c => c.idCampoPostulante === campoNuevo["idDependencia"]
              );
              if(campoDependencia.idValor !== null && campoDependencia.idValor !== undefined) {
                const opcionSeleccionada = campoNuevo["opciones"][campoDependencia.idValor].find((opcion) => opcion.id === campoNuevo["valor"]);
                if(opcionSeleccionada) {
                  campoNuevo["idValor"] = opcionSeleccionada.id;
                }else{
                  campoNuevo["idValor"] = null;
                }
              }else{
                campoNuevo["idValor"] = null;
              }
            }
          }
          datosIniciales.push(campoNuevo);
        });

        const personaBuscada = (await getPersonaByCI(postulante.ci)).data;
        setPersonaPostulate(personaBuscada);
        if(personaBuscada){
          setPostulante(
            {
              ...postulante,
              buscado: true, 
              idPersona: personaBuscada.id,
              nombres: personaBuscada.nombres,
              apellidos: personaBuscada.apellidos,
              fecha_nacimiento: personaBuscada.fecha_nacimiento,
              datos: datosIniciales
            }
          );
          return; 
        }
        setPostulante( { ...postulante, buscado: true, datos: datosIniciales } );
        return;
      }

      const postulanteEncontrado = postulanteBuscado.data;
      const camposPostulanteRes = await getOlimpiadaCamposPostulante(idOlimpiada, postulanteEncontrado.id);
      const datosIniciales = [];
      camposPostulanteRes.data.forEach(async (campo) =>  {
        const campoNuevo = {};
        campoNuevo["idOlimpiadaCampoPostulante"] = campo.id;
        campoNuevo["idCampoPostulante"] = campo.campo_postulante.id;
        campoNuevo["idDependencia"] = campo.campo_postulante.id_dependencia;
        campoNuevo["tipo_campo"] = campo.campo_postulante.tipo_campo.nombre;
        campoNuevo["esObligatorio"] = campo.esObligatorio;
        campoNuevo["nombre_campo"] = campo.campo_postulante.nombre;
        campoNuevo["valor"] = campo.datos_postulante?.length > 0
        ? campo.datos_postulante[0].valor
        : "";
        if(campo.campo_postulante.tipo_campo.esLista){
          const opcionesCampoPostulante = (await getOpcionesCampoPostulante(campo.campo_postulante.id)).data;
          if(campoNuevo["idDependencia"] === undefined || campoNuevo["idDependencia"] === null) {
            campoNuevo["opciones"] = opcionesCampoPostulante["ROOT"];
            const opcionSeleccionada = campoNuevo["opciones"].find((opcion) => opcion.id === campoNuevo["valor"]);
            if(opcionSeleccionada) {
              campoNuevo["idValor"] = opcionSeleccionada.id;
            }else{
              campoNuevo["idValor"] = null;
            }
          }else{
            campoNuevo["opciones"] = opcionesCampoPostulante;
            const campoDependencia = datosIniciales.find(
              c => c.idCampoPostulante === campoNuevo["idDependencia"]
            );
            if(campoDependencia.idValor !== null && campoDependencia.idValor !== undefined) {
              const opcionSeleccionada = campoNuevo["opciones"][campoDependencia.idValor].find((opcion) => opcion.id === campoNuevo["valor"]);
              if(opcionSeleccionada) {
                campoNuevo["idValor"] = opcionSeleccionada.id;
              }else{
                campoNuevo["idValor"] = null;
              }
            }else{
              campoNuevo["idValor"] = null;
            }
          }
        }
        datosIniciales.push(campoNuevo);
      });
      setPersonaPostulate(postulanteEncontrado.persona);
      setPostulante({
        ...postulante,
        idPersona: postulanteEncontrado.persona.id,
        nombres: postulanteEncontrado.persona.nombres,
        apellidos: postulanteEncontrado.persona.apellidos,
        fecha_nacimiento: postulanteEncontrado.persona.fecha_nacimiento,
        idPostulante: postulanteEncontrado.id,
        buscado: true,
        datos: datosIniciales,
      });
    }catch (error) {
      console.error(error);
      alert("Error al buscar el postulante: " + error.message);
    }finally {
      setIsLoading(false);
    }
    
  };

  const eliminarRegistro = useCallback(() => {
    setPostulante(initialPostulanteState);
    setTutores([]);
    setOpcionesSeleccionadas([]);
    setOpcionesInscripcion([]);
    setFormErrors({});
  }, []);

  {/**ESTA PARTE SE ENCARGA DE LOS TUTORES**/}
  const agregarTutor = async () => {
    // Verifica si hay un tutor sin CI (no permitir agregar otro)
    const existeTutorSinCI = tutores.some(tutor => !tutor.ci.trim());
    if (existeTutorSinCI) {
      alert("No puedes agregar otro tutor hasta completar el CI de los tutores existentes");
      return;
    }

    // Si hay al menos un tutor, verifica si el último debe guardarse
    if (tutores.length >= 1) {
      const ultimoTutor = tutores[tutores.length - 1];
      // Validaciones de campos obligatorios
      if (ultimoTutor.ci.trim() === "") {
        alert("El CI del tutor es obligatorio. Completa el campo antes de agregar otro tutor.");
        return;
      }
      if (ultimoTutor.nombres.trim() === "") {
        alert("El nombre del tutor es obligatorio. Completa el campo antes de agregar otro tutor.");
        return;
      }
      if (ultimoTutor.apellidos.trim() === "") {
        alert("El apellido del tutor es obligatorio. Completa el campo antes de agregar otro tutor.");
        return;
      }
      if (!ultimoTutor.idRol) {
        alert("La relación del tutor es obligatoria. Completa el campo antes de agregar otro tutor.");
        return;
      }
      for (const campo of ultimoTutor.datos) {
        if (campo.esObligatorio && !campo.valor.trim()) {
          alert(`El campo "${campo.nombre_campo}" del tutor es obligatorio. Completa el campo antes de agregar otro tutor.`);
          return;
        }
      }

      try {
        setIsLoading(true);
        // Verifica si el tutor ya existe en la BD
        const tutorBuscado = await getTutor(ultimoTutor.ci);
        let idTutor = null;
        if (tutorBuscado.data) {
          idTutor = tutorBuscado.data.id;
        } else {
          // Si no existe, créalo
          const nuevoTutor = {
            ci: ultimoTutor.ci,
            nombres: ultimoTutor.nombres,
            apellidos: ultimoTutor.apellidos,
          };
          const tutorCreado = (await createTutor(nuevoTutor)).data;
          idTutor = tutorCreado.id;
        }
        // Guarda los datos dinámicos del tutor
        const datosTutorGuardados = {
          id_tutor: idTutor,
          datos: ultimoTutor.datos
        };
        await saveDatosTutor(datosTutorGuardados);

        // Actualiza el tutor en la lista con el idTutor y buscado=true
        setTutores(prevTutores => {
          const nuevosTutores = [...prevTutores];
          nuevosTutores[nuevosTutores.length - 1] = {
            ...nuevosTutores[nuevosTutores.length - 1],
            idTutor: idTutor,
            buscado: true,
          };
          return nuevosTutores;
        });
      } catch (error) {
        alert("Error al guardar el tutor previo: " + error.message);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Ahora sí, agrega el nuevo tutor vacío
    setTutores(prev => [
      ...prev,
      { idPersona: null, idRegistroTutor: null, idTutor: null, ci: '', nombres: '', apellidos: '', fecha_nacimiento: '', idRol: '', buscado: false, datos: [] }
    ]);
  };

  const handleTutorChange = useCallback((index, field, value) => {
    setTutores(prevTutores => prevTutores.map((tutor, i) => {
      if (i !== index) return tutor;

      // Validaciones similares a las del postulante
      if (field === "ci") {
        const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
        const letrasConTilde = /[áéíóúÁÉÍÓÚñÑ]/;
        
        if (caracteresEspeciales.test(value) || letrasConTilde.test(value)) {
          return tutor; // No actualizar
        }
        
        if (!/^[a-zA-Z0-9 ]*$/.test(value)) {
          return tutor; // No actualizar
        }
      }

      if (field === "nombres" || field === "apellidos") {
        const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
        if (caracteresEspeciales.test(value)) {
          return tutor; // No actualizar
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(value)) {
          return tutor; // No actualizar
        }
      }
      
      // Si el campo es directo (nombres, apellidos, ci, etc.)
      if (field in tutor) {
        // Si cambia el CI, resetea buscado
        if (field === "ci") {
          return { ...tutor, [field]: value, buscado: false };
        }
        return { ...tutor, [field]: value };
      }
      
      // Si es un campo dinámico de datos (por nombre_campo)
      return {
        ...tutor,
        datos: tutor.datos.map(dato =>
          dato.nombre_campo === field
            ? { ...dato, valor: value }
            : dato
        ),
      };
    }));
  }, []);

  const eliminarTutor = async (index) =>  {
    if(tutores[index].idRegistroTutor) {
      const idRegistroTutor = tutores[index].idRegistroTutor;
      try{
        setIsLoading(true);
        await deleteRegistroTutor(idRegistroTutor);
      }catch(error) {
        alert("Error al eliminar el registro de tutor: " + error.message);
        return; 
      }finally{
        setIsLoading(false);
      }
    }
    const nuevos = tutores.filter((_, i) => i !== index);
    setTutores(nuevos);
  };

  const buscarTutor = async (index) => {
    const tutor = tutores[index];
    if(tutor.ci === postulante.ci) {
      alert("El CI del tutor no puede ser el mismo que el del postulante.");
      return;
    }
    
    if (!tutor.ci) {
      alert("Por favor, ingrese el CI del tutor antes de buscar.");
      return;
    }
    const tutorBuscado = await getTutor(tutor.ci);
    if (!tutorBuscado.data) {
      alert("No se encontró un tutor con ese CI.");
      const camposTutor = (await getOlimpiadaCamposTutor(idOlimpiada)).data;
      const datosIniciales = [];
      camposTutor.forEach((campo, index) => {
        const campoNuevo = {};
        campoNuevo["idOlimpiadaCampoTutor"] = campo.id;
        campoNuevo["idCampoTutor"] = campo.campo_tutor.id;
        campoNuevo["idDependencia"] = campo.campo_tutor.id_dependencia; 
        campoNuevo["tipo_campo"] = campo.campo_tutor.tipo_campo.nombre;
        campoNuevo["esObligatorio"] = campo.esObligatorio;
        campoNuevo["nombre_campo"] = campo.campo_tutor.nombre;
        campoNuevo["valor"] = campo.datos_tutor?.length > 0
          ? campo.datos_tutor[0].valor
          : "";
        datosIniciales.push(campoNuevo);
      });

      const nuevosTutores = [...tutores];

      const personaBuscada = (await getPersonaByCI(tutor.ci)).data;
      if(personaBuscada){
        nuevosTutores[index] = {
          ...nuevosTutores[index],
          buscado: true, 
          idPersona: personaBuscada.id,
          nombres: personaBuscada.nombres,
          apellidos: personaBuscada.apellidos,
          fecha_nacimiento: personaBuscada.fecha_nacimiento,
          datos: datosIniciales,
        }
        setTutores(nuevosTutores);
        return;
      }
      nuevosTutores[index] = { 
        ...nuevosTutores[index], 
        buscado: true,
        datos: datosIniciales,
      };
      setTutores(nuevosTutores);
      return;
    }
    const camposTutor = (await getOlimpiadaCamposTutor(idOlimpiada, tutorBuscado.data.id)).data;
    const datosIniciales = [];
    camposTutor.forEach((campo) => {
      const campoNuevo = {};
      campoNuevo["idOlimpiadaCampoTutor"] = campo.id;
      campoNuevo["tipo_campo"] = campo.campo_tutor.tipo_campo.nombre;
      campoNuevo["esObligatorio"] = campo.esObligatorio;
      campoNuevo["nombre_campo"] = campo.campo_tutor.nombre;
      campoNuevo["valor"] = campo.datos_tutor.length > 0
        ? campo.datos_tutor[0].valor
        : "";
      datosIniciales.push(campoNuevo);
    });
    const nuevosTutores = [...tutores];
    nuevosTutores[index] = {
      ...nuevosTutores[index],
      idPersona: tutorBuscado.data.persona.id,
      idTutor: tutorBuscado.data.id,
      nombres: tutorBuscado.data.persona.nombres,
      apellidos: tutorBuscado.data.persona.apellidos,
      fecha_nacimiento: tutorBuscado.data.persona.fecha_nacimiento,
      buscado: true,
      datos: datosIniciales,
    };
    setTutores(nuevosTutores);
  };

  {/**ESTA PARTE SE ENCARGA DE LAS OPCIONES DE INSCRIPCIÓN*/}
  const agregarOpcionSeleccionda = () => {
    if(opcionesInscripcion.length === 0) {
      alert("No hay opciones de inscripcion disponibles para el grado seleccionado.");
      return;
    }
    // Contar todas las opciones posibles (todas las categorias de todas las areas)
    const totalOpciones = opcionesInscripcion.reduce((acc, area) => acc + area.niveles_categorias.length, 0);
    if(opcionesSeleccionadas.length === totalOpciones) {
      alert(`No existen más opciones de inscripción disponibles para el grado seleccionado.`);
      return;
    }
    if (typeof maxArea === 'number' && opcionesSeleccionadas.length >= maxArea) {
      alert(`No puedes seleccionar más de ${maxArea} opciones de inscripción en esta olimpiada.`);
      return;
    }
    setOpcionesSeleccionadas([...opcionesSeleccionadas, { idInscripcion: null, idOpcionInscripcion: null, idPago: null }]);
  };

  const actualizarOpcionSeleccionada = (index, campo, valor) => {
    const nuevasOpcionesSeleccionadas = [...opcionesSeleccionadas];
    nuevasOpcionesSeleccionadas[index][campo] = valor;
    setOpcionesSeleccionadas(nuevasOpcionesSeleccionadas);
  };

  const eliminarOpcionSeleccionada = async (index) => {
    if(opcionesSeleccionadas[index].idPago) {
      alert("Esta opción ya tiene una orden de pago asociada. No se puede eliminar");
      return;
    }
    if(opcionesSeleccionadas[index].idInscripcion) {
      const idInscripcion = opcionesSeleccionadas[index].idInscripcion;
      try{
        setIsLoading(true);
        await deleteInscripcion(idInscripcion);
      }catch(error) {
        alert("Error al eliminar la inscripcion: " + error.message);
        return;
      }finally{
        setIsLoading(false);
      }
    }
    const nuevasOpcionesSeleccionadas = opcionesSeleccionadas.filter((_, i) => i !== index);
    setOpcionesSeleccionadas(nuevasOpcionesSeleccionadas);
  };

  const validarDatos = () => {
    const errors = {};
    // Validar campos básicos del postulante
    if (!postulante.ci.trim()) errors.ci = "El Carnet de Identidad es obligatorio";
    if (!postulante.nombres.trim()) errors.nombres = "El nombre es obligatorio";
    if (!postulante.apellidos.trim()) errors.apellidos = "El apellido es obligatorio";
    if (!postulante.fecha_nacimiento.trim()) {
      errors.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const esFechaValida =
        /^\d{2}\/\d{2}\/\d{4}$/.test(postulante.fecha_nacimiento) ||
        /^\d{4}-\d{2}-\d{2}$/.test(postulante.fecha_nacimiento);
      if (!esFechaValida) errors.fecha_nacimiento = "La fecha debe tener formato dd/mm/aaaa";
    }

    if (!postulante.grado?.id) errors.grado = "El grado es obligatorio";

    // Validar campos dinámicos obligatorios del postulante
    postulante.datos.forEach((campo, index) => {
      if (campo.esObligatorio && !campo.valor.trim()) {
        errors[`datos.${index}`] = `El campo "${campo.nombre_campo}" es obligatorio`;
      }
    });

    // Validar tutores
    if (tutores.length === 0) {
      errors.tutores = "Debe registrar al menos un tutor";
    }

    tutores.forEach((tutor, index) => {
      if (!tutor.ci.trim()) errors[`tutor.${index}.ci`] = "El CI es obligatorio";
      if (!tutor.nombres.trim()) errors[`tutor.${index}.nombres`] = "El nombre es obligatorio";
      if (!tutor.apellidos.trim()) errors[`tutor.${index}.apellidos`] = "El apellido es obligatorio";
      if (!tutor.idRol) errors[`tutor.${index}.idRol`] = "La relación es obligatoria";

      tutor.datos.forEach((campo, campoIndex) => {
        if (campo.esObligatorio && !campo.valor.trim()) {
          errors[`tutor.${index}.datos.${campoIndex}`] = `El campo "${campo.nombre_campo}" del tutor #${index + 1} es obligatorio`;
        }
      });
    });

    // Validar opciones de inscripción
    if (opcionesSeleccionadas.length === 0) {
      errors.opciones = "Debe seleccionar al menos un área de inscripción";
    }
    opcionesSeleccionadas.forEach((opcion, index) => {
      if (!opcion.idOpcionInscripcion) {
        errors[`opcion.${index}`] = "Debe seleccionar un área y categoría";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const enviarDatos = async () => {
    if (!validarDatos()) return;
    setShowConfirmModal(true);
  };

  const confirmarEnvio = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    
    try {
      const postulanteGuardado = {...postulante};
      const opcionesGuardadas = [...opcionesSeleccionadas];
      const tutoresGuardados = [...tutores];

      if(!postulanteGuardado.idRegistro) {
        if(!postulanteGuardado.idPostulante) {
          const nuevoPostulante = {
            ci: postulanteGuardado.ci,
            nombres: postulanteGuardado.nombres,
            apellidos: postulanteGuardado.apellidos,
            fecha_nacimiento: postulanteGuardado.fecha_nacimiento,
          }
          const postulanteCreado = (await createPostulante(nuevoPostulante)).data;

          const nuevoRegistro = {
            id_olimpiada: idOlimpiada,
            id_encargado: idEncargado,
            id_postulante: postulanteCreado.id,
            id_grado: postulanteGuardado.grado.id,
          }

          const registroCreado = (await createRegistro(nuevoRegistro)).data;
          postulanteGuardado.idPostulante = postulanteCreado.id;
          postulanteGuardado.idRegistro = registroCreado.id;
        }else{
          const nuevoRegistro = {
            id_olimpiada: idOlimpiada,
            id_encargado: idEncargado,
            id_postulante: postulanteGuardado.idPostulante,
            id_grado: postulanteGuardado.grado.id,
          }
          const registroCreado = (await createRegistro(nuevoRegistro)).data;
          postulanteGuardado["idRegistro"] = registroCreado.id;
        }
      }

      const datosPostulanteGuardados = {
        id_postulante: postulanteGuardado.idPostulante,
        datos: postulanteGuardado.datos
      }

      await saveDatosPostulante(datosPostulanteGuardados);

      opcionesGuardadas.forEach(async (opcion) => {
        if(!opcion.idInscripcion) {
          const nuevoInscripcion = {
            id_registro: postulanteGuardado.idRegistro,
            id_opcion_inscripcion: opcion.idOpcionInscripcion,
          }
          const inscripcionCreada = (await createInscripcion(nuevoInscripcion)).data;
          opcion.idInscripcion = inscripcionCreada.id;
        }
      });

      tutoresGuardados.forEach(async (tutor) => {
        if(!tutor.idRegistroTutor) {
          if(!tutor.idTutor) {
            const nuevoTutor = {
              ci: tutor.ci,
              nombres: tutor.nombres,
              apellidos: tutor.apellidos,
            }
            const tutorCreado = (await createTutor(nuevoTutor)).data;
            tutor.idTutor = tutorCreado.id;
          }
          const nuevoRegistroTutor = {
            id_registro: postulanteGuardado.idRegistro,
            id_tutor: tutor.idTutor,
            id_rol_tutor: tutor.idRol,
          }
          const registroTutorCreado = (await createRegistroTutor(nuevoRegistroTutor)).data;
          tutor.idRegistroTutor = registroTutorCreado.id;
        }
        const datosTutorGuardados = {
          id_tutor: tutor.idTutor,
          datos: tutor.datos
        }
        await saveDatosTutor(datosTutorGuardados);
      });
      
      setShowSuccessModal(true);
      eliminarRegistro();
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      alert("Error al guardar los datos: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  if(isLoading) { 
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner size="xl" text="Cargando formulario..." />
      </div>
    ); 
  }
  
  const handleOpcionSeleccionPostulanteChange = (index, valor, opciones) => {
    const idValor = opciones.find(opcion => opcion.valor === valor)?.id || null;
    setPostulante(prev => ({
      ...prev,
      datos: prev.datos.map((dato, i) =>
        i === index ? { ...dato, valor, idValor } : dato
      ),
    }));
  };

  return (
    <div className={`max-w-5xl mx-auto p-4 ${deviceInfo.isMobile ? 'px-2' : 'p-6'}`}>
      <Card>
        <CardHeader>
          <h1 className={`${deviceInfo.isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-900`}>
            Registro de Postulante
          </h1>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className={`grid grid-cols-1 ${deviceInfo.isDesktop ? 'md:grid-cols-2' : ''} gap-4 items-start`}>
            <div className="space-y-4">
              <FormField
                label="Carnet de Identidad"
                name="ci"
                value={postulante.ci}
                onChange={(e) => handlePostulanteChange("ci", e.target.value)}
                disabled={postulante.idPersona}
                placeholder="Ingrese el CI del postulante"
                required
                error={formErrors.ci}
              />

              {postulante.buscado && (
                <>
                  <FormField
                    label="Nombre(s)"
                    name="nombres"
                    value={postulante.nombres}
                    onChange={(e) => handlePostulanteChange("nombres", e.target.value)}
                    disabled={postulante.idPersona}
                    placeholder="Ingrese el nombre del postulante"
                    required
                    error={formErrors.nombres}
                  />

                  <FormField
                    label="Apellido(s)"
                    name="apellidos"
                    value={postulante.apellidos}
                    onChange={(e) => handlePostulanteChange("apellidos", e.target.value)}
                    disabled={postulante.idPersona}
                    placeholder="Ingrese el apellido del postulante"
                    required
                    error={formErrors.apellidos}
                  />

                  <FormField
                    label="Fecha de Nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formatDate(postulante.fecha_nacimiento)}
                    onChange={(e) => handlePostulanteChange("fecha_nacimiento", e.target.value)}
                    disabled={personaPostulante?.fecha_nacimiento}
                    required
                    error={formErrors.fecha_nacimiento}
                  />

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Grado <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={postulante.grado?.id || ""}
                      onChange={(e) => handleGradoChange(e.target.value)}
                      className={`w-full mt-1 px-3 py-2 border rounded-md ${
                        postulante.idRegistro ? "bg-gray-100" : ""
                      } ${formErrors.grado ? "border-red-500" : "border-gray-300"}`}
                      disabled={postulante.idRegistro}
                    >
                      <option value="">Seleccione un Grado</option>
                      {Object.values(catalogoGrados).map((grado) => (
                        <option key={grado.id} value={grado.id}>
                          {grado.nombre}
                        </option>
                      ))}
                    </select>
                    {formErrors.grado && (
                      <span className="text-sm text-red-500">{formErrors.grado}</span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className={`flex ${deviceInfo.isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
                <Button 
                  onClick={buscarRegistro} 
                  variant="primary" 
                  size={deviceInfo.isMobile ? "md" : "lg"}
                  className={deviceInfo.isMobile ? "w-full" : ""}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </Button>

                <Button 
                  onClick={eliminarRegistro} 
                  variant="danger" 
                  size={deviceInfo.isMobile ? "md" : "lg"}
                  className={deviceInfo.isMobile ? "w-full" : ""}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {postulante.buscado && postulante.datos.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-800">Datos Adicionales</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {postulante.datos.map((campo, index) => (
                      <FormField
                        key={index}
                        label={campo.nombre_campo}
                        name={`datos_${index}`}
                        type={campo.tipo_campo}
                        value={campo.valor}
                        onChange={(e) =>
                          handlePostulanteChange(`datos[${index}].valor`, e.target.value)
                        }
                        required={campo.esObligatorio}
                        error={formErrors[`datos.${index}`]}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {postulante.buscado && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Tutores</h3>
                {formErrors.tutores && (
                  <p className="text-sm text-red-500">{formErrors.tutores}</p>
                )}
                {tutores.map((tutor, index) => (
                  <TutorForm
                    key={index}
                    tutor={tutor}
                    index={index}
                    rolesTutor={rolesTutor}
                    onTutorChange={handleTutorChange}
                    onBuscarTutor={buscarTutor}
                    onEliminarTutor={eliminarTutor}
                    formErrors={formErrors}
                  />
                ))}
                {tutores.length < 2 && (
                  <Button
                    onClick={agregarTutor}
                    variant="primary"
                    className={`${deviceInfo.isMobile ? 'w-full' : 'w-full sm:w-auto'}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Tutor
                  </Button>
                )}
              </div>

              <InscripcionForm
                opcionesInscripcion={opcionesInscripcion}
                opcionesSeleccionadas={opcionesSeleccionadas}
                onAgregarOpcion={agregarOpcionSeleccionda}
                onActualizarOpcion={actualizarOpcionSeleccionada}
                onEliminarOpcion={eliminarOpcionSeleccionada}
                maxArea={maxArea}
                formErrors={formErrors}
              />

              <div className={`flex ${deviceInfo.isMobile ? 'justify-center' : 'justify-end'}`}>
                <Button
                  onClick={enviarDatos}
                  variant="success"
                  size={deviceInfo.isMobile ? "md" : "lg"}
                  className={`font-semibold ${deviceInfo.isMobile ? 'w-full' : ''}`}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmarEnvio}
        variant="warning"
        title="Confirmar registro"
        message="¿Está seguro que desea guardar los datos del postulante?"
        confirmText="Guardar"
        cancelText="Cancelar"
        isLoading={isLoading}
      />

      {/* Modal de éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        variant="success"
        title="Registro exitoso"
        message="Los datos del postulante han sido guardados correctamente."
        confirmText="Aceptar"
        showCancelButton={false}
      />
    </div>
  ); 
};

export default RegistrarPostulante;