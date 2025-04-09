"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"
import { createEncargado } from "../../service/encargados.api"

function RegistroTutor() {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    ci: "",
    fecha_nacimiento: "",
    telefono: "",
    correo: "",
    termsAccepted: false,
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState({})

  // Estados para diálogos y alertas
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Validar el campo cuando cambia
    validateField(name, type === "checkbox" ? checked : value)
  }

  // Validación de un campo específico
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case "nombre":
        if (!value) {
          newErrors.nombre = "El nombre del encargado es obligatorio"
        } else if (value.length > 100) {
          newErrors.nombre = "El nombre no debe exceder los 100 caracteres"
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
          newErrors.nombre = "El nombre solo debe contener letras y espacios"
        } else {
          delete newErrors.nombre
        }
        break

      case "apellido":
        if (!value) {
          newErrors.apellido = "El apellido del encargado es obligatorio"
        } else if (value.length > 100) {
          newErrors.apellido = "El apellido no debe exceder los 100 caracteres"
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
          newErrors.apellido = "El apellido solo debe contener letras y espacios"
        } else {
          delete newErrors.apellido
        }
        break

      case "ci":
        if (!value) {
          newErrors.ci = "El número de carnet es obligatorio"
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          newErrors.ci = "El carnet solo debe contener números y si es necesario letras del complemento"
        } else {
          delete newErrors.ci
        }
        break

      case "correo":
        if (!value) {
          newErrors.correo = "El correo electrónico es obligatorio"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.correo = "Ingrese un correo electrónico válido"
        } else {
          delete newErrors.correo
        }
        break

      case "telefono":
        if (!value) {
          newErrors.telefono = "El número de celular es obligatorio"
        } else if (!/^[0-9]+$/.test(value)) {
          newErrors.telefono = "El número de celular solo debe contener números"
        } else {
          delete newErrors.telefono
        }
        break

      case "fecha_nacimiento":
        if (!value) {
          newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
        } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value)) {
          newErrors.fecha_nacimiento = "El formato debe ser dd/mm/aaaa"
        } else {
          delete newErrors.fecha_nacimiento
        }
        break

      case "termsAccepted":
        if (!value) {
          newErrors.termsAccepted = "Debe aceptar los términos y condiciones"
        } else {
          delete newErrors.termsAccepted
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validación de todo el formulario
  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    // Validar cada campo
    Object.entries(formData).forEach(([key, value]) => {
      if (!validateField(key, value)) {
        isValid = false
      }
    })

    // Verificar campos obligatorios vacíos
    if (!formData.nombre) newErrors.nombre = "El nombre(s) es obligatorio"
    if (!formData.apellido) newErrors.apellido = "El apellido(s) es obligatorio"
    if (!formData.ci) newErrors.ci = "El número de carnet es obligatorio"
    if (!formData.correo) newErrors.correo = "El correo electrónico es obligatorio"
    if (!formData.telefono) newErrors.telefono = "El número de celular es obligatorio"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
    if (!formData.termsAccepted) newErrors.termsAccepted = "Debe aceptar los términos y condiciones"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejador de envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setShowConfirmDialog(true)
    }
  }

  // Manejador de confirmación
  const handleConfirm = async () => {
    setShowConfirmDialog(false)
    const { termsAccepted, ...dataToSend } = formData // Quitamos el campo de terminos del formulario

    // Convertir la fecha de nacimiento a un objeto Date
    const [day, month, year] = dataToSend.fecha_nacimiento.split("/");
    dataToSend.fecha_nacimiento = new Date(`${year}-${month}-${day}`); // Formato ISO (aaaa-mm-dd)
    setIsAdding(true)
    try {
      // Enviar el JSON sin el campo termsAccepted
      await createEncargado(dataToSend);

      setShowSuccessAlert(true);
      setFormData({
        nombre: "",
        apellido: "",
        ci: "",
        fecha_nacimiento: "",
        telefono: "",
        correo: "",
        termsAccepted: false,
      });
  
      // Ocultar mensaje de éxito después de 6 segundos
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 6000);
    } catch (error) {
      // Manejo de errores
      console.error("Error al enviar los datos del encargado:", error);
      // Verificar si es un error de conexión
      if (!error.response) {
        setErrorMessage("No se pudo conectar con el servidor. Por favor, revise su conexión a internet o intente más tarde.");
      } else {
        setErrorMessage(error.response.data.message || "Ocurrió un error al procesar la solicitud.");
      }
    }finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Registro de Responsable de Inscripción</h1>
        <p className="text-gray-600 mb-8 text-center">
          Complete el siguiente formulario para registrarse como responsable de inscripción de competidores.
        </p>

        <div className="space-y-6">
          {/* Alerta de error */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 relative">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Error</h3>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
              <button className="absolute top-4 right-4" onClick={() => setErrorMessage(null)} aria-label="Cerrar">
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          )}

          {/* Alerta de éxito */}
          {showSuccessAlert && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 relative">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Registro exitoso</h3>
                  <p className="text-sm text-green-700">
                    Sus datos han sido registrados correctamente.
                  </p>
                </div>
              </div>
              <button className="absolute top-4 right-4" onClick={() => setShowSuccessAlert(false)} aria-label="Cerrar">
                <X className="h-4 w-4 text-green-600" />
              </button>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre(s) */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre(s) *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese su nombre(s)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.nombre ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
                  }`}
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
              </div>

              {/* Apellido(s) */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido(s) *
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Ingrese su apellido(s)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.apellido ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
                  }`}
                />
                {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
              </div>

              {/* Número de Carnet */}
              <div>
                <label htmlFor="ci" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Carnet de Identidad *
                </label>
                <input
                  type="text"
                  id="ci"
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  placeholder="Ingrese su número de carnet"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.idNumber ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
                  }`}
                />
                {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
              </div>

              {/* Correo Electrónico */}
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.correo ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
                  }`}
                />
                {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
              </div>

              {/* Número de Celular */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Celular *
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ingrese su número de celular"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.telefono ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
                  }`}
                />
                {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="text"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  placeholder="dd/mm/aaaa"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.fecha_nacimiento ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
                  }`}
                />
                {errors.fecha_nacimiento && <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>}
              </div> 
            </div>

            {/* Términos y Condiciones */}
            <div
              className={`flex items-start space-x-2 rounded-md border p-4 ${
                errors.termsAccepted ? "border-red-300" : "border-gray-200"
              }`}
            >
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="h-4 w-4 mt-1 rounded border-gray-300 text-black focus:ring-black"
              />
              <div className="space-y-1 leading-none">
                <label htmlFor="termsAccepted" className="font-medium text-gray-700">
                  Acepto los términos y condiciones de la olimpiada *
                </label>
                <p className="text-sm text-gray-500">
                  Al marcar esta casilla, confirmo que he leído y acepto los términos y condiciones para la
                  participación en la olimpiada.
                </p>
                {errors.termsAccepted && <p className="text-sm text-red-600">{errors.termsAccepted}</p>}
              </div>
            </div>

            {/* Botón de Guardar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  !formData.termsAccepted || 
                  !formData.nombre || 
                  !formData.apellido || 
                  !formData.ci || 
                  !formData.correo || 
                  !formData.telefono || 
                  !formData.fecha_nacimiento || 
                  isAdding
                }
                className={`px-4 py-2 rounded-md text-white ${
                  formData.termsAccepted &&
                  formData.nombre &&
                  formData.apellido &&
                  formData.ci &&
                  formData.correo &&
                  formData.telefono &&
                  formData.fecha_nacimiento &&
                  !isAdding
                    ? "bg-black hover:bg-gray-800 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isAdding ? "Cargando..." : "Guardar"}
              </button>
            </div>
          </form>

          {/* Diálogo de confirmación */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
                <h3 className="text-lg font-medium mb-2">Confirmar registro</h3>
                <p className="text-gray-600 mb-6">
                  ¿Está seguro que desea guardar los datos del responsable de inscripción?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegistroTutor
