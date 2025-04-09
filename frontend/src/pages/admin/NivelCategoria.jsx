import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGrados } from '../../../service/grados.api'
import { getNivelesCategorias, createNivelCategoria } from '../../../service/niveles_categorias.api'
import Cargando from '../Cargando';


const NivelCategoria = () => {
  const queryClient = useQueryClient();
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
  const [isAdding, setIsAdding] = useState(false);

  if (isLoadingNivelesCategorias || isLoadingGrados) return <Cargando/>;
  if (errorNivelesCategorias) return <Error error={errorNivelesCategorias}/>;
  if (errorGrados) return <Error error={errorGrados}/>;

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
        : grados.data
          .filter((grado) => grado.id >= gradoInicio && grado.id <= gradoFin) // Para categoría, rango de grados
          .map((grado) => grado.id),
    };

    console.log("Datos enviados al backend:", nuevoItem);

    setIsAdding(true);
    try {
      const response = await createNivelCategoria(nuevoItem);
      console.log("Respuesta del backend:", response);

      setNombre("");
      setGradoSeleccionado("");
      setGradoInicio("");
      setGradoFin("");

      // Actualiza la caché de React Query inmediatamente
      queryClient.setQueryData(['niveles_categorias'], (oldData) => {
        return {
          ...oldData,
          data: [...oldData.data, response.data], // Agrega la nueva área a la lista existente
        };	
      });

      queryClient.invalidateQueries(['niveles_categorias']); // Invalida la consulta para actualizar la lista
      alert("Nivel o categoría agregado exitosamente.");
    } catch (error) {
      // Manejo de errores
      console.error("Error al agregar nivel/categoria:", error);
      // Verificar si es un error de conexión
      if (!error.response) {
        alert("No se pudo conectar con el servidor. Por favor, revise su conexión a internet o intente más tarde.");
      } else {
        alert(error.response.data.message || "Ocurrió un error al procesar la solicitud.");
      }
    }finally{
      setIsAdding(false);
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
    <div className="p-6 flex flex-col gap-6 w-full h-full min-h-[600px] max-h-[780px] bg-gray-50">
    {/* Vista previa */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 min-h-[260px] max-h-[340px]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Niveles y Categorías</h1>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Lista de niveles */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Nivel</h2>
          <ul className="list-disc list-inside space-y-1 overflow-y-auto max-h-[220px] pr-1">
            {niveles.map((nivel) => (
              <li key={nivel.id} className="p-2 bg-blue-100 rounded-md">
                <div>
                  <strong>{nivel.nombre}</strong>
                </div>
                <div className="text-sm text-gray-700">
                  Grados: {obtenerGradosAsociados(nivel.grados)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Lista de categorías */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Categoría</h2>
          <ul className="list-disc list-inside space-y-1 overflow-y-auto max-h-[220px] pr-1">
            {categorias.map((categoria) => (
              <li key={categoria.id} className="p-2 bg-green-100 rounded-md">
                <div>
                  <strong>{categoria.nombre}</strong>
                </div>
                <div className="text-sm text-gray-700">
                  Grados: {obtenerGradosAsociados(categoria.grados)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Formulario */}
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 pt-3 min-h-[260px]">
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            isNivel ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setIsNivel(true)}
        >
          Nivel
        </button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            !isNivel ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
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
              onChange={(e) => {
                const valorSeleccionado = parseInt(e.target.value);
                console.log("Grado seleccionado (convertido):", valorSeleccionado);
                setGradoSeleccionado(valorSeleccionado);
              }}
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100"
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
            className="w-full p-2 border rounded-md text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      
        <div className="flex gap-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado inicial</label>
            <select
              value={gradoInicio}
              onChange={(e) => setGradoInicio(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100"
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
              className="w-full p-2 border rounded-md text-gray-800 bg-gray-100"
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

      <div className="flex justify-center mt-6">
        <button
          onClick={handleAddNivelCategoria}
          disabled={isAdding} // Desactiva el botón mientras se está cargando
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${
            isAdding
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-800 transition"
          }`}
        >
          {isAdding ? "Cargando..." : isNivel ? "Agregar nivel" : "Agregar categoría"}
        </button>
      </div>
    </div>
  </div>

  )
}

export default NivelCategoria
