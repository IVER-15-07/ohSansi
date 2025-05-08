import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormulario, saveDatosInscripcion, createRegistro } from "../../../service/formulario.api";
import { getOpcionesInscripcion } from "../../../service/opciones_inscripcion.api";
import { Plus, Trash2, Search } from "lucide-react";
import { getGrados } from "../../../service/grados.api";
import { getTutor, createTutor, getRolesTutor} from "../../../service/tutor.api";

const RegistrarPostulante = () => {
  const {idOlimpiada, idEncargado } = useParams();

  const [catalogoGrados, setCatalogoGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);

  const [tutores, setTutores] = useState([]);
  const [rolesTutor, setRolesTutor] = useState([]);

  const [opcionesInscripcion, setOpcionesInscripcion] = useState([]);
  const [selecciones, setSelecciones] = useState([]);

  const [secciones, setSecciones] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [datosPostulante, setDatosPostulante] = useState({ nombres: '', apellidos: '', ci: '' });
  const [idRegistros, setIdRegistros] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const seccionesRes = await getFormulario(idOlimpiada);
        const opcionesRes = await getOpcionesInscripcion(idOlimpiada);
        const gradosRes = await getGrados();
        const rolesRes = await getRolesTutor();

        setRolesTutor(rolesRes.data);
        setCatalogoGrados(gradosRes.data);
        setSecciones(seccionesRes.data);
        setOpcionesInscripcion(opcionesRes.data);
        const initialValues = {};
        seccionesRes.data.forEach(sec => {
          sec.campos_inscripcion.forEach(campo => {
            initialValues[campo.id] = "";
          });
        });
        setFormValues(initialValues);
      } catch (err) {
        setError("Error al cargar el formulario");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [idOlimpiada]);

  const agregarTutor = () => {
    const existeTutorSinCI = tutores.some(tutor => !tutor.ci.trim());
  
    // Si hay algún tutor con CI vacío, mostrar alerta y no permitir agregar más
    if (existeTutorSinCI) {
      alert("No puedes agregar otro tutor hasta completar el CI de los tutores existentes");
      return;
    }
    setTutores([...tutores, { idTutor:'', ci: '', nombres: '', apellidos: '', correo: '', idRol: '', buscado: false, encontrado: false }]);
  }

  const handleTutorChange = (index, field, value) => {
    const nuevosTutores = [...tutores];
    nuevosTutores[index][field] = value;
    if(field === "ci") {
      nuevosTutores[index].buscado = false; // Resetear el estado de buscado al cambiar el CI
    };
    setTutores(nuevosTutores);
  };

  const eliminarTutor = (index) => {
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
      const nuevosTutores = [...tutores];
      nuevosTutores[index] = { ...nuevosTutores[index], buscado: true };
      setTutores(nuevosTutores);
      return;
    }
    const nuevosTutores = [...tutores];
    nuevosTutores[index] = {
      ...nuevosTutores[index],
      idTutor: tutorBuscado.data.id,
      nombres: tutorBuscado.data.nombres,
      apellidos: tutorBuscado.data.apellidos,
      correo: tutorBuscado.data.correo,
      buscado: true,
      encontrado: true,
    };
    setTutores(nuevosTutores);
  };

  const guardarTutores = async () => {
    for (const [index, tutor] of tutores.entries()) {
      if (!tutor.ci || !tutor.nombres || !tutor.apellidos || !tutor.correo || !tutor.idRol) {
        alert("Por favor, complete todos los campos del tutor antes de guardar.");
        throw new Error("Campos incompletos");
      }
      if (tutor.encontrado) {
        continue;
      }
      console.log(index, tutor);
      try {
        const data = {
          ci: tutor.ci,
          nombres: tutor.nombres,
          apellidos: tutor.apellidos,
          correo: tutor.correo,
        };
        const tutorRes = await createTutor(data);
        console.log(tutorRes.data);
        handleTutorChange(index, 'idTutor', tutorRes.data.id);
        handleTutorChange(index, 'encontrado', true);
      } catch (error) {
        alert("Error al guardar los tutores: " + error.message);
      }
    }
  };

  const handleFormChange = (campoId, value) => {
    setFormValues({ ...formValues, [campoId]: value });
  };

  const handlePostulanteChange = (field, value) => {
    setDatosPostulante({ ...datosPostulante, [field]: value });
  };

  const agregarArea = () => {
    if (selecciones.length >= 2) return;
    setSelecciones([...selecciones, { areaId: '', opcionInscripcionId: '' }]);
  };

  const actualizarSeleccion = (index, campo, valor) => {
    const nuevas = [...selecciones];
    nuevas[index][campo] = valor;
    setSelecciones(nuevas);
  };

  const eliminarSeleccion = (index) => {
    const nuevas = selecciones.filter((_, i) => i !== index);
    setSelecciones(nuevas);
  };

  const guardarRegistros = async () => {
    try {
      setIsLoading(true);
      for (const seleccion of selecciones) {
        const data = {
          ...datosPostulante,
          id_encargado: idEncargado,
          id_opcion_inscripcion: seleccion.opcionInscripcionId
        };
        const registroRes = await createRegistro(data);
        const registro = registroRes.data;
        await saveDatosInscripcion({ formValues }, registro.id);
        setIdRegistros((prev) => [...prev, registro.id]);
      }
      alert("Postulante inscrito con éxito");
    } catch (error) {
      alert("Error al registrar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const guardarRegistrosTutores = async () => {

  }

  const handleSubmit = async () => {
    await guardarTutores();
    await guardarRegistros();
  };
  console.log(tutores);
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Registro de Postulante</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Nombres</label>
          <input type="text" value={datosPostulante.nombres} onChange={(e) => handlePostulanteChange("nombres", e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Apellidos</label>
          <input type="text" value={datosPostulante.apellidos} onChange={(e) => handlePostulanteChange("apellidos", e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Carnet de Identidad</label>
          <input type="text" value={datosPostulante.ci} onChange={(e) => handlePostulanteChange("ci", e.target.value)} className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Grado</label>
          <div>
            <select value={gradoSeleccionado} onChange={(e) => setGradoSeleccionado(e.target.value)} className="flex-1 px-3 py-2 border rounded-md">
                <option value="">Seleccione un Grado</option>
                {Object.entries(catalogoGrados).map(([id, grado]) => (
                  <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {secciones.map((seccion) => (
        <div key={seccion.id} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{seccion.nombre}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seccion.campos_inscripcion.map((campo) => (
              <div key={campo.id}>
                <label className="text-sm text-gray-700">{campo.nombre}</label>
                <input
                  type={campo.tipo_campo.nombre || 'text'}
                  value={formValues[campo.id] || ''}
                  onChange={(e) => handleFormChange(campo.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Tutores</h3>
        {tutores.map((tutor, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700">Carnet de Identidad</label>
              <input type="text" disabled={tutor.encontrado} value={tutor.ci} onChange={(e) => handleTutorChange(index, "ci", e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>

            <button type="button" onClick={() => buscarTutor(index)} className="p-2 bg-blue-500 text-white rounded-md">
              <Search size={16} />
            </button>

            <button type="button" onClick={() => eliminarTutor(index)} className="p-2 bg-red-500 text-white rounded-md">
              <Trash2 size={16} />
            </button>

            {tutor.buscado && (
              <div className="w-full mt-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" disabled={tutor.encontrado} value={tutor.nombres} onChange={(e) => handleTutorChange(index, "nombres", e.target.value)} className="w-full px-3 py-2 border rounded-md"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Apellidos</label>
                  <input type="text" disabled={tutor.encontrado} value={tutor.apellidos} onChange={(e) => handleTutorChange(index, "apellidos", e.target.value)} className="w-full px-3 py-2 border rounded-md"  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Correo</label>
                  <input type="text" disabled={tutor.encontrado} value={tutor.correo} onChange={(e) => handleTutorChange(index, "correo", e.target.value)} className="w-full px-3 py-2 border rounded-md"  />
                </div>

                <div >
                  <label className="text-sm font-medium text-gray-700">Relación con el Postulante</label>
                  <div>
                    <select value={tutor.idRol} onChange={(e) => handleTutorChange(index, 'idRol', e.target.value)} className="flex-1 px-3 py-2 border rounded-md">
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



      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Áreas de Inscripción</h3>
        {selecciones.map((seleccion, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 items-center">
            <select value={seleccion.areaId} onChange={(e) => actualizarSeleccion(index, 'areaId', e.target.value)} className="flex-1 px-3 py-2 border rounded-md">
              <option value="">Seleccione un área</option>
              {Object.entries(opcionesInscripcion).map(([id, area]) => (
                <option key={id} value={id}>{area.nombre}</option>
              ))}
            </select>

            <select
              value={seleccion.opcionInscripcionId}
              onChange={(e) => actualizarSeleccion(index, 'opcionInscripcionId', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
              disabled={!seleccion.areaId}
            >
              <option value="">Seleccione categoría</option>
              {seleccion.areaId && opcionesInscripcion[seleccion.areaId]?.niveles_categorias.map((cat) => (
                <option key={cat.id} value={cat.id_opcion_inscripcion}>{cat.nombre}</option>
              ))}
            </select>

            <button type="button" onClick={() => eliminarSeleccion(index)} className="p-2 bg-red-500 text-white rounded-md">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {selecciones.length < 2 && (
          <button type="button" onClick={agregarArea} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus size={16} /> Agregar Área
          </button>
        )}
      </div>



    


      <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
        {isLoading ? 'Enviando...' : 'Registrar Postulante'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default RegistrarPostulante;