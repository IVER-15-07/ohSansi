import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGrados } from '../../../service/grados.api'
import { getNivelesCategorias, createNivelCategoria } from '../../../service/niveles_categorias.api'
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { Card } from '../../components/ui/Card';


const NivelCategoria = () => {
  const queryClient = useQueryClient();

  const { data: nivelCategoria, isLoading: isLoadingNivelesCategorias, error: errorNivelesCategorias } = useQuery({
    queryKey: ['niveles_categorias'],
    queryFn: getNivelesCategorias,
  });

  const { data: grados, isLoading: isLoadingGrados, error: errorGrados } = useQuery({
    queryKey: ['grados'],
    queryFn: getGrados,
  });

  const [isNivel, setIsNivel] = useState(true);
  const [nombre, setNombre] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  const [gradoInicio, setGradoInicio] = useState("");
  const [gradoFin, setGradoFin] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoadingNivelesCategorias || isLoadingGrados) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <LoadingSpinner size="xl" text="Cargando niveles y categorías..." />
    </div>
  );
  if (errorNivelesCategorias) return <div className="p-6 text-red-500">Error cargando niveles/categorías: {errorNivelesCategorias.message}</div>;
  if (errorGrados) return <div className="p-6 text-red-500">Error cargando grados: {errorGrados.message}</div>;

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
    } finally {
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
                <li key={nivel.id}>
                  <Card
                    title={nivel.nombre}
                    subtitle={`Grados: ${obtenerGradosAsociados(nivel.grados)}`}
                    color="from-blue- to-blue-100 border-blue-200"
                    
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Categorías */}
          <div className="w-full md:w-1/2">
            <h2 className="text-lg font-semibold text-[#20335C] mb-2">Categoría</h2>
            <ul className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {categorias.map((categoria) => (
                <li key={categoria.id}>
                  <Card
                    title={categoria.nombre}
                    subtitle={`Grados: ${obtenerGradosAsociados(categoria.grados)}`}
                    color="from-red- to-red-100 border-red-200"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 pt-3 min-h-[250px]">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-2 items-center">
          <span className={`font-semibold ${isNivel ? "text-[#2640BE]" : "text-gray-400"}`}>Nivel</span>
          <ToggleSwitch
            checked={!isNivel ? false : true}
            onChange={() => setIsNivel(!isNivel)}
            color={isNivel ? "blue" : "red"}
          />
          <span className={`font-semibold ${!isNivel ? "text-[#E63946]" : "text-gray-400"}`}>Categoría</span>
        </div>

        {/* Campos */}
        {isNivel ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del nivel</label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese el nombre del nivel"

              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
              <Select
                value={gradoSeleccionado}
                onChange={e => setGradoSeleccionado(parseInt(e.target.value))}
                options={grados.data.map(grado => ({
                  value: grado.id,
                  label: grado.nombre
                }))}
                placeholder="Seleccione un grado"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la categoría</label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese el nombre de la categoría"

              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grado inicial</label>
                <Select
                  value={gradoInicio}
                  onChange={e => setGradoInicio(parseInt(e.target.value))}
                  options={grados.data.map(grado => ({
                    value: grado.id,
                    label: grado.nombre
                  }))}
                  placeholder="Seleccione el grado inicial"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grado final</label>
                <Select
                  value={gradoFin}
                  onChange={(e) => setGradoFin(parseInt(e.target.value))}
                  placeholder="Seleccione el grado final"
                  options={grados.data.map(grado => ({
                    value: grado.id,
                    label: grado.nombre

                  }))}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              // Validar que todos los campos estén llenos
              if (
                nombre.trim() === "" ||
                (isNivel && (!gradoSeleccionado || isNaN(gradoSeleccionado))) ||
                (!isNivel && (!gradoInicio || !gradoFin || isNaN(gradoInicio) || isNaN(gradoFin) || gradoInicio > gradoFin))
              ) {
                alert("Por favor, complete todos los campos correctamente antes de continuar.");
                return;
              }
              setIsModalOpen(true); // Abre el modal si los campos son válidos
            }}
            disabled={isAdding}
            className={`bg-[#E63946] text-white px-8 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition ${isAdding
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-800 transition"
              }`}
          >
            {isAdding ? "Cargando..." : isNivel ? "Agregar nivel" : "Agregar categoría"}
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0  bg-opacity-20 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-lg shadow-lg p-6 w-100">
            <h2 className="text-lg text-center font-bold text-gray-800 mb-4">Confirmar acción</h2>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas agregar este {isNivel ? 'nivel' : 'categoría'}?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsModalOpen(false)} // Cierra el modal
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleAddNivelCategoria(); // Llama a la función para agregar
                  setIsModalOpen(false); // Cierra el modal
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NivelCategoria
