import { useEffect, useRef, useState } from 'react'
import { createOlimpiada, getOlimpiadas } from '../../../service/olimpiadas.api';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  SubirArchivo, 
  Modal, 
  Button,
  FormField, 
  Alert 
} from '../../components/ui';


const CrearOlimpiada = () => {
  const clienteQuery = useQueryClient();
  const redirigir = useNavigate();

  const [olimpiadas, setOlimpiadas] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorGeneral, setErrorGeneral] = useState(''); // Estado único para errores

  const [datosFormulario, setDatosFormulario] = useState({
    nombre: '',
    convocatoria: '',
    descripcion: '',
    costo: '',
    max_areas: '',
    fechaInicio: '',
    fechaFin: '',
    inicioInscripcion: '',
    finInscripcion: '',
  });

  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});

  useEffect(() => {
    getOlimpiadas()
      .then(response => setOlimpiadas(response.data))
      .catch(error => {
        console.error('Error al obtener olimpiadas:', error);
        setErrorGeneral('No se pudieron cargar las olimpiadas existentes');
      });
  }, []);

  // Validar todos los campos relevantes cada vez que datosFormulario cambie
  useEffect(() => {
    const nuevosErrores = {};
    const hoy = new Date().toISOString().split('T')[0];
    const normalizarTexto = (texto) => texto && texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const ERROR_NOMBRE_DUPLICADO = 'El nombre de la olimpiada ya existe. Por favor, elija otro nombre.';

    // Validación nombre
    if (!datosFormulario.nombre || datosFormulario.nombre.trim() === '') {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (/[!"#$%&/{}\[\]*]/.test(datosFormulario.nombre)) {
      nuevosErrores.nombre = 'El nombre no debe contener caracteres especiales como !"#$%&/{}[]*';
    } else {
      const nombreNormalizado = normalizarTexto(datosFormulario.nombre);
      const existe = olimpiadas.some(o => normalizarTexto(o.nombre) === nombreNormalizado);
      if (existe) {
        nuevosErrores.nombre = ERROR_NOMBRE_DUPLICADO;
      }
    }

    // Validación fechas
    if (!datosFormulario.fechaInicio || datosFormulario.fechaInicio.trim() === '') {
      nuevosErrores.fechaInicio = 'La fecha de inicio es obligatoria.';
    } else if (datosFormulario.fechaInicio < hoy) {
      nuevosErrores.fechaInicio = 'La fecha de inicio no puede ser anterior a hoy.';
    }

    if (!datosFormulario.fechaFin || datosFormulario.fechaFin.trim() === '') {
      nuevosErrores.fechaFin = 'La fecha de fin es obligatoria.';
    } else if (datosFormulario.fechaInicio && datosFormulario.fechaFin < datosFormulario.fechaInicio) {
      nuevosErrores.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio.';
    } else if (datosFormulario.fechaInicio && datosFormulario.fechaFin === datosFormulario.fechaInicio) {
      nuevosErrores.fechaFin = 'La fecha de fin debe ser al menos un día después de la fecha de inicio.';
    }

    // Validación costo
    if (datosFormulario.costo && parseFloat(datosFormulario.costo) < 0) {
      nuevosErrores.costo = 'El costo no puede ser negativo.';
    }

    // Validación max_areas
    if (datosFormulario.max_areas && parseInt(datosFormulario.max_areas) < 0) {
      nuevosErrores.max_areas = 'La máxima cantidad de áreas no puede ser negativa.';
    }

    // Validación inscripción (opcionales)
    if (datosFormulario.inicioInscripcion) {
      if (datosFormulario.fechaInicio && datosFormulario.inicioInscripcion < datosFormulario.fechaInicio) {
        nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción no puede ser anterior a la fecha de inicio de la olimpiada.';
      } else if (datosFormulario.fechaFin && datosFormulario.inicioInscripcion >= datosFormulario.fechaFin) {
        nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción no puede ser posterior ni igual a la fecha de fin de la olimpiada.';
      } else if (datosFormulario.finInscripcion && datosFormulario.inicioInscripcion >= datosFormulario.finInscripcion) {
        nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción no puede ser posterior ni igual a la fecha de fin de inscripción.';
      }
    }
    if (datosFormulario.finInscripcion) {
      if (datosFormulario.fechaFin && datosFormulario.finInscripcion > datosFormulario.fechaFin) {
        nuevosErrores.finInscripcion = 'La fecha de fin de inscripción no puede ser posterior a la fecha de finalización de la olimpiada.';
      } else if (datosFormulario.fechaInicio && datosFormulario.finInscripcion <= datosFormulario.fechaInicio) {
        nuevosErrores.finInscripcion = 'La fecha de fin de inscripción no puede ser anterior o igual a la fecha de inicio de la olimpiada.';
      } else if (datosFormulario.inicioInscripcion && datosFormulario.finInscripcion <= datosFormulario.inicioInscripcion) {
        nuevosErrores.finInscripcion = 'La fecha de fin de inscripción debe ser posterior a la fecha de inicio de inscripción.';
      }
    }
    
    setErrores(nuevosErrores);
  }, [datosFormulario, olimpiadas]);

  // Efecto separado para manejar la limpieza de successMessage
  useEffect(() => {
    if (successMessage && successMessage.includes('archivo')) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleArchivo = (e) => {
    e.stopPropagation();
    const archivo = e.target.files[0];
    if (!archivo) return;
    setDatosFormulario(prev => ({ ...prev, convocatoria: archivo }));
    setErrorGeneral('');
    setSuccessMessage(`El archivo "${archivo.name}" se ha cargado correctamente.`);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === 'descripcion' && value.length > 500) return;
    
    // Marcar el campo como tocado
    setCamposTocados(prev => ({ ...prev, [name]: true }));
    
    setDatosFormulario(prev => ({ ...prev, [name]: value }));
  };

  // Función para manejar cuando un campo pierde el foco (blur)
  const manejarBlur = (e) => {
    const { name } = e.target;
    setCamposTocados(prev => ({ ...prev, [name]: true }));
  };

  const validarFormularioCompleto = () => {
    // Solo validamos los campos obligatorios
    return (
      datosFormulario.nombre &&
      datosFormulario.fechaInicio &&
      datosFormulario.fechaFin &&
      Object.keys(errores).length === 0
    );
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    
    // Al enviar el formulario, marcar todos los campos obligatorios como tocados
    setCamposTocados(prev => ({
      ...prev,
      nombre: true,
      fechaInicio: true,
      fechaFin: true,
    }));
    
    if (!validarFormularioCompleto()) {
      setErrorGeneral('Por favor, complete todos los campos obligatorios correctamente antes de continuar.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmCrear = async () => {
    setShowConfirmModal(false);
    setAgregando(true);
    setErrorGeneral(''); // Clear any previous errors
    
    try {
      const formData = new FormData();
      formData.append('nombre', datosFormulario.nombre);
      formData.append('fecha_inicio', datosFormulario.fechaInicio);
      formData.append('fecha_fin', datosFormulario.fechaFin);
      formData.append('descripcion', datosFormulario.descripcion || '');
      formData.append('costo', datosFormulario.costo || '');
      formData.append('max_areas', datosFormulario.max_areas || '');
      if (datosFormulario.inicioInscripcion) {
        formData.append('inicio_inscripcion', datosFormulario.inicioInscripcion);
      }
      if (datosFormulario.finInscripcion) {
        formData.append('fin_inscripcion', datosFormulario.finInscripcion);
      }
      if (datosFormulario.convocatoria && datosFormulario.convocatoria instanceof File) {
        formData.append('convocatoria', datosFormulario.convocatoria);
      }
      await createOlimpiada(formData);
      // Invalidar consultas para actualizar la lista de olimpiadas
      await clienteQuery.invalidateQueries(['olimpiadas']);
      
      // Resetear formulario y campos tocados
      setDatosFormulario({
        nombre: '',
        convocatoria: '',
        descripcion: '',
        costo: '',
        max_areas: '',
        fechaInicio: '',
        fechaFin: '',
        inicioInscripcion: '',
        finInscripcion: '',
      });
      setCamposTocados({});
      
      // Pequeña pausa para asegurar que React procese todos los cambios de estado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirigir directamente con mensaje de éxito
      redirigir('/AdminLayout/Olimpiadas', { 
        state: { 
          successMessage: `La olimpiada "${datosFormulario.nombre}" se ha creado exitosamente.`,
          olimpiadaCreada: true
        } 
      });
    } catch (error) {
      console.error('Error al crear la olimpiada:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorGeneral(`Error al crear la olimpiada: ${error.response.data.message}`);
      } else {
        setErrorGeneral('Error al crear la olimpiada. Por favor, intente nuevamente.');
      }
    } finally {
      setAgregando(false);
    }
  };

  const inputArchivoRef = useRef();
  const camposObligatoriosLlenos = datosFormulario.nombre.trim() !== '' && datosFormulario.fechaInicio.trim() !== '' && datosFormulario.fechaFin.trim() !== '' && Object.keys(errores).length === 0;
  
  return (
    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl max-h-[85vh] overflow-auto">
      <h1 className="text-xl font-bold text-gray-700 mb-4 top-0 bg-gray-50 pt-2 pb-2 z-10">Datos generales de la Olimpiada</h1>

      {/* Mostrar mensaje de error general */}
      {errorGeneral && (
        <Alert 
          variant="error" 
          title="Error" 
          autoClose={true}
          autoCloseDelay={6000}
          onClose={() => setErrorGeneral('')}
        >
          <div>{errorGeneral}</div>
        </Alert>
      )}

      {/* Mostrar mensaje de éxito para archivos */}
      {successMessage && successMessage.includes("archivo") && (
        <Alert 
          variant="success" 
          title="¡Archivo cargado!" 
          autoClose={true}
          autoCloseDelay={6000}
          onClose={() => setSuccessMessage('')}
        >
          <div>{successMessage}</div>
        </Alert>
      )}

      <div className="flex flex-col">
        <form
          id="formulario-crear-olimpiada"
          onSubmit={manejarEnvio}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 bg-white p-4 rounded-2xl shadow border border-gray-200 text-sm"
        >
          {/* Campos obligatorios */}
          <FormField
            label="Nombre de la Olimpiada"
            name="nombre"
            type="text"
            placeholder="Ingrese el nombre (sin caracteres especiales)"
            colSpan={3}
            required={true}
            value={datosFormulario.nombre}
            onChange={manejarCambio}
            onBlur={manejarBlur}
            error={camposTocados.nombre ? errores.nombre : undefined}
          />
          
          <FormField
            label="Fecha de Inicio"
            name="fechaInicio"
            type="date"
            colSpan={1}
            required={true}
            value={datosFormulario.fechaInicio}
            onChange={manejarCambio}
            onBlur={manejarBlur}
            error={camposTocados.fechaInicio ? errores.fechaInicio : undefined}
          />
          
          <FormField
            label="Fecha de Finalización"
            name="fechaFin"
            type="date"
            colSpan={1}
            required={true}
            value={datosFormulario.fechaFin}
            onChange={manejarCambio}
            onBlur={manejarBlur}
            error={camposTocados.fechaFin ? errores.fechaFin : undefined}
          />
          
          {/* Campos opcionales */}
          <div className="col-span-1 md:col-span-3 mt-3 mb-1">
            <h2 className="text-md font-semibold text-gray-700">Datos adicionales (opcionales)</h2>
          </div>

          <FormField
            label="Inicio de Inscripción"
            name="inicioInscripcion"
            type="date"
            colSpan={1}
            required={false}
            helperText="Fecha de inicio inscripciones"
            value={datosFormulario.inicioInscripcion}
            onChange={manejarCambio}
            error={camposTocados.inicioInscripcion ? errores.inicioInscripcion : undefined}
          />
          
          <FormField
            label="Fin de Inscripción"
            name="finInscripcion"
            type="date"
            colSpan={1}
            required={false}
            helperText="Fecha de fin inscripciones"
            value={datosFormulario.finInscripcion}
            onChange={manejarCambio}
            error={camposTocados.finInscripcion ? errores.finInscripcion : undefined}
          />
          
          <FormField
            label="Costo"
            name="costo"
            type="number"
            placeholder="00.00 Bs"
            colSpan={1}
            required={false}
            helperText="Costo de la inscripción"
            value={datosFormulario.costo}
            onChange={manejarCambio}
            error={camposTocados.costo ? errores.costo : undefined}
          />
          
          <FormField
            label="Máxima Cantidad de Áreas por Persona"
            name="max_areas"
            type="number"
            placeholder="SIN MÁXIMO"
            colSpan={3}
            required={false}
            helperText="Máximo de áreas que un participante puede inscribirse"
            value={datosFormulario.max_areas}
            onChange={manejarCambio}
            error={camposTocados.max_areas ? errores.max_areas : undefined}
          />
          
          <div className="col-span-1 md:col-span-3">
            <label htmlFor="descripcion" className="block text-sm font-medium text-secondary-700 mb-1">
              Descripción (Máx. 500 caracteres)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={datosFormulario.descripcion}
              onChange={manejarCambio}
              placeholder="Inserte la descripción"
              className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-20 resize-none ${
                (camposTocados.descripcion && errores.descripcion)
                  ? 'border-danger-300 bg-danger-50 focus:ring-danger-500' 
                  : 'border-secondary-300 bg-white hover:border-secondary-400'
              }`}
              maxLength={500}
            />
            <p className={`text-xs mt-1 ${datosFormulario.descripcion && datosFormulario.descripcion.length >= 500 ? 'text-danger-600 font-bold' : 'text-secondary-500'}`}>
              Campo opcional - Descripción breve de la olimpiada ({datosFormulario.descripcion ? datosFormulario.descripcion.length : 0}/500 caracteres)
            </p>
          </div>

          <div className="col-span-1 md:col-span-3">
            <SubirArchivo
              nombreArchivo={datosFormulario.convocatoria && datosFormulario.convocatoria.name ? datosFormulario.convocatoria.name : "Subir la convocatoria de la olimpiada"}
              tipoArchivo="PDF"
              handleArchivo={handleArchivo}
              inputRef={inputArchivoRef}
              id="convocatoria-input"
              acceptedFormats={['pdf']}
              acceptedMimeTypes={['application/pdf']}
              acceptAttribute=".pdf,application/pdf"
              allowEdit={true}
              hasExistingFile={false} // En crear olimpiada nunca hay archivo existente
              showFileStatus={true} // Mostrar mensajes de estado
              currentFileName="" // No hay archivo actual al crear
              newFile={datosFormulario.convocatoria instanceof File ? datosFormulario.convocatoria : null}
              onCancelFile={() => {
                setDatosFormulario(prev => ({ ...prev, convocatoria: '' }));
                if (inputArchivoRef.current) {
                  inputArchivoRef.current.value = '';
                }
              }}
              baseUrl="http://127.0.0.1:8000/storage"
              fileTypeMessage="convocatoria"
              onFileValidationError={(error) => {
                setErrorGeneral(error);
              }}
            />
          </div>
        </form>

        {/* Botones siempre visibles */}
        <div className="sticky bottom-0 flex justify-end mt-4 p-3 gap-2 bg-transparent rounded-b-xl">
          <Button
            variant="outline"
            onClick={() => redirigir('/AdminLayout/Olimpiadas')}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            form="formulario-crear-olimpiada"
            disabled={agregando || !camposObligatoriosLlenos}
            loading={agregando}
          >
            Crear Olimpiada
          </Button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <Modal
          key="confirm-modal"
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmCrear}
          title="Confirmar creación de Olimpiada"
          message="¿Está seguro que desea crear esta olimpiada con los datos ingresados?"
          confirmText="Crear"
          cancelText="Cancelar"
          variant='warning'
          isLoading={agregando}
        />
      )}

      {/* Modal de éxito */}
      {successMessage && !showConfirmModal && (
        <Modal
          key="success-modal"
          isOpen={true}
          variant="success"
          title={successMessage.includes("archivo") ? "¡Archivo PDF Cargado!" : "¡Olimpiada Creada!"}
          message={successMessage}
          showCancelButton={false}
          confirmText="Aceptar"
          onClose={() => setSuccessMessage('')}
          onConfirm={() => setSuccessMessage('')}
        />
      )}
      
    </div>
  );
};

export default CrearOlimpiada