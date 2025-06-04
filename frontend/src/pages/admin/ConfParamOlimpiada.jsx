import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { getOlimpiada, updateOlimpiada } from '../../../service/olimpiadas.api';
import { useParams, useNavigate } from 'react-router-dom';
import { PencilIcon } from '../../../src/assets/Icons';
import { LoadingSpinner , Modal, Button, SubirArchivo, FormField} from '../../components/ui';

const ConfParamOlimpiada = () => {
  const { id } = useParams();
  const redirigir = useNavigate();
  const [olimpiada, setOlimpiada] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editando, setEditando] = useState({});
  const [form, setForm] = useState({});
  
  // Estados para manejo de archivos
  const [archivo, setArchivo] = useState(null); // Archivo seleccionado para subir (nuevo)
  const [tieneArchivoExistente, setTieneArchivoExistente] = useState(false); // Si hay archivo en el servidor
  const [archivoActualNombre, setArchivoActualNombre] = useState(''); // Nombre del archivo actual en servidor

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [datosIniciales, setDatosIniciales] = useState({});
  const [camposTocados, setCamposTocados] = useState({}); // Nuevo estado para rastrear campos tocados
  const inputArchivoRef = useRef();

  // Convierte fecha de formato YYYY-MM-DD a DD/MM/YYYY para mostrar
  const formatoDDMMAAAA = useCallback((fecha) => {
    if (!fecha) return '';
    const [y, m, d] = fecha.split('-');
    if (!y || !m || !d) return fecha;
    return `${d}/${m}/${y}`;
  }, []);

  // Convierte fecha de formato YYYY-MM-DD a formato nativo del input date
  const formatoInputDate = useCallback((fecha) => {
    if (!fecha) return '';
    // Si ya está en formato YYYY-MM-DD, devolverla como está
    if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) return fecha;
    // Si está en formato DD/MM/YYYY, convertir
    const [d, m, y] = fecha.split('/');
    if (y && m && d) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return '';
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadOlimpiada = async () => {
      try {
        setIsLoading(true);
        const response = await getOlimpiada(id);
        
        if (!isMounted) return;
        
        console.log('Datos obtenidos de la API:', response);
        const data = response; // Los datos ya vienen procesados del servicio
        console.log('Datos procesados:', data);
        setOlimpiada(data);
        console.log('Estado olimpiada actualizado');
        
        // Verificar si hay un archivo existente
        if (data.convocatoria) {
          setTieneArchivoExistente(true);
          setArchivoActualNombre(data.convocatoria);
        } else {
          setTieneArchivoExistente(false);
          setArchivoActualNombre('');
        }

        console.log('Estado del archivo:', {
          convocatoria: data.convocatoria,
          tieneArchivoExistente: !!data.convocatoria,
          archivoActualNombre: data.convocatoria || ''
        });

        // Asegurarse de que todos los campos tengan un valor inicial válido
        const formData = {
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          costo: data.costo?.toString() || '',
          max_areas: data.max_areas?.toString() || '0',
          fecha_inicio: data.fecha_inicio || '',
          fecha_fin: data.fecha_fin || '',
          inicio_inscripcion: data.inicio_inscripcion || '',
          fin_inscripcion: data.fin_inscripcion || '',
          convocatoria: data.convocatoria || '',
        };
        
        setForm(formData);
        setDatosIniciales(formData);

        // Inicializar el estado de edición para todos los campos
        setEditando({
          nombre: false,
          descripcion: false,
          costo: false,
          max_areas: false,
          fecha_inicio: false,
          fecha_fin: false,
          inicio_inscripcion: false,
          fin_inscripcion: false,
          convocatoria: false,
        });
        
        // Inicializar todos los campos como no tocados
        setCamposTocados({
          nombre: false,
          descripcion: false,
          costo: false,
          max_areas: false,
          fecha_inicio: false,
          fecha_fin: false,
          inicio_inscripcion: false,
          fin_inscripcion: false,
          convocatoria: false,
        });
      } catch (error) {
        if (isMounted) {
          console.error('Error al cargar olimpiada:', error);
          setMensaje('No se pudo cargar la olimpiada. Por favor, inténtelo nuevamente.');
        }
      } finally {
        if (isMounted) {
          console.log('Finalizando carga, setIsLoading(false)');
          setIsLoading(false);
        }
      }
    };
    
    if (id) {
      loadOlimpiada();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Solo validar cuando se esté editando un campo específico y haya sido tocado
  const validarCampos = useCallback((valores) => {
    const errs = {};
    
    // Validar el nombre si está siendo editado y ha sido tocado
    if (editando.nombre && camposTocados.nombre) {
      if (!valores.nombre || valores.nombre.trim() === '') {
        errs.nombre = 'El nombre es obligatorio.';
      } else if (/[!"#$%&/{}\[\]*]/.test(valores.nombre)) {
        errs.nombre = 'El nombre no debe contener caracteres especiales como !"#$%&/{}[]*';
      }
    }
    
    // Solo validar campos que están siendo editados y han sido tocados
    if (editando.descripcion && camposTocados.descripcion && valores.descripcion && valores.descripcion.length > 500) {
      errs.descripcion = 'La descripción debe tener máximo 500 caracteres.';
    }
    
    // Costo - solo validar si se está editando y ha sido tocado
    if (editando.costo && camposTocados.costo) {
      if (!valores.costo || isNaN(valores.costo) || Number(valores.costo) < 1) {
        errs.costo = 'El costo debe ser un número mayor o igual a 1.';
      }
    }
    
    // Máximo inscripciones - solo validar si se está editando y ha sido tocado
    if (editando.max_areas && camposTocados.max_areas) {
      if (valores.max_areas === '' || isNaN(valores.max_areas)) {
        errs.max_areas = 'El máximo de áreas debe ser un número.';
      } else if (Number(valores.max_areas) < 0) {
        errs.max_areas = 'El máximo de áreas no puede ser un número negativo.';
      }
    }
    
    // Validaciones de fechas - solo validar si se están editando los campos respectivos y han sido tocados
    if (Object.keys(editando).some(key => ['fecha_inicio', 'fecha_fin', 'inicio_inscripcion', 'fin_inscripcion'].includes(key) && editando[key])) {
      // Obtener hoy en GMT-4 y dejar solo la fecha
      const now = new Date();
      const hoyGMT4 = soloFecha(new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - (4 * 60 * 60 * 1000)));

      const fecha_inicio = soloFecha(parseFecha(valores.fecha_inicio));
      const fecha_fin = soloFecha(parseFecha(valores.fecha_fin));
      const inicio_inscripcion = soloFecha(parseFecha(valores.inicio_inscripcion));
      const fin_inscripcion = soloFecha(parseFecha(valores.fin_inscripcion));

      // Validar fecha_inicio solo si se está editando y ha sido tocado
      if (editando.fecha_inicio && camposTocados.fecha_inicio) {
        if (!fecha_inicio) {
          errs.fecha_inicio = 'La fecha de inicio es obligatoria.';
        } else if (fecha_inicio < hoyGMT4) {
          errs.fecha_inicio = 'La fecha de inicio debe ser hoy o una fecha futura.';
        }
      }
      
      // Validar fecha_fin solo si se está editando y ha sido tocado
      if (editando.fecha_fin && camposTocados.fecha_fin) {
        if (!fecha_fin) {
          errs.fecha_fin = 'La fecha de fin es obligatoria.';
        } else if (fecha_fin < hoyGMT4) {
          errs.fecha_fin = 'La fecha de fin debe ser hoy o una fecha futura.';
        }
      }
      
      // Validaciones cruzadas solo si los campos están siendo editados y han sido tocados
      if ((editando.fecha_inicio && camposTocados.fecha_inicio) || (editando.fecha_fin && camposTocados.fecha_fin)) {
        if (fecha_inicio && fecha_fin && fecha_fin < fecha_inicio) {
          errs.fecha_fin = 'La fecha de fin debe ser igual o posterior a la fecha de inicio.';
        }
      }
      
      if (editando.inicio_inscripcion && camposTocados.inicio_inscripcion) {
        if (inicio_inscripcion && fecha_inicio && inicio_inscripcion < fecha_inicio) {
          errs.inicio_inscripcion = 'El inicio de inscripción debe ser igual o posterior a la fecha de inicio.';
        }
        if (inicio_inscripcion && fecha_fin && inicio_inscripcion > fecha_fin) {
          errs.inicio_inscripcion = 'El inicio de inscripción debe ser igual o anterior a la fecha de fin.';
        }
      }
      
      if (editando.fin_inscripcion && camposTocados.fin_inscripcion) {
        if (fin_inscripcion && inicio_inscripcion && fin_inscripcion < inicio_inscripcion) {
          errs.fin_inscripcion = 'El fin de inscripción debe ser igual o posterior al inicio de inscripción.';
        }
        if (fin_inscripcion && fecha_fin && fin_inscripcion > fecha_fin) {
          errs.fin_inscripcion = 'El fin de inscripción debe ser igual o anterior a la fecha de fin.';
        }
      }
    }
    setErrores(errs);
  }, [editando, camposTocados]);

  // Función para verificar si algún campo ha sido modificado
  const hayModificaciones = useMemo(() => {
    if (!datosIniciales || Object.keys(datosIniciales).length === 0) return false;
    
    // Comprobar si algún valor ha cambiado
    return Object.keys(form).some(key => {
      return form[key] !== datosIniciales[key];
    }) || archivo !== null; // Incluir cambios en el archivo
  }, [form, datosIniciales, archivo]);
  
  useEffect(() => {
    // Solo validar si hay campos siendo editados
    if (Object.keys(editando).some(key => editando[key])) {
      validarCampos(form);
    }
    
    // Limpiar mensaje cuando se hacen cambios
    if (hayModificaciones && mensaje === 'No hay cambios para guardar.') {
      setMensaje('');
    }
  }, [form, editando, validarCampos, hayModificaciones, mensaje]);

  const soloFecha = useCallback((date) => {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }, []);

  const parseFecha = useCallback((fecha) => {
    if (!fecha) return null;
    const partes = fecha.split('/');
    if (partes.length === 3) {
      // dd/mm/yyyy
      return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    }
    // yyyy-mm-dd
    const partes2 = fecha.split('-');
    if (partes2.length === 3) {
      return new Date(fecha);
    }
    return null;
  }, []);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Para campos de fecha, convertir el valor del input (YYYY-MM-DD) a DD/MM/YYYY para almacenar
    if (['fecha_inicio', 'fecha_fin', 'inicio_inscripcion', 'fin_inscripcion'].includes(name) && value) {
      processedValue = formatoDDMMAAAA(value);
    }
    
    // Para max_areas, asegurar que no se ingresen valores negativos
    if (name === 'max_areas' && processedValue < 0) {
      processedValue = '0';
    }
    
    // Marcar el campo como tocado y en edición
    setCamposTocados(prev => ({ ...prev, [name]: true }));
    setEditando(prev => ({ ...prev, [name]: true }));
    
    setForm(prev => ({ ...prev, [name]: processedValue }));
  }, [formatoDDMMAAAA]);
  
  // Función para manejar cuando un campo pierde el foco
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setCamposTocados(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleArchivo = useCallback((e) => {
    const file = e.target.files[0];
    
    // Marcar el campo como tocado y en edición
    setCamposTocados(prev => ({ ...prev, convocatoria: true }));
    setEditando(prev => ({ ...prev, convocatoria: true }));
    
    if (!file) {
      // Resetear archivo seleccionado si no hay archivo
      setArchivo(null);
      setErrores(prev => ({ ...prev, convocatoria: undefined }));
      return;
    }

    if (file.type !== "application/pdf") {
      setErrores(prev => ({ 
        ...prev, 
        convocatoria: "Solo se permiten archivos PDF." 
      }));
      setArchivo(null);
      return;
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      setErrores(prev => ({ 
        ...prev, 
        convocatoria: "El archivo no debe superar los 10MB." 
      }));
      setArchivo(null);
      return;
    }

    // Si llegamos aquí, el archivo es válido
    setArchivo(file);
    setErrores(prev => ({ ...prev, convocatoria: undefined }));
    console.log('Archivo válido seleccionado:', file.name);
    // No mostrar mensaje de éxito hasta que se guarde efectivamente
  }, []);

  const limpiarArchivoSeleccionado = useCallback(() => {
    setArchivo(null);
    setErrores(prev => ({ ...prev, convocatoria: undefined }));
    // Limpiar el input file
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = '';
    }
  }, []);

  const handleGuardar = useCallback(async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos editados como tocados para validación completa
    const camposEditados = Object.keys(editando).filter(key => editando[key]);
    const nuevosCamposTocados = { ...camposTocados };
    camposEditados.forEach(campo => {
      nuevosCamposTocados[campo] = true;
    });
    setCamposTocados(nuevosCamposTocados);
    
    // Validar nuevamente antes de guardar
    validarCampos(form);
    
    // Verificar si hay errores de validación
    if (Object.keys(errores).length > 0) {
      setMensaje('Por favor, corrija los errores antes de guardar.');
      return;
    }
    
    // Verificar si hay cambios
    if (!hayModificaciones) {
      setMensaje('No hay cambios para guardar.');
      return;
    }
    
    setModal(true);
  }, [editando, camposTocados, form, errores, hayModificaciones, validarCampos]);

  const confirmarGuardar = useCallback(async () => {
    setGuardando(true);
    setMensaje('');
    const formData = new FormData();
    
    // Helper to convert date to YYYY-MM-DD format
    const formatDateToYYYYMMDD = (dateStr) => {
      if (!dateStr) return '';
      if (dateStr.includes('/')) {
        const [dia, mes, ano] = dateStr.split('/');
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr; // Already in YYYY-MM-DD format
      }
      return '';
    };

    // Handle form fields
    // Add _method parameter to tell Laravel this is a PUT request
    formData.append('_method', 'PUT');
    
    Object.entries(form).forEach(([k, v]) => {
      // Skip empty fields but allow zero values for numeric fields
      if (v === '' || v === null || v === undefined) return;
      
      // Skip convocatoria as it's handled separately
      if (k === 'convocatoria') return;
      
      // Handle dates
      if (['fecha_inicio', 'fecha_fin', 'inicio_inscripcion', 'fin_inscripcion'].includes(k)) {
        const formattedDate = formatDateToYYYYMMDD(v);
        if (formattedDate) {
          formData.append(k, formattedDate);
        }
      } 
      // Handle numeric fields
      else if (['costo', 'max_areas'].includes(k)) {
        formData.append(k, v === '' ? '0' : v.toString());
      }
      // Handle other fields
      else {
        formData.append(k, v.toString());
      }
    });

    // Handle file upload
    if (archivo) {
      formData.append('convocatoria', archivo);
    }
    
    try {
      const response = await updateOlimpiada(id, formData);
      setMensaje('Cambios guardados correctamente.');
      
      // Update file states after successful save
      if (archivo) {
        setTieneArchivoExistente(true);
        setArchivoActualNombre(archivo.name);
        setArchivo(null);
        setForm(prev => ({ ...prev, convocatoria: archivo.name }));
      }
      
      setEditando({}); // Clear edit states
      setModal(false); // Close modal
    } catch (error) {
      const errorMsg = error.response?.status === 429 
        ? 'Demasiadas solicitudes. Por favor, espere un momento e inténtelo nuevamente.'
        : `Error al guardar cambios: ${error.response?.data?.message || 'Por favor, intente nuevamente.'}`;
      setMensaje(errorMsg);
      console.error('Error al guardar:', error);
    } finally {
      setGuardando(false);
    }
  }, [form, archivo, id, updateOlimpiada]);

  const cancelarGuardar = useCallback(() => {
    setModal(false);
  }, []);

  // Condicional de carga mejorada
  if (isLoading || !olimpiada) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner size="xl" text="Cargando parámetros..." />
      </div>
    );
  }

  // Helper para mostrar campo editable o no
  const campoEditable = (label, name, type = 'text', inputProps = {}) => {
    const getValorInput = (name, type) => {
      // Si el campo no tiene valor en el formulario, intentar obtenerlo del objeto olimpiada
      const valor = form[name] || olimpiada[name];
      
      if (valor === null || valor === undefined) return '';

      if (type === 'date') {
        return formatoInputDate(valor);
      }

      return valor.toString();
    };

    const getValorOriginal = (name) => {
      const valor = olimpiada[name];
      if (valor === null || valor === undefined) return 'No asignado';
      if (typeof valor === 'number') return valor.toString();
      return valor;
    };

    const valor = getValorInput(name, type);
    const placeholder = `Ingrese ${label.toLowerCase()}`;
    
    // Mostrar error solo si el campo ha sido tocado
    const errorToShow = camposTocados[name] ? errores[name] : undefined;
    
    // Comprobar si el valor ha cambiado respecto al original
    const valorOriginal = type === 'date' 
      ? formatoInputDate(olimpiada[name] || '') 
      : (olimpiada[name]?.toString() || '');
    const valorActual = type === 'date' ? formatoInputDate(valor) : valor;
    const hasChanged = valorActual !== valorOriginal;
    
    return (
      <div className="mb-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1">
            <FormField
              type={type}
              name={name}
              value={valor}
              label={label}
              placeholder={placeholder}
              onChange={handleChange}
              onBlur={handleBlur}
              helperText={`Valor registrado: ${getValorOriginal(name)}`}
              error={errorToShow}
              className={hasChanged ? "border-primary-300" : ""}
              {...inputProps}
            />
          </div>
          <PencilIcon className={hasChanged ? "text-primary-500" : ""}/>
        </div>
      </div>
    );
  };

  const hayErrores = Object.keys(errores).length > 0;
  
  // Deshabilitar botón si hay errores o no hay cambios
  const botonDeshabilitado = hayErrores || !hayModificaciones;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Configuración de {olimpiada.nombre}
            </h1>
            
            {mensaje && (
              <div className={`mb-6 p-4 rounded-md ${mensaje.includes('error') || mensaje.includes('corrija')
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'}`}>
                <p className={`${mensaje.includes('error') || mensaje.includes('corrija')  
                  ? 'text-red-700' 
                  : 'text-green-700'} font-medium text-center`}>
                  {mensaje}
                </p>
              </div>
            )}

            <form onSubmit={handleGuardar} encType="multipart/form-data" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {campoEditable('Nombre', 'nombre')}
                {campoEditable('Descripción', 'descripcion')}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {campoEditable('Costo', 'costo', 'number')}
                  {campoEditable('Máxima Cantidad de Áreas por Persona', 'max_areas', 'number', { min: 0 })}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {campoEditable('Fecha de Inicio', 'fecha_inicio', 'date')}
                  {campoEditable('Fecha de Fin', 'fecha_fin', 'date')}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {campoEditable('Inicio Inscripción', 'inicio_inscripcion', 'date')}
                  {campoEditable('Fin Inscripción', 'fin_inscripcion', 'date')}
                </div>

                {/* Convocatoria */}
                <div className="w-full p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col space-y-4">
                    <label className="text-sm font-semibold text-gray-700">Convocatoria:</label>

                    {/* Componente para subir archivo */}
                    <div className="flex justify-center">
                      {/* VALIDACIÓN DE ARCHIVO SUBIDO:
                         * 
                         * El componente SubirArchivo determina si hay un archivo válido usando:
                         * 1. hasExistingFile: boolean explícito (prioridad máxima)
                         * 2. nombreArchivo: debe ser un nombre de archivo válido con extensión
                         * 3. Descarta mensajes como "Subir archivo", "Ningún archivo seleccionado", etc.
                         * 
                         * En este caso:
                         * - hasExistingFile = tieneArchivoExistente && !archivo
                         *   (true solo si hay archivo en servidor Y no hay archivo nuevo seleccionado)
                         * - nombreArchivo = archivo nuevo seleccionado OR archivo existente OR mensaje por defecto
                         */}
                        <SubirArchivo
                        acceptedFormats={['pdf']}
                        acceptedMimeTypes={['application/pdf']}
                        acceptAttribute=".pdf,application/pdf"
                        maxFileSize={10 * 1024 * 1024}
                        nombreArchivo={
                          archivo ? archivo.name : 
                          (tieneArchivoExistente ? archivoActualNombre : 'Subir archivo PDF')
                        }
                        tipoArchivo="PDF"
                        handleArchivo={handleArchivo}
                        inputRef={inputArchivoRef}
                        id="input-convocatoria"
                        hasExistingFile={tieneArchivoExistente && !archivo}
                        showFileStatus={true}
                        currentFileName={archivoActualNombre}
                        newFile={archivo}
                        onCancelFile={limpiarArchivoSeleccionado}
                        baseUrl="http://127.0.0.1:8000/storage"
                        fileTypeMessage="convocatoria"
                        onFileValidationError={(error) => {
                          setErrores(prev => ({ ...prev, convocatoria: error }));
                        }}
                      />
                    </div>
                  </div>
                  
                  {errores.convocatoria && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600">{errores.convocatoria}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => redirigir('/AdminLayout/Olimpiadas')}
                  className="px-6"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={guardando}
                  disabled={botonDeshabilitado}
                  className="px-6"
                  title={botonDeshabilitado ? (hayErrores ? 'Corrija los errores antes de guardar' : 'No hay cambios para guardar') : 'Guardar cambios'}
                >
                  {guardando ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modal && (
        <Modal
          isOpen={modal}
          onClose={() => setModal(false)}
          title="Confirmar cambios"
          message={`¿Está seguro de guardar los cambios en los parámetros de la olimpiada: ${olimpiada.nombre}?`}
          onConfirm={confirmarGuardar}
          onCancel={cancelarGuardar}
          confirmText="Confirmar"
          cancelText="Cancelar"
          variant="warning"
        />
      )}
    </div>
  );
};

export default ConfParamOlimpiada;