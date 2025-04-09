import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { getGrados } from '../../../service/grados.api'
import { getNivelesCategorias, createNivelCategoria } from '../../../service/niveles_categorias.api'


const NivelCategoria = () => {
  const {data: nivelCategoria, isLoading: isLoadingNivelesCategorias, error: errorNivelesCategorias} = useQuery({
    queryKey: ['niveles_categorias'],
    queryFn: getNivelesCategorias,
  });

  const {data: grados, isLoading: isLoadingGrados, error: errorGrados} = useQuery({
    queryKey: ['grados'],
    queryFn: getGrados,
  });

  const [isNivel, setIsNivel] = useState(true);
  const [nombre, setNombre] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [gradoInicio, setGradoInicio] = useState("");
  const [gradoFin, setGradoFin] = useState("");

  if (isLoadingNivelesCategorias || isLoadingGrados) return <div>Loading...</div>;
  if (errorNivelesCategorias) return <div>Error al cargar niveles/categorías: {errorNiveles.message}</div>;
  if (errorGrados) return <div>Error al cargar grados: {errorGrados.message}</div>;

  const handleAddNivelCategoria = async () => {
    if (nombre.trim() === "") {
      alert(`Por favor, ingrese el nombre del ${isNivel ? "nivel" : "categoría"}.`);
      return;
    }

    if (isNivel) {
      if (!gradoSeleccionado || isNaN(gradoSeleccionado)) {
        alert("Por favor, seleccione un grado válido para el nivel.");
        return;
      }
    } else {
      if (!gradoInicio || !gradoFin || isNaN(gradoInicio) || isNaN(gradoFin)) {
        alert("Por favor, seleccione un rango de grados válido para la categoría.");
        return;
      }

      if (gradoInicio > gradoFin) {
        alert("El grado inicial no puede ser mayor que el grado final.");
        return;
      }
    }

    const nuevoItem = {
      nombre,
      esNivel: isNivel,
      grados: isNivel
        ? [gradoSeleccionado] // Para nivel, un solo grado
        : grados
          .filter((grado) => grado.id >= gradoInicio && grado.id <= gradoFin) // Para categoría, rango de grados
          .map((grado) => grado.id),
    };

    console.log("Datos enviados al backend:", nuevoItem);

    try {
      const response = await createNivelCategoria(nuevoItem);
      console.log("Respuesta del backend:", response);
      await cargarNivelesCategorias();

      setNombre("");
      setGradoSeleccionado("");
      setGradoInicio("");
      setGradoFin("");
      alert("Nivel o categoría agregado exitosamente.");
    } catch (error) {
      console.error("Error al agregar nivel/categoría:", error.response?.data || error.message);
      alert("Hubo un error al agregar el nivel o categoría. Verifique los datos e intente nuevamente.");
    }
  };

  const niveles = nivelCategoria.data.filter((item) => item.esNivel);
  const categorias = nivelCategoria.data.filter((item) => !item.esNivel);

  const obtenerGradosAsociados = (grados) => {
    if (!grados || grados.length === 0) {
      return "Sin grados asociados";
    }
    return grados.map((grado) => grado.nombre).join(", ");
  };

  return (
    <div className="p-6 flex flex-col gap-4 w-full h-full min-h-[600px] max-h-[780px] bg-[#F9FAFB]">
    {/* VISTA PREVIA */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 py-4 min-h-[280px] max-h-[360px]">
      <h1 className="text-2xl font-bold text-[#20335C] mb-4 text-center">Niveles y Categorías</h1>
  
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Niveles */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-[#20335C] mb-2">Nivel</h2>
          <ul className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {niveles.map((nivel) => (
              <li key={nivel.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                <div className="text-[#20335C] font-medium">{nivel.nombre}</div>
                <div className="text-sm text-gray-600">
                  Grados: {obtenerGradosAsociados(nivel.grados)}
                </div>
              </li>
            ))}
          </ul>
        </div>
  
        {/* Categorías */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-[#20335C] mb-2">Categoría</h2>
          <ul className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {categorias.map((categoria) => (
              <li key={categoria.id} className="p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <div className="text-[#20335C] font-medium">{categoria.nombre}</div>
                <div className="text-sm text-gray-600">
                  Grados: {obtenerGradosAsociados(categoria.grados)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  
    {/* FORMULARIO */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 pt-3 min-h-[250px]">
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-2">
        <button
          className={`px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
            isNivel
              ? "bg-[#20335C] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setIsNivel(true)}
        >
          Nivel
        </button>
        <button
          className={`px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
            !isNivel
              ? "bg-[#20335C] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setIsNivel(false)}
        >
          Categoría
        </button>
      </div>
  
      {/* Campos */}
      {isNivel ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del nivel</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese el nombre del nivel"
              className="w-full p-2 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
            <select
              value={gradoSeleccionado}
              onChange={(e) => setGradoSeleccionado(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md bg-gray-100 text-gray-800"
            >
              <option value="">Seleccione un grado</option>
              {grados.data.map((grado) => (
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
              className="w-full p-2 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Grado inicial</label>
              <select
                value={gradoInicio}
                onChange={(e) => setGradoInicio(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md bg-gray-100 text-gray-800"
              >
                <option value="">Seleccione el grado inicial</option>
                {grados.data.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Grado final</label>
              <select
                value={gradoFin}
                onChange={(e) => setGradoFin(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md bg-gray-100 text-gray-800"
              >
                <option value="">Seleccione el grado final</option>
                {grados.data.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
  
      {/* Botón */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleAddNivelCategoria}
          className="bg-[#E63946] text-white px-8 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition"
        >
          {isNivel ? "Agregar nivel" : "Agregar categoría"}
        </button>
      </div>
    </div>
  </div>

  )
}

export default NivelCategoria
