import { useEffect, useRef, useState, useCallback } from 'react'
import { createOlimpiada, getOlimpiadas } from '../../../service/olimpiadas.api';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Modal, ConfirmationModal, SubirArchivo, Input, Button } from '../../components/ui/';
import { useDebounce } from '../../hooks/useDebounce';

const CrearOlimpiada = () => {
  const clienteQuery = useQueryClient();
  const redirigir = useNavigate();

  const [olimpiadas, setOlimpiadas] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [validandoCampos, setValidandoCampos] = useState({});

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
  const [errorGeneral, setErrorGeneral] = useState('');

  // Función para cargar olimpiadas
  const cargarOlimpiadas = async () => {
    try {
      const response = await getOlimpiadas();
      setOlimpiadas(response.data);
    } catch (error) {
      console.error('Error al obtener olimpiadas:', error);
      setErrorGeneral('Error al cargar la lista de olimpiadas existentes.');
    }
  };

  // Función de validación sin debounce
  const validarCampo = async (nombreCampo, valor) => {
    if (nombreCampo !== 'nombre' || !valor || valor.trim() === '') return;
    
    setValidandoCampos(prev => ({ ...prev, [nombreCampo]: true }));
    
    try {
      const normalizarTexto = (texto) => 
        texto && texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      
      const nombreNormalizado = normalizarTexto(valor);
      const existe = olimpiadas.some(o => normalizarTexto(o.nombre) === nombreNormalizado);
      
      if (existe) {
        setErrores(prev => ({ 
          ...prev, 
          [nombreCampo]: 'El nombre de la olimpiada ya existe. Por favor, elija otro nombre.' 
        }));
      } else {
        setErrores(prev => {
          const newErrors = { ...prev };
          delete newErrors[nombreCampo];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error validando campo:', error);
    } finally {
      setValidandoCampos(prev => ({ ...prev, [nombreCampo]: false }));
    }
  };

  // Usar el hook personalizado de debounce
  const validarCampoEnTiempoReal = useDebounce(validarCampo, 500);

  useEffect(() => {
    cargarOlimpiadas();
  }, []);

  // Validación local mejorada
  useEffect(() => {
    const nuevosErrores = {};
    const hoy = new Date().toISOString().split('T')[0];
    const normalizarTexto = (texto) => texto && texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    // Validación nombre (solo si no se está validando en tiempo real)
    if (!validandoCampos.nombre) {
      if (!datosFormulario.nombre || datosFormulario.nombre.trim() === '') {
        nuevosErrores.nombre = 'El nombre es obligatorio.';
      } else if (/[!"#$%&/{}\[\]*]/.test(datosFormulario.nombre)) {
        nuevosErrores.nombre = 'El nombre no debe contener caracteres especiales como !"#$%&/{}[]*';
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

    // Solo actualizar errores si hay cambios significativos
    const erroresActualesStr = JSON.stringify(errores);
    const nuevosErroresStr = JSON.stringify(nuevosErrores);
    if (erroresActualesStr !== nuevosErroresStr) {
      setErrores(nuevosErrores);
    }
  }, [datosFormulario, validandoCampos]);

  const handleArchivo = (e) => {
    e.stopPropagation();
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (archivo.type !== 'application/pdf') {
      setErrores(prev => ({ ...prev, convocatoria: 'Solo se permite subir archivos PDF.' }));
      setDatosFormulario(prev => ({ ...prev, convocatoria: '' }));
      return;
    }
    setErrores(prev => ({ ...prev, convocatoria: undefined }));
    setDatosFormulario(prev => ({ ...prev, convocatoria: archivo }));
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === 'descripcion' && value.length > 500) return;
    
    setDatosFormulario(prev => ({ ...prev, [name]: value }));
    
    // Validación en tiempo real para campos críticos
    if (name === 'nombre') {
      validarCampoEnTiempoReal(name, value);
    }
  };

  const validarFormularioCompleto = () => {
    return (
      datosFormulario.nombre &&
      datosFormulario.fechaInicio &&
      datosFormulario.fechaFin &&
      Object.keys(errores).length === 0 &&
      !Object.values(validandoCampos).some(validando => validando)
    );
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    if (!validarFormularioCompleto()) {
      setErrorGeneral('Por favor, complete todos los campos obligatorios correctamente antes de continuar.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmCrear = async () => {
    setShowConfirmModal(false);
    setAgregando(true);
    
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
      
      const response = await createOlimpiada(formData);
      
      // Verificar que la respuesta sea exitosa
      if (response && (response.success || response.data)) {
        clienteQuery.invalidateQueries(['olimpiadas']);
        setSuccessModalOpen(true);
        
        // Auto-redirección después de 3 segundos
        setTimeout(() => {
          if (successModalOpen) {
            setSuccessModalOpen(false);
            redirigir('/AdminLayout/VistaOlimpiadas');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error al crear la olimpiada:', error);
      
      // Recargar la lista de olimpiadas para asegurar que tenemos datos actuales
      await cargarOlimpiadas();
      
      if (error.response && error.response.data) {
        const { message, field } = error.response.data;
        
        // Si el error es específico del campo nombre, actualizar el error del campo
        if (field === 'nombre') {
          setErrores(prev => ({ ...prev, nombre: message }));
          setErrorGeneral('');
        } else {
          setErrorGeneral(message || 'Error al crear la olimpiada. Por favor, intente nuevamente.');
        }
      } else {
        setErrorGeneral('Error al crear la olimpiada. Por favor, intente nuevamente.');
      }
    } finally {
      setAgregando(false);
    }
  };

  const inputArchivoRef = useRef();
  const camposObligatoriosLlenos = validarFormularioCompleto();

  return (
    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl max-h-[85vh] overflow-auto">
      <h1 className="text-xl font-bold text-gray-700 mb-4 top-0 bg-gray-50 pt-2 pb-2 z-10">
        Datos generales de la Olimpiada
      </h1>

      {/* Mostrar mensaje de error general */}
      {errorGeneral && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-lg border border-red-300 text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorGeneral}
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <form
          id="formulario-crear-olimpiada"
          onSubmit={manejarEnvio}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 bg-white p-6 rounded-2xl shadow border border-gray-200"
        >
          {/* Campos obligatorios */}
          <div className="col-span-3">
            <Input
              label="Nombre de la Olimpiada"
              name="nombre"
              value={datosFormulario.nombre}
              onChange={manejarCambio}
              placeholder="Ingrese el nombre (sin caracteres especiales)"
              error={errores.nombre}
              required
              loading={validandoCampos.nombre}
              className="w-full"
            />
          </div>

          <Input
            label="Fecha de Inicio"
            name="fechaInicio"
            type="date"
            value={datosFormulario.fechaInicio}
            onChange={manejarCambio}
            error={errores.fechaInicio}
            required
            className="w-full"
          />

          <Input
            label="Fecha de Finalización"
            name="fechaFin"
            type="date"
            value={datosFormulario.fechaFin}
            onChange={manejarCambio}
            error={errores.fechaFin}
            required
            className="w-full"
          />

          <div className="col-span-1"></div> {/* Espaciador */}

          {/* Campos opcionales */}
                <div className="col-span-3 mt-4 mb-2">
                <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
                  Datos adicionales (opcionales)
                </h2>
                </div>

                <Input
                label="Inicio de Inscripción"
                name="inicioInscripcion"
                type="date"
                value={datosFormulario.inicioInscripcion}
                onChange={manejarCambio}
                error={errores.inicioInscripcion}
                helperText="Fecha de inicio de inscripciones"
                className="w-full"
                />

                <Input
                label="Fin de Inscripción"
                name="finInscripcion"
                type="date"
                value={datosFormulario.finInscripcion}
                onChange={manejarCambio}
                error={errores.finInscripcion}
                helperText="Fecha de fin de inscripciones"
                className="w-full"
                />

                <Input
                label="Costo"
                name="costo"
                type="number"
                min="0"
                step="0.01"
                value={datosFormulario.costo}
                onChange={manejarCambio}
                placeholder="0.00"
                error={errores.costo}
                helperText="Costo de la inscripción en Bs"
                className="w-full"
                />

                <div className="col-span-3">
                <Input
                  label="Máxima Cantidad de Áreas por Persona"
                  name="max_areas"
                  type="number"
                  min="1"
                  value={datosFormulario.max_areas}
                  onChange={manejarCambio}
                  placeholder="SIN MÁXIMO"
                  error={errores.max_areas}
                  helperText="Máximo de áreas que un participante puede inscribirse"
                  className="w-full"
                />
                </div>

                <div className="col-span-3">
                 
                <label className="block font-medium text-gray-600 mb-1 text-sm">Descripción (Máx. 500 caracteres)</label>
                <textarea
                  name="descripcion"
                  value={datosFormulario.descripcion}
                  onChange={manejarCambio}
                  placeholder="Inserte la descripción"
                  className={`w-full p-1.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-1 h-20 resize-none text-sm ${errores.descripcion ? 'border-red-500 ring-red-300' : 'focus:ring-blue-500'
                  }`}
                  maxLength={500}
                />
                <p className={`text-xs mt-1 ${datosFormulario.descripcion && datosFormulario.descripcion.length >= 500 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>Campo opcional - Descripción breve de la olimpiada ({datosFormulario.descripcion ? datosFormulario.descripcion.length : 0}/500 caracteres)</p>
                
                </div>

                <div className="col-span-3">
                <label className="block font-medium text-gray-700 mb-2">
                  Convocatoria (PDF)
                </label>
                <SubirArchivo
                  nombreArchivo={datosFormulario.convocatoria && datosFormulario.convocatoria.name 
                  ? datosFormulario.convocatoria.name 
                  : "Subir la convocatoria de la olimpiada"}
                  tipoArchivo="pdf"
                  handleArchivo={handleArchivo}
                  inputRef={inputArchivoRef}
                  id="convocatoria-input"
                />
                {errores.convocatoria && (
                  <p className="text-red-600 text-sm mt-1">{errores.convocatoria}</p>
                )}
                {!errores.convocatoria && (
                  <p className="text-gray-500 text-sm mt-1">Archivo opcional en formato PDF</p>
                )}
                </div>
              </form>

              {/* Botones mejorados */}
        <div className="sticky bottom-0 flex justify-end mt-6 p-4 gap-3 bg-white rounded-xl border-t border-gray-200 shadow-sm">
          <Button
            variant="secondary"
            onClick={() => redirigir('/AdminLayout/VistaOlimpiadas')}
            disabled={agregando}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            form="formulario-crear-olimpiada"
            disabled={agregando || !camposObligatoriosLlenos}
            loading={agregando}
            variant="primary"
          >
            {agregando ? 'Creando Olimpiada...' : 'Crear Olimpiada'}
          </Button>
        </div>
      </div>

      {/* Modal de confirmación mejorado */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => !agregando && setShowConfirmModal(false)}
        onConfirm={handleConfirmCrear}
        title="Confirmar creación de Olimpiada"
        message="¿Está seguro que desea crear esta olimpiada con los datos ingresados? Una vez creada, podrá configurar las áreas y niveles disponibles."
        confirmText="Crear Olimpiada"
        cancelText="Revisar datos"
        isLoading={agregando}
        variant="primary"
      />

      {/* Modal de éxito mejorado */}
      <Modal
        isOpen={successModalOpen}
        title="¡Olimpiada creada exitosamente!"
        onClose={() => {
          setSuccessModalOpen(false);
          redirigir('/AdminLayout/VistaOlimpiadas');
        }}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            La olimpiada se ha registrado exitosamente
          </h3>
          
          <p className="text-gray-600 mb-6">
            Ahora puede proceder a configurar las áreas y niveles disponibles para esta olimpiada.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setSuccessModalOpen(false);
                redirigir('/AdminLayout/VistaOlimpiadas');
              }}
            >
              Ver todas las olimpiadas
            </Button>
            
            <Button
              variant="primary"
              onClick={() => {
                setSuccessModalOpen(false);
                redirigir('/AdminLayout/VistaOlimpiadas');
              }}
            >
              Continuar
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Esta ventana se cerrará automáticamente en unos segundos...
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CrearOlimpiada;