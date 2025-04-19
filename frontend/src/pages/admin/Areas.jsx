"use client"

import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAreas, createArea } from "../../../service/areas.api";
import Cargando from "../Cargando";
import Error from "../Error";

const Areas = () => {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);

  const { 
    data: areas,
    isLoading,
    error: errorAreas,
  } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  });

  const [newArea, setNewArea] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (errorMessage) setErrorMessage(null);
      if (successMessage) setSuccessMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMessage, successMessage]);

  // Handle Enter key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && document.activeElement === inputRef.current) {
        e.preventDefault();
        validateAndShowConfirmation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [newArea]);

  if (isLoading) return <Cargando />;
  if (errorAreas) return <Error error={errorAreas} />;

  // Validate area name
  const validateAreaName = () => {
    if (newArea.trim() === "") {
      setErrorMessage("El nombre del área no puede estar vacío.");
      return false;
    }

    const regex = /^[a-zA-Z0-9\s]+$/;
    if (!regex.test(newArea)) {
      setErrorMessage("El nombre del área solo puede contener letras, números y espacios.");
      return false;
    }

    if (newArea.length > 50) {
      setErrorMessage("El nombre del área no puede exceder los 50 caracteres.");
      return false;
    }

    const isDuplicate = areas?.data?.some((area) => area.nombre.toLowerCase() === newArea.toLowerCase());
    if (isDuplicate) {
      setErrorMessage("Ya existe un área con este nombre en el catálogo.");
      return false;
    }

    return true;
  };

  const validateAndShowConfirmation = () => {
    if (validateAreaName()) {
      setShowConfirmModal(true);
    }
  };

  const handleAddArea = async () => {
    if (!validateAreaName()) return;

    setIsAdding(true);
    try {
      const nuevaArea = await createArea({ nombre: newArea });
      setNewArea("");
      setSuccessMessage("El área se ha agregado exitosamente.");
      queryClient.setQueryData(["areas"], (oldData) => ({
        ...oldData,
        data: [...oldData.data, nuevaArea.data],
      }));
      queryClient.invalidateQueries(["areas"]);
    } catch (error) {
      console.error("Error al agregar el área:", error);
      setErrorMessage("Hubo un error al agregar el área. Inténtalo nuevamente.");
    } finally {
      setIsAdding(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 w-full h-full bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col gap-6">
        {/* Notification Messages */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-md">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Areas List Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Áreas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[300px] min-h-[300px] pr-2">
            {areas?.data?.length === 0 ? (
              <div className="col-span-full flex justify-center items-center h-full text-gray-500">
                No hay áreas registradas
              </div>
            ) : (
              areas?.data?.map((area, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01]
                    ${index % 2 === 0 ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}
                >
                  <span className="text-gray-800 font-medium">{area.nombre}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Area Section */}
        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar área de competencia</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="area-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del área
              </label>
              <input
                id="area-name"
                ref={inputRef}
                type="text"
                placeholder="Ingrese el nombre del área"
                className="w-full p-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{newArea.length}/50 caracteres</p>
            </div>
            <div className="flex justify-start">
              <button
                onClick={validateAndShowConfirmation}
                disabled={isAdding}
                className={`px-5 py-2 rounded-md text-sm font-medium transition ${
                  isAdding ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {isAdding ? "Cargando..." : "Agregar área"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirmar acción</h3>
              <p className="text-sm text-gray-500 mt-1">
                ¿Estás seguro que deseas agregar el área "{newArea}" al catálogo?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddArea}
                disabled={isAdding}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isAdding ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Areas;
