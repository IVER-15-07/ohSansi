import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { getGrados } from '../../../service/grados.api'
import { getNivelesCategorias,createNivelCategoria } from '../../../service/niveles_categorias.api'


const NivelCategoria = () => {
  const [grados, setGrados] = useState([]);
  const [nivelCategoria, setNivelCategoria] = useState([]);
  const [isNivel, setIsNivel] = useState(true);
  const [nombre, setNombre] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");

  useEffect(() => {
    cargarGrados();
    cargarNivelesCategorias();
  }, []);

  const cargarGrados = async () => {
    try {
      const response = await getGrados();
      setGrados(response.data);
    } catch (error) {
      console.error("Error al cargar grados:", error);
    }
  };

  const cargarNivelesCategorias = async () => {
    try {
      const response = await getNivelesCategorias();
      setNivelCategoria(response.data);
    } catch (error) {
      console.error("Error al cargar niveles/categorías:", error);
    }
  };

  const handleAddNivelCategoria = async () => {
    if (nombre.trim() === "") {
      alert(`Por favor, ingrese el nombre del ${isNivel ? "nivel" : "categoría"}.`);
      return;
    }

    if (isNivel && gradoSeleccionado === "") {
      alert("Por favor, seleccione un grado para el nivel.");
      return;
    }

    try {
      const nuevoItem = {
        nombre,
        esNivel: isNivel,
        gradoId: isNivel ? gradoSeleccionado : null,
      };

      await createNivelCategoria(nuevoItem);
      await cargarNivelesCategorias();

      setNombre("");
      setGradoSeleccionado("");
      alert("Nivel o categoría agregado exitosamente.");
    } catch (error) {
      console.error("Error al agregar:", error);
      alert("Hubo un error al agregar el nivel o categoría.");
    }
  };

  const niveles = nivelCategoria.filter(item => item.esNivel);
  const categorias = nivelCategoria.filter(item => !item.esNivel);

  const obtenerNombreGrado = (gradoId) => {
    const grado = grados.find(g => g.id === gradoId);
    return grado ? grado.nombre : "Grado no encontrado";
  };

  return (
    <div className="p-6 flex flex-col gap-6 w-full h-full min-h-[665px] max-h-[800px] bg-gray-50">
    {/* Vista previa */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 min-h-[340px]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Niveles y Categorías</h1>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Nivel</h2>
          <ul className="list-disc list-inside space-y-1">
            {niveles.map((nivel) => (
              <li key={nivel.id} className="p-2 bg-blue-100 rounded-md">
                {nivel.nombre} - <span className="text-sm text-gray-700">{obtenerNombreGrado(nivel.gradoId)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Categoría</h2>
          <ul className="list-disc list-inside space-y-1">
            {categorias.map((categoria) => (
              <li key={categoria.id} className="p-2 bg-green-100 rounded-md">
                {categoria.nombre}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Formulario */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 pt-3 min-h-[280px]">
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${isNivel ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setIsNivel(true)}
        >
          Nivel
        </button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${!isNivel ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setIsNivel(false)}
        >
          Categoría
        </button>
      </div>

      {/* Campos dinámicos */}
      {isNivel ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del nivel</label>
            <input
              type="text"
              placeholder="Ingrese el nombre del nivel"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
            <select
              value={gradoSeleccionado}
              onChange={(e) => setGradoSeleccionado(e.target.value)}
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100"
            >
              <option value="">Seleccione un grado</option>
              {grados.map((grado) => (
                <option key={grado.id} value={grado.id}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la categoría</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese el nombre de la categoría"
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Si eventualmente vas a usar rango de niveles aquí, puedes usar estos campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel inicial</label>
              <select
                value={gradoSeleccionado}
                onChange={(e) => setGradoSeleccionado(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-800 bg-gray-100"
              >
                <option value="">Seleccione un grado</option>
                {grados.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel final</label>
              <select
                value={gradoSeleccionado}
                onChange={(e) => setGradoSeleccionado(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-800 bg-gray-100"
              >
                <option value="">Seleccione un grado</option>
                {grados.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleAddNivelCategoria}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
        >
          {isNivel ? 'Agregar nivel' : 'Agregar categoría'}
        </button>
      </div>
    </div>
  </div>

  )
}

export default NivelCategoria
