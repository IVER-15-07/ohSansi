"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"

function RegistrationForm() {
  // Estado del formulario
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    relationship: "",
    termsAccepted: false,
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState({})

  // Estados para diálogos y alertas
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

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
      case "fullName":
        if (!value) {
          newErrors.fullName = "El nombre completo es obligatorio"
        } else if (value.length > 100) {
          newErrors.fullName = "El nombre no debe exceder los 100 caracteres"
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$/.test(value)) {
          newErrors.fullName = "El nombre solo debe contener letras, números y espacios"
        } else {
          delete newErrors.fullName
        }
        break

      case "idNumber":
        if (!value) {
          newErrors.idNumber = "El número de carnet es obligatorio"
        } else if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
          newErrors.idNumber = "El carnet solo debe contener letras, números y espacios"
        } else {
          delete newErrors.idNumber
        }
        break

      case "email":
        if (!value) {
          newErrors.email = "El correo electrónico es obligatorio"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Ingrese un correo electrónico válido"
        } else {
          delete newErrors.email
        }
        break

      case "phoneNumber":
        if (!value) {
          newErrors.phoneNumber = "El número de celular es obligatorio"
        } else if (!/^[0-9]+$/.test(value)) {
          newErrors.phoneNumber = "El número de celular solo debe contener números"
        } else {
          delete newErrors.phoneNumber
        }
        break

      case "birthDate":
        if (!value) {
          newErrors.birthDate = "La fecha de nacimiento es obligatoria"
        } else if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value)) {
          newErrors.birthDate = "El formato debe ser dd/mm/aaaa"
        } else {
          delete newErrors.birthDate
        }
        break

      case "relationship":
        if (!value) {
          newErrors.relationship = "La relación con el competidor es obligatoria"
        } else {
          delete newErrors.relationship
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
    if (!formData.fullName) newErrors.fullName = "El nombre completo es obligatorio"
    if (!formData.idNumber) newErrors.idNumber = "El número de carnet es obligatorio"
    if (!formData.email) newErrors.email = "El correo electrónico es obligatorio"
    if (!formData.phoneNumber) newErrors.phoneNumber = "El número de celular es obligatorio"
    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es obligatoria"
    if (!formData.relationship) newErrors.relationship = "La relación con el competidor es obligatoria"
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

    // Simulación de verificación de duplicados
    const isDuplicate = Math.random() < 0.2 // 20% de probabilidad de simular un duplicado

    if (isDuplicate) {
      setErrorMessage("Ya existe un responsable registrado con este nombre completo.")
      return
    }

    // Simulación de envío exitoso
    // En un caso real, aquí iría la llamada a la API para guardar los datos
    setTimeout(() => {
      setShowSuccessAlert(true)
      setFormData({
        fullName: "",
        idNumber: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
        relationship: "",
        termsAccepted: false,
      })

      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 5000)
    }, 1000)
  }

  return (
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
                Sus datos han sido registrados correctamente. Se ha enviado un correo de confirmación con los siguientes
                pasos.
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
          {/* Nombre Completo */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ingrese su nombre completo"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.fullName ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
              }`}
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          {/* Número de Carnet */}
          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Carnet de Identidad *
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="Ingrese su número de carnet"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.idNumber ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
              }`}
            />
            {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
          </div>

          {/* Correo Electrónico */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Número de Celular */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Celular *
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Ingrese su número de celular"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.phoneNumber ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
              }`}
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="text"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              placeholder="dd/mm/aaaa"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.birthDate ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
              }`}
            />
            {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
          </div>

          {/* Relación con el Competidor */}
          <div>
            <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
              Relación con el Competidor *
            </label>
            <select
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.relationship ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
              }`}
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              <option value="padre">Padre</option>
              <option value="madre">Madre</option>
              <option value="apoderado">Apoderado Legal</option>
              <option value="tutor">Tutor</option>
            </select>
            {errors.relationship && <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>}
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div
          className={`flex items-start space-x-3 rounded-md border p-4 ${
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
              Al marcar esta casilla, confirmo que he leído y acepto los términos y condiciones para la participación en
              la olimpiada.
            </p>
            {errors.termsAccepted && <p className="text-sm text-red-600">{errors.termsAccepted}</p>}
          </div>
        </div>

        {/* Botón de Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!formData.termsAccepted}
            className={`px-4 py-2 rounded-md text-white ${
              formData.termsAccepted ? "bg-black hover:bg-gray-800 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Guardar
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
              <button onClick={handleConfirm} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistrationForm
