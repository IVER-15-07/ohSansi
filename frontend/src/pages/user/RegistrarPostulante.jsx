import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormulario, saveDatosInscripcion, createRegistro } from "../../../service/formulario.api";
import { getOpcionesInscripcion } from "../../../service/opciones_inscripcion.api";
import { Plus, Trash2 } from "lucide-react";

const RegistrarPostulante = () => {
  const { idOlimpiada, idEncargado } = useParams();
  const [secciones, setSecciones] = useState([]);
  const [opcionesInscripcion, setOpcionesInscripcion] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [datosPostulante, setDatosPostulante] = useState({ nombres: '', apellidos: '', ci: '' });
  const [selecciones, setSelecciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const seccionesRes = await getFormulario(idOlimpiada);
        const opcionesRes = await getOpcionesInscripcion(idOlimpiada);
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

  const handleSubmit = async () => {
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
      }
      alert("Postulante inscrito con éxito");
    } catch (error) {
      alert("Error al registrar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
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