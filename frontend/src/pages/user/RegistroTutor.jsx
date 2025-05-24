

import { use, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AlertCircle, CheckCircle, X } from "lucide-react"
import { createEncargado } from "../../../service/encargados.api"
import { getPersonaByCI } from "../../../service/personas.api"

const RegistroTutor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const CIinicial = location.state?.ci || ""; // Obtener el CI inicial del estado de la ubicación
  // Estado del formulario
  const [formData, setFormData] = useState({
    idPersona: "",
    nombre: "",
    apellido: "",
    ci: CIinicial,
    fecha_nacimiento: "",
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

  useEffect(() => {
    // Obtener la persona por CI al cargar el componente
    console.log("CI inicial:", CIinicial);
    const fetchPersona = async () => {
      try {
        const persona = (await getPersonaByCI(formData.ci)).data;
        console.log("Respuesta de getPersonaByCI:", persona);
        if (persona) {
          const [year, month, day] = persona.fecha_nacimiento.split("-");
          persona.fecha_nacimiento = `${day}/${month}/${year}`;
          setFormData((prevState) => ({
            ...prevState,
            idPersona: persona.id,
            nombre: persona.nombres,
            apellido: persona.apellidos,
            fecha_nacimiento: persona.fecha_nacimiento,
          }))
        }
      } catch (error) {
        console.error("Error al obtener la persona por CI:", error)
      }
    }

    if (formData.ci) {
      fetchPersona()
    }
  }, [formData.ci]); 

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
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$/.test(value)) {
          newErrors.nombre = "El nombre solo debe contener letras, números y espacios"
        } else {
          delete newErrors.nombre
        }
        break

      case "apellido":
        if (!value) {
          newErrors.apellido = "El apellido del encargado es obligatorio"
        } else if (value.length > 100) {
          newErrors.apellido = "El apellido no debe exceder los 100 caracteres"
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$/.test(value)) {
          newErrors.apellido = "El apellido solo debe contener letras, números y espacios"
        } else {
          delete newErrors.apellido
        }
        break

      case "ci":
        if (!value) {
          newErrors.ci = "El número de carnet es obligatorio"
        } else if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
          newErrors.ci = "El carnet solo debe contener letras, números y espacios"
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
    const { termsAccepted, idPersona, ...dataToSend } = formData // Quitamos el campo de terminos del formulario

    // Convertir la fecha de nacimiento a un objeto Date
    const [day, month, year] = dataToSend.fecha_nacimiento.split("/");
    dataToSend.fecha_nacimiento = new Date(`${year}-${month}-${day}`); // Formato ISO (aaaa-mm-dd)
    console.log("Datos a enviar:", dataToSend);
    setIsAdding(true)
    try {
      // Enviar el JSON sin el campo termsAccepted
      const response = await createEncargado(dataToSend);
      const idEncargado = response.data.id;
      setShowSuccessAlert(true);
      /*
      setFormData({
        nombre: "",
        apellido: "",
        ci: "",
        fecha_nacimiento: "",
        telefono: "",
        correo: "",
        termsAccepted: false,
      });*/

      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
    } catch (error) {
      // Manejo de errores
      console.error("Error al enviar los datos del encargado:", error);
      // Verificar si es un error de conexión
      if (!error.response) {
        setErrorMessage("No se pudo conectar con el servidor. Por favor, revise su conexión a internet o intente más tarde.");
      } else {
        setErrorMessage(error.response.data.message || "Ocurrió un error al procesar la solicitud.");
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleVolver = () => {
    navigate("/IdentificarEncargado");
  }


  return (
    <div className=" container mx-auto py-8 px-4">
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
                  disabled={formData.idPersona}
                  placeholder="Ingrese su nombre(s)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.nombre ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"}
                    ${formData.idPersona ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                  disabled={formData.idPersona}
                  placeholder="Ingrese su apellido(s)"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.apellido ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"}
                    ${formData.idPersona ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                  disabled={true}
                  onChange={handleChange}
                  placeholder="Ingrese su número de carnet"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.idNumber ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"}
                    ${formData.ci ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.correo ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"
                    }`}
                />
                {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
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
                  disabled={formData.idPersona}
                  placeholder="dd/mm/aaaa"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${errors.fecha_nacimiento ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-black/10"}
                    ${formData.idPersona ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
                {errors.fecha_nacimiento && <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>}
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div
              className={`flex items-start space-x-2 rounded-md border p-4 ${errors.termsAccepted ? "border-red-300" : "border-gray-200"
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
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleVolver}
                className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700:bg-gray-500 mr-3"

              >
                Identificarte
              </button>

              <button
                type="submit"
                disabled={!formData.termsAccepted || isAdding}
                className={`px-4 py-2 rounded-md text-white ${(formData.termsAccepted && !isAdding)
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
