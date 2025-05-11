import React, {useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2, Search } from "lucide-react";

import { getRegistroByCI } from "../../../service/registros.api";
import { getPostulanteByCI } from "../../../service/postulantes.api";
import { getGrados } from "../../../service/grados.api";


const RegistrarPostulante = () => {
  const {idOlimpiada, idEncargado } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [postulante, setPostulante] = useState({ci: "", nombres: "", apellidos: "", grado: {id: "", nombre:""}, encontrado: false, registroEncontrado: false, buscado: false});
  const [catalogoGrados, setCatalogoGrados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const gradosRes = await getGrados();
        setCatalogoGrados(gradosRes.data);
      } catch (err) {
        setError("Error al cargar el formulario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idOlimpiada]);

  const buscarRegistro = async () => {
    if (!postulante.ci) {
      alert("Por favor, ingrese el CI del postulante antes de buscar.");
      return;
    }
    const registroBuscado = await getRegistroByCI(idOlimpiada, postulante.ci);
    if (!registroBuscado.data) {
      buscarPostulante();
      return;
    }
    const registroEncontrado = registroBuscado.data;
    console.log("Registro encontrado:", registroEncontrado);
    setPostulante({
      ...postulante,
      nombres: registroEncontrado.postulante.nombres,
      apellidos: registroEncontrado.postulante.apellidos,
      grado: registroEncontrado.grado,
      encontrado: true,
      registroEncontrado: true,
      buscado: true,
    });
  }

  const handleGradoChange = (gradoId) => {
      // Buscar el objeto grado completo basado en el ID seleccionado
    const gradoSeleccionado = catalogoGrados.find(grado => grado.id == gradoId) || {id: gradoId, nombre: ""};
    
    setPostulante(prevState => ({
      ...prevState,
      grado: gradoSeleccionado
    }));
  };

  {/*FUNCIONES RELACIONADAS A POSTULANTE*/}
  const handlePostulanteChange = (field, value) => {
    setPostulante((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const buscarPostulante = async () => {
    if (!postulante.ci) {
      alert("Por favor, ingrese el CI del postulante antes de buscar.");
      return;
    }

    const postulanteBuscado = await getPostulanteByCI(postulante.ci);
    if (!postulanteBuscado.data) {
      alert("No se encontró algún postulante con ese CI.");
      setPostulante( { ...postulante, buscado: true});
      return;
    }
    const postulanteEncontrado = postulanteBuscado.data;
    setPostulante({
      ...postulante,
      nombres: postulanteEncontrado.nombres,
      apellidos: postulanteEncontrado.apellidos,
      encontrado: true,
      buscado: true,
    });
  };

  const eliminarRegistro = () => {
    setPostulante({ci: "", nombres: "", apellidos: "", grado: {id: "", nombre:""}, encontrado: false, registroEncontrado: false, buscado: false});
  };

  console.log(catalogoGrados);
  console.log(postulante);
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Registro de Postulante</h1>
      <div className="flex flex-col md:flex-row gap-4 items-center">

        <div>
          <label className="text-sm font-medium text-gray-700">Carnet de Identidad</label>
          <input type="text" disabled={postulante.encontrado} value={postulante.ci} onChange={(e) => handlePostulanteChange("ci", e.target.value)} 
          className={`w-full px-3 py-2 border rounded-md
            ${postulante.encontrado ? "bg-gray-200" : "bg-white"}
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
              <label className="text-sm font-medium text-gray-700">Nombres</label>
              <input type="text" disabled={postulante.encontrado} value={postulante.nombres} onChange={(e) => handlePostulanteChange("nombres", e.target.value)} 
              className={`w-full px-3 py-2 border rounded-md
                ${postulante.encontrado ? "bg-gray-200" : "bg-white"}
              `}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Apellidos</label>
              <input type="text" disabled={postulante.encontrado} value={postulante.apellidos} onChange={(e) => handlePostulanteChange("apellidos", e.target.value)} 
              className={`w-full px-3 py-2 border rounded-md 
                ${postulante.encontrado ? "bg-gray-200" : "bg-white"}
              `}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Grado</label>
              <div>
                <select 
                  value={postulante.grado?.id || ""} 
                  onChange={(e) => handleGradoChange(e.target.value)} 
                  className={`flex-1 px-3 py-2 border rounded-md
                    ${postulante.registroEncontrado ? "bg-gray-200" : "bg-white"}
                  `}
                  disabled={postulante.registroEncontrado}
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
    </div>
  ); 
};

export default RegistrarPostulante;