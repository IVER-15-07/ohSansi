"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getAreas, createArea } from "../../../service/areas.api"
import Cargando from "../Cargando"
import Error from "../Error"

const Areas = () => {
  const queryClient = useQueryClient()
  const inputRef = useRef(null)

  const {
    data: areas,
    isLoading,
    error: errorAreas,
  } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
  })

  const [newArea, setNewArea] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (errorMessage) setErrorMessage(null)
      if (successMessage) setSuccessMessage(null)
    }, 5000)

    return () => clearTimeout(timer)
  }, [errorMessage, successMessage])

  // Handle Enter key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && document.activeElement === inputRef.current) {
        e.preventDefault()
        validateAndShowConfirmation()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [newArea])

  if (isLoading) return <Cargando />
  if (errorAreas) return <Error error={errorAreas} />

  // Validate area name
  const validateAreaName = () => {
    // Check if empty
    if (newArea.trim() === "") {
      setErrorMessage("El nombre del área no puede estar vacío.")
      return false
    }

    // Check for special characters (only allow letters, numbers, and spaces)
    const regex = /^[a-zA-Z0-9\s]+$/
    if (!regex.test(newArea)) {
      setErrorMessage("El nombre del área solo puede contener letras, números y espacios.")
      return false
    }

    // Check length
    if (newArea.length > 50) {
      setErrorMessage("El nombre del área no puede exceder los 50 caracteres.")
      return false
    }

    // Check for duplicates (case insensitive)
    const isDuplicate = areas.data.some((area) => area.nombre.toLowerCase() === newArea.toLowerCase())
    if (isDuplicate) {
      setErrorMessage("Ya existe un área con este nombre en el catálogo.")
      return false
    }

    return true
  }

  const validateAndShowConfirmation = () => {
    if (validateAreaName()) {
      setShowConfirmModal(true)
    }
  }

  const handleAddArea = async () => {
    setIsAdding(true)
    try {
      const nuevaArea = await createArea({ nombre: newArea })
      setNewArea("")

      // Update React Query cache
      queryClient.setQueryData(["areas"], (oldData) => {
        return {
          ...oldData,
          data: [...oldData.data, nuevaArea.data],
        }
      })

      queryClient.invalidateQueries(["areas"])
      setSuccessMessage("El área se ha agregado exitosamente.")
    } catch (error) {
      console.error("Error al agregar el área:", error)
      setErrorMessage("Hubo un error al agregar el área. Inténtalo nuevamente.")
    } finally {
      setIsAdding(false)
      setShowConfirmModal(false)
    }
  }

  const handleRemoveArea = (index) => {
    // Implement area removal functionality here
    console.log("Removing area at index:", index)
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full h-full bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col gap-6">
        {/* Notification Messages */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">Error</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 font-medium">Éxito</p>
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Areas List Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Áreas</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[300px] min-h-[300px] pr-2">
            {areas.data.length === 0 ? (
              <div className="col-span-full flex justify-center items-center h-full text-gray-500">
                No hay áreas registradas
              </div>
            ) : (
              areas.data.map((area, index) => (
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
                className={`px-5 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                  isAdding ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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
  ) 
}

export default Areas
