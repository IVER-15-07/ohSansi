import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Search } from "lucide-react";
import Cargando from "../Cargando";

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


const RegistrarPostulante = () => {
  const {idOlimpiada, idEncargado } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [maxArea, setMaxArea] = useState(null);

  const [personaPostulante, setPersonaPostulate] = useState(null); 
  const [postulante, setPostulante] = useState({idPersona: null, ci: "", nombres: "", apellidos: "", fecha_nacimiento: "", grado: {id: "", nombre:""}, idPostulante: null, idRegistro: null, buscado: false, datos: []});

  const [catalogoGrados, setCatalogoGrados] = useState([]);

  const [rolesTutor, setRolesTutor] = useState([]);
  const [tutores, setTutores] = useState([]);

  const [opcionesInscripcionCatalogo, setOpcionesInscripcionCatalogo] = useState([]);
  const [opcionesInscripcion, setOpcionesInscripcion] = useState([]); 
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState([]);

  // Funciones para formatear y parsear fechas
  const defaultFormatDate = (dateStr) => {
    if (!dateStr) return "";
    // Espera formato aaaa-mm-dd
    const [yyyy, mm, dd] = dateStr.split("-");
    if (!yyyy || !mm || !dd) return "";
    return `${dd}/${mm}/${yyyy}`;
  };

  const defaultParseDate = (dateStr) => {
    // Espera formato dd/mm/aaaa
    const [dd, mm, yyyy] = dateStr.split("/");
    if (!yyyy || !mm || !dd) return "";
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };

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
      console.log("Registro encontrado:", registroEncontrado);
      const camposPostulanteRes = await getOlimpiadaCamposPostulante(idOlimpiada, registroEncontrado.id_postulante);
      const datosIniciales = [];
      camposPostulanteRes.data.forEach((campo) => {
        const campoNuevo = {};
        campoNuevo["idOlimpiadaCampoPostulante"] = campo.id;
        campoNuevo["tipo_campo"] = campo.campo_postulante.tipo_campo.nombre;
        campoNuevo["esObligatorio"] = campo.esObligatorio;
        campoNuevo["nombre_campo"] = campo.campo_postulante.nombre;
        campoNuevo["valor"] = campo.datos_postulante?.length > 0
        ? campo.datos_postulante[0].valor
        : "";
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
          const datosIniciales = camposTutor.map((campo) => ({
            idOlimpiadaCampoTutor: campo.id,
            tipo_campo: campo.campo_tutor.tipo_campo.nombre,
            esObligatorio: campo.esObligatorio,
            nombre_campo: campo.campo_tutor.nombre,
            valor: campo.datos_tutor?.length > 0 ? campo.datos_tutor[0].valor : "",
          }));
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
      console.log("nivelesFiltrados", nivelesFiltrados);
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

  {/*FUNCIONES RELACIONADAS A POSTULANTE*/}
  const handlePostulanteChange = (field, value) => {
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
  };

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
        camposPostulanteRes.data.forEach((campo) => {
          const campoNuevo = {};
          campoNuevo["idOlimpiadaCampoPostulante"] = campo.id;
          campoNuevo["tipo_campo"] = campo.campo_postulante.tipo_campo.nombre;
          campoNuevo["esObligatorio"] = campo.esObligatorio;
          campoNuevo["nombre_campo"] = campo.campo_postulante.nombre;
          campoNuevo["valor"] = campo.datos_postulante?.length > 0
          ? campo.datos_postulante[0].valor
          : "";
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
      camposPostulanteRes.data.forEach((campo) => {
        const campoNuevo = {};
        campoNuevo["idOlimpiadaCampoPostulante"] = campo.id;
        campoNuevo["tipo_campo"] = campo.campo_postulante.tipo_campo.nombre;
        campoNuevo["esObligatorio"] = campo.esObligatorio;
        campoNuevo["nombre_campo"] = campo.campo_postulante.nombre;
        campoNuevo["valor"] = campo.datos_postulante?.length > 0
        ? campo.datos_postulante[0].valor
        : "";
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

  const eliminarRegistro = () => {
    setPostulante({idPersona: null, ci: "", nombres: "", apellidos: "", fecha_nacimiento: "", grado: {id: "", nombre:""}, idPostulante: null, idRegistro: null, buscado: false, datos: []});
    setTutores([]);
    setOpcionesSeleccionadas([]);
    setOpcionesInscripcion([]);
  };

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

  const handleTutorChange = (index, field, value) => {
    setTutores(prevTutores => prevTutores.map((tutor, i) => {
      if (i !== index) return tutor;

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
  };

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
    console.log(tutor)
    if (!tutor.ci) {
      alert("Por favor, ingrese el CI del tutor antes de buscar.");
      return;
    }
    const tutorBuscado = await getTutor(tutor.ci);
    console.log(tutorBuscado);
    if (!tutorBuscado.data) {
      alert("No se encontró un tutor con ese CI.");
      const camposTutor = (await getOlimpiadaCamposTutor(idOlimpiada)).data;
      console.log("camposTutor", camposTutor);
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
    console.log("campos", camposTutor);
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
    // Validar campos básicos del postulante
    if (!postulante.ci.trim()) return "El Carnet de Identidad es obligatorio.";
    if (!postulante.nombres.trim()) return "El nombre es obligatorio.";
    if (!postulante.apellidos.trim()) return "El apellido es obligatorio.";
    if (!postulante.fecha_nacimiento.trim()) return "La fecha de nacimiento es obligatoria.";
    // Validar formato dd/mm/aaaa o aaaa-mm-dd
    const esFechaValida =
      /^\d{2}\/\d{2}\/\d{4}$/.test(postulante.fecha_nacimiento) ||
      /^\d{4}-\d{2}-\d{2}$/.test(postulante.fecha_nacimiento);
    if (!esFechaValida) return "La fecha de nacimiento debe tener el formato dd/mm/aaaa.";
    if (!postulante.grado?.id) return "El grado es obligatorio.";
    // Validar campos dinámicos obligatorios del postulante
    for (const campo of postulante.datos) {
      if (campo.esObligatorio && !campo.valor.trim()) {
        return `El campo "${campo.nombre_campo}" es obligatorio.`;
      }
    }
    // Validar al menos un tutor (si aplica)
    if (tutores.length === 0) return "Debe registrar al menos un tutor.";
    for (const [i, tutor] of tutores.entries()) {
      if (!tutor.ci.trim()) return `El CI del tutor #${i + 1} es obligatorio.`;
      if (!tutor.nombres.trim()) return `El nombre del tutor #${i + 1} es obligatorio.`;
      if (!tutor.apellidos.trim()) return `El apellido del tutor #${i + 1} es obligatorio.`;
      if (!tutor.idRol) return `La relación del tutor #${i + 1} es obligatoria.`;
      for (const campo of tutor.datos) {
        if (campo.esObligatorio && !campo.valor.trim()) {
          return `El campo "${campo.nombre_campo}" del tutor #${i + 1} es obligatorio.`;
        }
      }
    }
    // Validar al menos un área de inscripción
    if (opcionesSeleccionadas.length === 0) return "Debe seleccionar al menos un área de inscripción.";
    for (const [i, opcion] of opcionesSeleccionadas.entries()) {
      if (!opcion.idOpcionInscripcion) return `Debe seleccionar un área y categoría en la opción #${i + 1}.`;
    }
    return null; // Todo OK
  };
  
  const enviarDatos = async () => {
    const errorValidandoDatos = validarDatos();
    if (errorValidandoDatos) {
      alert(errorValidandoDatos);
      return;
    }
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
      alert("Datos guardados correctamente");
      eliminarRegistro();
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      alert("Error al guardar los datos: " + error.message);
    }finally {
      setIsLoading(false);
    }
  };

  if(isLoading) { return <Cargando />; }
  
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Registro de Postulante</h1>
      <div className="flex flex-col md:flex-row gap-4 items-center">

        <div>
          <label className="text-sm font-medium text-gray-700">Carnet de Identidad <span className="text-red-500">*</span> </label>
          <input type="text" disabled={postulante.idPersona} value={postulante.ci} onChange={(e) => handlePostulanteChange("ci", e.target.value)} 
          className={`w-full px-3 py-2 border rounded-md
            ${postulante.idPersona ? "bg-gray-200 cursor-not-allowed" : "bg-white"}
          `}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button type="button" onClick={() => buscarRegistro()} className="p-2 bg-blue-500 text-white rounded-md">
            <Search size={16} />
          </button>

          <button type="button" onClick={() => eliminarRegistro()} className="p-2 bg-red-500 text-white rounded-md">
            <Trash2 size={16} />
          </button>
        </div>
        {postulante.buscado && (
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre(s) <span className="text-red-500">*</span> </label>
              <input type="text" disabled={postulante.idPersona} value={postulante.nombres} onChange={(e) => handlePostulanteChange("nombres", e.target.value)} 
              className={`w-full px-3 py-2 border rounded-md
                ${postulante.idPersona ? "bg-gray-200 cursor-not-allowed" : "bg-white"}
              `}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Apellido(s)   <span className="text-red-500">*</span> </label>
              <input type="text" disabled={postulante.idPersona} value={postulante.apellidos} onChange={(e) => handlePostulanteChange("apellidos", e.target.value)} 
              className={`w-full px-3 py-2 border rounded-md 
                ${postulante.idPersona ? "bg-gray-200 cursor-not-allowed" : "bg-white"}
              `}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de Nacimiento <span className="text-red-500">*</span> </label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                disabled={personaPostulante?.fecha_nacimiento}
                value={
                  /^\d{4}-\d{2}-\d{2}$/.test(postulante.fecha_nacimiento)
                    ? defaultFormatDate(postulante.fecha_nacimiento)
                    : postulante.fecha_nacimiento
                }
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9/]/g, "");
                  // Si tiene el formato correcto, parsear y guardar en formato aaaa-mm-dd
                  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                    handlePostulanteChange("fecha_nacimiento", defaultParseDate(val));
                  } else {
                    // Si no, guardar el texto tal cual (para que el usuario pueda escribir)
                    handlePostulanteChange("fecha_nacimiento", val);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md ${personaPostulante?.fecha_nacimiento ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Grado <span className="text-red-500">*</span> </label>
              <div>
                <select 
                  value={postulante.grado?.id || ""} 
                  onChange={(e) => handleGradoChange(e.target.value)} 
                  className={`flex-1 px-3 py-2 border rounded-md
                    ${postulante.idRegistro ? "bg-gray-200" : "bg-white"}
                  `}
                  disabled={postulante.idRegistro}
                >
                  <option value="">Seleccione un Grado</option>
                  {Object.values(catalogoGrados).map((grado) => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        )}
      </div>

      {postulante.buscado && (
        <div>
          {/**ESTA PARTE CONSISTIRA DE LOS DATOS QUE SE LE PIDE AL POSTULANTE PARA INSCRIBIRSE A UNA OLIMPIADA**/}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Datos del Postulante</h3>
            {postulante.datos.map((campo, index) => {
              switch (campo.tipo_campo) {
                case "text":
                  return (
                    <div key={index} className="mb-4">
                      <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                      <input type="text" value={campo.valor} onChange={(e) => handlePostulanteChange(`datos[${index}].valor`, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                  );
                case "number":
                  return (
                    <div key={index} className="mb-4">
                      <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                      <input type="number" value={campo.valor} onChange={(e) => handlePostulanteChange(`datos[${index}].valor`, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                  );
                case "date":
                  return (
                    <div key={index} className="mb-4">
                      <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                      <input type="date" value={campo.valor} onChange={(e) => handlePostulanteChange(`datos[${index}].valor`, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                  );
                case "tel":
                  return (
                    <div key={index} className="mb-4">
                      <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                      <input type="tel" value={campo.valor} onChange={(e) => handlePostulanteChange(`datos[${index}].valor`, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                  );
                case "email":
                  return (
                    <div key={index} className="mb-4">
                      <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                      <input type="email" value={campo.valor} onChange={(e) => handlePostulanteChange(`datos[${index}].valor`, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                  );
                default:
                  return null;
                }
              })}

          </div> 

          {/**ESTA PARTE CONSISTIRA DE LOS DATOS DE SUS TUTORES**/}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Tutores</h3>
            {tutores.map((tutor, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-center">
                <div>
                  <label className="text-sm font-medium text-gray-700" >Carnet de Identidad <span className="text-red-500">*</span> </label>
                  <input 
                    type="text" 
                    disabled={tutor.idPersona} 
                    value={tutor.ci} onChange={(e) => handleTutorChange(index, "ci", e.target.value)} 
                    className={`w-full px-3 py-2 border rounded-md text-sm font-medium text-gray-700 ${tutor.idPersona ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                  />
                </div>
    
                <button type="button" onClick={() => buscarTutor(index)} disabled={tutor.idTutor} className="p-2 bg-blue-500 text-white rounded-md">
                  <Search size={16} />
                </button>
    
                <button type="button" onClick={() => eliminarTutor(index)} className="p-2 bg-red-500 text-white rounded-md">
                  <Trash2 size={16} />
                </button>
    
                {tutor.buscado && (
                  <div className="w-full mt-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombre(s) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        disabled={tutor.idPersona} 
                        value={tutor.nombres} 
                        onChange={(e) => handleTutorChange(index, "nombres", e.target.value)} 
                        className={`w-full px-3 py-2 border rounded-md text-sm font-medium text-gray-700 ${tutor.idPersona ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Apellido(s) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        disabled={tutor.idPersona} 
                        value={tutor.apellidos} onChange={(e) => handleTutorChange(index, "apellidos", e.target.value)} 
                        className={`w-full px-3 py-2 border rounded-md text-sm font-medium text-gray-700 ${tutor.idPersona ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                      />
                    </div>
                    {tutor.datos.map((campo, idx) => {
                      switch (campo.tipo_campo) {
                        case "text":
                          return (
                            <div key={idx} className="mb-4">
                              <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                              <input type="text" value={campo.valor} onChange={(e) => handleTutorChange(index, campo.nombre_campo, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                          );
                        case "number":
                          return (
                            <div key={idx} className="mb-4">
                              <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                              <input type="number" value={campo.valor} onChange={(e) => handleTutorChange(index, campo.nombre_campo, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                          );
                        case "date":
                          return (
                            <div key={idx} className="mb-4">
                              <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                              <input type="date" value={campo.valor} onChange={(e) => handleTutorChange(index, campo.nombre_campo, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                          );
                        case "tel":
                          return (
                            <div key={idx} className="mb-4">
                              <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                              <input type="tel" value={campo.valor} onChange={(e) => handleTutorChange(index, campo.nombre_campo, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                          );
                        case "email":
                          return (
                            <div key={idx} className="mb-4">
                              <label className="text-sm font-medium text-gray-700">{campo.nombre_campo} {campo.esObligatorio && (<span className="text-red-500">*</span>)}</label>
                              <input type="email" value={campo.valor} onChange={(e) => handleTutorChange(index, campo.nombre_campo, e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                    <div >
                      <label className="text-sm font-medium text-gray-700">Relación con el Postulante <span className="text-red-500">*</span> </label>
                      <div>
                        <select 
                          value={tutor.idRol} 
                          onChange={(e) => handleTutorChange(index, 'idRol', e.target.value)} 
                          className={`flex-1 px-3 py-2 border rounded-md ${tutor.idRegistroTutor ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                          disabled={tutor.idRegistroTutor}
                        >
                          <option value="">Seleccione un Rol</option>
                          {Object.entries(rolesTutor).map(([id, rolTutor]) => (
                            <option key={rolTutor.id} value={rolTutor.id}>{rolTutor.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
    
                )}
              </div>
            ))}
            {tutores.length < 2 && (
              <button type="button" onClick={agregarTutor} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Plus size={16} /> Agregar Tutor
              </button>
            )}
          </div>
          
          {/**ESTA PARTE CONSISTIRA DE LAS AREAS A LAS QUE SE INSCRIBE EL POSTULANTE**/}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Áreas de Inscripción</h3>
            {opcionesSeleccionadas.map((opcionSeleccionada, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-center">
                <select
                  value={opcionSeleccionada.idOpcionInscripcion}
                  onChange={e => actualizarOpcionSeleccionada(index, 'idOpcionInscripcion', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccione área y categoría</option>
                  {opcionesInscripcion.flatMap(area =>
                    area.niveles_categorias
                      .filter(cat =>
                        !opcionesSeleccionadas.some(
                          (sel, idx) => sel.idOpcionInscripcion === String(cat.id_opcion_inscripcion) && idx !== index
                        )
                      )
                      .map(cat => (
                        <option
                          key={cat.id_opcion_inscripcion}
                          value={cat.id_opcion_inscripcion}
                        >
                          {area.nombre} - {cat.nombre}
                        </option>
                      ))
                  )}
                </select>
                <button type="button" onClick={() => eliminarOpcionSeleccionada(index)} className="p-2 bg-red-500 text-white rounded-md">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={agregarOpcionSeleccionda}
              className={`flex items-center gap-2 px-4 py-2 ${((typeof maxArea === 'number' && opcionesSeleccionadas.length >= maxArea) || opcionesSeleccionadas.length === opcionesInscripcion.reduce((acc, area) => acc + area.niveles_categorias.length, 0) || opcionesInscripcion.length === 0) ? "bg-gray-200" : "bg-blue-600 text-white rounded-md hover:bg-blue-700" } `}
              
            >
              <Plus size={16} /> Agregar Área
            </button>
          
          </div>

          {/**AQUI ESTARÁ el BOTÓN DE GUARDADO**/}
          <div>
            <button type="button" className="flex gap-3 p-2 bg-green-500 text-white rounded-md" onClick={enviarDatos}>
              <Plus size={16} />
              <label>GUARDAR</label>
            </button>
          </div> 
        </div>
      )
      }
    </div>
  ); 
};

export default RegistrarPostulante;