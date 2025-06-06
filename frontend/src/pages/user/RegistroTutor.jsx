

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { createEncargado } from "../../../service/encargados.api"
import { getPersonaByCI } from "../../../service/personas.api"
import { FormField, Button, Modal, Alert } from "../../components/ui"

const RegistroTutor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const CIinicial = location.state?.ci || ""; // Obtener el CI inicial del estado de la ubicación
  const idOlimpiada = location.state?.idOlimpiada; // Obtener el id de la olimpiada desde el estado de la ubicación
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

  // Estado de la persona en la BB.DD.
  const [persona, setPersona] = useState(null)

  useEffect(() => {
    // Obtener la persona por CI al cargar el componente
    console.log("CI inicial:", CIinicial);
    const fetchPersona = async () => {
      try {
        const personaRes = (await getPersonaByCI(formData.ci)).data;
        console.log("Respuesta de getPersonaByCI:", personaRes);
        if (personaRes) {
          setFormData((prevState) => ({
            ...prevState,
            idPersona: personaRes.id,
            nombre: personaRes.nombres,
            apellido: personaRes.apellidos,
            fecha_nacimiento: personaRes.fecha_nacimiento || "",
          }))
          setPersona(personaRes);
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
    
    // Para el campo CI, aplicar validación en tiempo real
    if (name === "ci") {
      // Validar caracteres especiales y letras con tilde
      const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
      const letrasConTilde = /[áéíóúÁÉÍÓÚñÑ]/;
      
      if (caracteresEspeciales.test(value) || letrasConTilde.test(value)) {
        // No actualizar el valor si contiene caracteres no permitidos
        return;
      }
      
      // Permitir solo letras sin tilde, números y espacios
      const regex = /^[a-zA-Z0-9 ]*$/;
      if (!regex.test(value)) {
        return;
      }
    }

    // Para el campo fecha_nacimiento, manejar como string directamente
    if (name === "fecha_nacimiento") {
      setFormData({
        ...formData,
        [name]: value,
      });
      validateField(name, value);
      return;
    }
    
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
        } else {
          // Validar caracteres especiales
          const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
          if (caracteresEspeciales.test(value)) {
            newErrors.nombre = "No se permiten caracteres especiales en el nombre"
          } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
            newErrors.nombre = "El nombre solo debe contener letras y espacios"
          } else {
            delete newErrors.nombre
          }
        }
        break

      case "apellido":
        if (!value) {
          newErrors.apellido = "El apellido del encargado es obligatorio"
        } else if (value.length > 100) {
          newErrors.apellido = "El apellido no debe exceder los 100 caracteres"
        } else {
          // Validar caracteres especiales
          const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
          if (caracteresEspeciales.test(value)) {
            newErrors.apellido = "No se permiten caracteres especiales en el apellido"
          } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(value)) {
            newErrors.apellido = "El apellido solo debe contener letras y espacios"
          } else {
            delete newErrors.apellido
          }
        }
        break

      case "ci":
        if (!value) {
          newErrors.ci = "El número de carnet es obligatorio"
        } else {
          // Validar caracteres especiales
          const caracteresEspeciales = /[!@#$%^&*(),.?":{}|<>\/\\`~_+=\[\];'-]/;
          if (caracteresEspeciales.test(value)) {
            newErrors.ci = "No se permiten caracteres especiales como !@#$%^&*(),.?\":{}|<>/\\`~_+=[];'-"
          } else {
            // Validar letras con tilde
            const letrasConTilde = /[áéíóúÁÉÍÓÚñÑ]/;
            if (letrasConTilde.test(value)) {
              newErrors.ci = "No se permiten letras con tilde (á, é, í, ó, ú, ñ)"
            } else if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
              newErrors.ci = "Solo se permiten letras sin tilde, números y espacios"
            } else {
              delete newErrors.ci
            }
          }
        }
        break

      case "correo":
        if (!value) {
          newErrors.correo = "El correo electrónico es obligatorio"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.correo = "Ingrese un correo electrónico con el formato: usuario@dominio.com"
        } else {
          delete newErrors.correo
        }
        break

      case "fecha_nacimiento":
        if (!value) {
          newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
        } else {
          // Crear objeto Date desde string YYYY-MM-DD
          const birthDate = new Date(value);
          
          // Validar que la fecha sea válida
          if (isNaN(birthDate.getTime())) {
            newErrors.fecha_nacimiento = "Fecha de nacimiento inválida";
          } else {
            // Validar que la fecha no sea futura
            const today = new Date();
            if (birthDate > today) {
              newErrors.fecha_nacimiento = "La fecha de nacimiento no puede ser futura";
            } else {
             
                delete newErrors.fecha_nacimiento;
            }
          }
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

  // Función para verificar si el formulario es completamente válido
  const isFormValid = () => {
    // Verificar que todos los campos obligatorios están llenos
    const requiredFields = ['nombre', 'apellido', 'ci', 'correo', 'fecha_nacimiento'];
    const allFieldsFilled = requiredFields.every(field => formData[field]?.toString().trim());
    
    // Verificar que no hay errores de validación
    const hasNoErrors = Object.keys(errors).length === 0;
    
    // Verificar que se aceptaron los términos
    const termsAccepted = formData.termsAccepted;
    
    return allFieldsFilled && hasNoErrors && termsAccepted;
  }

  // Validación de todo el formulario
  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    // Validar cada campo
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'idPersona' && key !== 'termsAccepted') {
        if (!validateField(key, value)) {
          isValid = false
        }
      }
    })

    // Verificar campos obligatorios vacíos
    if (!formData.nombre?.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!formData.apellido?.trim()) newErrors.apellido = "El apellido es obligatorio"
    if (!formData.ci?.trim()) newErrors.ci = "El número de carnet es obligatorio"
    if (!formData.correo?.trim()) newErrors.correo = "El correo electrónico es obligatorio"
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

    // La fecha ya es un objeto Date, no necesita conversión adicional
    console.log("Datos a enviar:", dataToSend);
    setIsAdding(true)
    try {
      // Enviar el JSON sin el campo termsAccepted
      const response = await createEncargado(dataToSend);
      const idEncargado = response.data.id;
      setShowSuccessAlert(true);

      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
      // Redirigir al usuario a la página de identificación del encargado
      navigate("/IdentificarEncargado", { state: { idEncargado, idOlimpiada } });
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
        <h1 className="text-2xl font-bold text-center mb-6">Registro de Encargado de Inscripción</h1>
        <p className="text-gray-600 mb-8 text-center">
          Complete el siguiente formulario para registrarse como encargado de inscripción de competidores.
        </p>

        <div className="space-y-6">
          {/* Alerta de error */}
          {errorMessage && (
            <Alert
              variant="error"
              title="Error"
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          {/* Alerta de éxito */}
          {showSuccessAlert && (
            <Alert
              variant="success"
              title="Registro exitoso"
              onClose={() => setShowSuccessAlert(false)}
            >
              Sus datos han sido registrados correctamente.
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre(s) */}
              <FormField
                label="Nombre(s)"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                disabled={formData.idPersona}
                placeholder="Ingrese su nombre(s)"
                required
                error={errors.nombre}
              />

              {/* Apellido(s) */}
              <FormField
                label="Apellido(s)"
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleChange}
                disabled={formData.idPersona}
                placeholder="Ingrese su apellido(s)"
                required
                error={errors.apellido}
              />

              {/* Número de Carnet */}
              <FormField
                label="Número de Carnet de Identidad"
                name="ci"
                type="text"
                value={formData.ci}
                onChange={handleChange}
                disabled={true}
                placeholder="Ingrese su número de carnet"
                required
                error={errors.ci}
              />

              {/* Correo Electrónico */}
              <FormField
                label="Correo Electrónico"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                required
                error={errors.correo}
              />

              {/* Fecha de Nacimiento */}
              <FormField
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                disabled={persona?.fecha_nacimiento}
                required
                error={errors.fecha_nacimiento}
              />
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


            {/* Botones */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleVolver}
              >
                Volver a Identificar Encargado
              </Button>

              <Button
                type="submit"
                disabled={!isFormValid() || isAdding}
                loading={isAdding}
                size="md"
                variant={!isFormValid() || isAdding ? "secondary" : "success"}
              >
                Guardar
              </Button>
            </div>
          </form>

          {/* Modal de confirmación */}
          <Modal
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleConfirm}
            variant="warning"
            title="Confirmar registro"
            message="¿Está seguro que desea guardar los datos del responsable de inscripción?"
            confirmText="Confirmar"
            cancelText="Cancelar"
            isLoading={isAdding}
          />
        </div>
      </div>
    </div>
  )
}

export default RegistroTutor
