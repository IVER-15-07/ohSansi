import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { getOlimpiada, updateOlimpiada } from '../../../service/olimpiadas.api';
import { useParams, useNavigate } from 'react-router-dom';
import { PencilIcon } from '../../../src/assets/Icons';
import { LoadingSpinner, Modal, Button, SubirArchivo, FormField } from '../../components/ui';
import { ArrowLeft } from 'lucide-react';

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
  const [advertencias, setAdvertencias] = useState({});
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [datosIniciales, setDatosIniciales] = useState({});
  const [camposTocados, setCamposTocados] = useState({}); // Nuevo estado para rastrear campos tocados
  const inputArchivoRef = useRef();

  // Función para verificar si la inscripción ya comenzó (fecha de inicio de inscripción ya pasó o es hoy)
  const inscripcionYaComenzo = useMemo(() => {
    if (!olimpiada || !olimpiada.inicio_inscripcion) return false;

    const hoy = new Date();
    const hoyFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    // Parsear la fecha de inicio de inscripción
    let fechaInicioInscripcion;
    if (olimpiada.inicio_inscripcion.includes('/')) {
      // Formato DD/MM/YYYY
      const [dia, mes, ano] = olimpiada.inicio_inscripcion.split('/');
      fechaInicioInscripcion = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else {
      // Formato YYYY-MM-DD
      fechaInicioInscripcion = new Date(olimpiada.inicio_inscripcion);
    }

    return fechaInicioInscripcion <= hoyFecha;
  }, [olimpiada]);

  // Función para verificar si la fecha de fin de inscripción ya pasó
  const inscripcionYaTermino = useMemo(() => {
    if (!olimpiada || !olimpiada.fin_inscripcion) return false;

    const hoy = new Date();
    const hoyFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    // Parsear la fecha de fin de inscripción
    let fechaFinInscripcion;
    if (olimpiada.fin_inscripcion.includes('/')) {
      // Formato DD/MM/YYYY
      const [dia, mes, ano] = olimpiada.fin_inscripcion.split('/');
      fechaFinInscripcion = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    } else {
      // Formato YYYY-MM-DD
      fechaFinInscripcion = new Date(olimpiada.fin_inscripcion);
    }

    return hoyFecha > fechaFinInscripcion;
  }, [olimpiada]);

  // Verificar si se debe bloquear el acceso completo a la configuración
  const accesoBloquedoPorFechaFin = useMemo(() => {
    return inscripcionYaTermino;
  }, [inscripcionYaTermino]);

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
          max_areas: data.max_areas ? data.max_areas.toString() : null,
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

  // Efecto para verificar si el acceso debe ser bloqueado y redirigir
  useEffect(() => {
    if (olimpiada && accesoBloquedoPorFechaFin) {
      // Redirigir con mensaje de error
      redirigir('/AdminLayout/Olimpiadas', {
        state: {
          errorMessage: 'No se puede acceder a la configuración de parámetros. La fecha de fin de inscripciones ya ha pasado.',
          olimpiadaNombre: olimpiada.nombre
        }
      });
    }
  }, [olimpiada, accesoBloquedoPorFechaFin, redirigir]);

  // Solo validar cuando se esté editando un campo específico y haya sido tocado
  const validarCampos = useCallback((valores) => {
    const errs = {};
    const warns = {};

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
      if (valores.max_areas !== null && valores.max_areas !== '' && (isNaN(valores.max_areas) || Number(valores.max_areas) < 1)) {
        errs.max_areas = 'El máximo de áreas debe ser un número mayor o igual a 1, o puede dejarse vacío.';
      }
    }

    // Validaciones de fechas - solo validar si se están editando los campos respectivos y han sido tocados
    if (Object.keys(editando).some(key => ['fecha_inicio', 'fecha_fin', 'inicio_inscripcion', 'fin_inscripcion'].includes(key) && editando[key])) {
      // Obtener hoy en GMT-4 y dejar solo la fecha
      const now = new Date();
      const hoyGMT4 = soloFecha(new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - (4 * 60 * 60 * 1000)));

      const fecha_inicio = soloFecha(parseFecha(valores.fecha_inicio));
      const inicio_inscripcion = soloFecha(parseFecha(valores.inicio_inscripcion));
      const fecha_fin = soloFecha(parseFecha(valores.fecha_fin));
      const fin_inscripcion = soloFecha(parseFecha(valores.fin_inscripcion));
      const fecha_fin_original = soloFecha(parseFecha(datosIniciales.fecha_fin));
      const fin_inscripcion_original = soloFecha(parseFecha(datosIniciales.fin_inscripcion));
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

      // Advertencia para fecha_fin
    if (
        editando.fecha_fin &&
        camposTocados.fecha_fin &&
        fecha_fin &&
        fecha_fin_original &&
        fecha_fin < fecha_fin_original
      ) {
        warns.fecha_fin = 'Advertencia: La nueva fecha de fin es menor a la fecha registrada originalmente.';
      }
      // Advertencia para fin_inscripcion
      if (
        editando.fin_inscripcion &&
        camposTocados.fin_inscripcion &&
        fin_inscripcion &&
        fin_inscripcion_original &&
        fin_inscripcion < fin_inscripcion_original
      ) {
        warns.fin_inscripcion = 'Advertencia: El nuevo fin de inscripción es menor a la fecha registrada originalmente.';
      }

      // Validaciones cruzadas solo si los campos están siendo editados y han sido tocados
      if ((editando.fecha_inicio && camposTocados.fecha_inicio) || (editando.fecha_fin && camposTocados.fecha_fin)) {
        if (fecha_inicio && fecha_fin && fecha_fin <= fecha_inicio) {
          errs.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio.';
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
    setAdvertencias(warns);
  }, [editando, camposTocados, datosIniciales]);

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

    // Para max_areas, permitir valores vacíos y solo números positivos
    if (name === 'max_areas') {
      if (value === '') {
        processedValue = null; // Permitir valor vacío
      } else if (isNaN(value) || Number(value) < 1) {
        return; // No actualizar si no es un número válido >= 1
      }
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

    // Add _method parameter to tell Laravel this is a PUT request
    formData.append('_method', 'PUT');

    // Handle form fields
    Object.entries(form).forEach(([k, v]) => {
      // Skip convocatoria as it's handled separately
      if (k === 'convocatoria') {
        console.log(`Skipping convocatoria field: ${k} = ${v}`);
        return;
      }

      // Si la inscripción ya comenzó, solo permitir fin_inscripcion
      if (inscripcionYaComenzo && k !== 'fin_inscripcion') {
        console.log(`Skipping field due to inscription already started: ${k} = ${v}`);
        return;
      }

      // Handle dates
      if (['fecha_inicio', 'fecha_fin', 'inicio_inscripcion', 'fin_inscripcion'].includes(k)) {
        const formattedDate = formatDateToYYYYMMDD(v);
        if (formattedDate) {
          console.log(`Adding date field: ${k} = ${formattedDate} (original: ${v})`);
          formData.append(k, formattedDate);
        } else if (v === '' || v === null || v === undefined) {
          // Send empty string for empty dates
          console.log(`Adding empty date field: ${k} = ""`);
          formData.append(k, '');
        } else {
          console.log(`Skipping invalid date: ${k} = ${v}`);
        }
      }
      // Handle numeric fields
      else if (k === 'costo') {
        const costoValue = v === '' || v === null || v === undefined ? '0' : v.toString();
        console.log(`Adding costo field: ${k} = ${costoValue}`);
        formData.append(k, costoValue);
      }
      else if (k === 'max_areas') {
        // Si está vacío o es null, no enviamos el campo (será null en el backend)
        if (v === '' || v === null || v === undefined) {
          console.log(`Skipping max_areas field (empty/null): ${k} = ${v}`);
          return; // No agregar el campo al FormData
        }
        // Si tiene un valor, debe ser un número válido >= 1
        const valor = parseInt(v);
        if (!isNaN(valor) && valor >= 1) {
          console.log(`Adding max_areas field: ${k} = ${valor} (original: ${v})`);
          formData.append(k, valor.toString());
        } else {
          console.log(`Skipping invalid max_areas: ${k} = ${v}`);
        }
      }
      // Handle other fields (allow empty values)
      else {
        const fieldValue = v === null || v === undefined ? '' : v.toString();
        console.log(`Adding other field: ${k} = ${fieldValue}`);
        formData.append(k, fieldValue);
      }
    });

    // Handle file upload - only if inscription hasn't started
    if (archivo && !inscripcionYaComenzo) {
      formData.append('convocatoria', archivo);
    }

    // Debug: log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await updateOlimpiada(id, formData);
      
      // Mensaje de éxito más específico
      let mensajeExito = 'Configuración guardada exitosamente';
      if (archivo && !inscripcionYaComenzo) {
        mensajeExito += ' (incluyendo nueva convocatoria)';
      }
      if (inscripcionYaComenzo) {
        mensajeExito += '. Solo se actualizó la fecha de fin de inscripción';
      }
      mensajeExito += '.';
      
      setMensaje(mensajeExito);

      // Update file states after successful save
      if (archivo && !inscripcionYaComenzo) {
        setTieneArchivoExistente(true);
        setArchivoActualNombre(archivo.name);
        setArchivo(null);
        setForm(prev => ({ ...prev, convocatoria: archivo.name }));
      }

      setEditando({}); // Clear edit states
      setModal(false); // Close modal

      // Update initial data to reflect changes
      setDatosIniciales({ ...form });
      setCamposTocados({});

    } catch (error) {
      console.error('Error al guardar:', error);
      console.error('Error response:', error.response?.data);

      let errorMsg = 'Error al guardar cambios: ';

      if (error.response?.status === 422) {
        // Error de validación - mostrar detalles específicos
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMsg += `Errores de validación: ${errorMessages}`;
        } else if (error.response?.data?.message) {
          errorMsg += error.response.data.message;
        } else {
          errorMsg += 'Los datos enviados no son válidos.';
        }
      } else if (error.response?.status === 429) {
        errorMsg = 'Demasiadas solicitudes. Por favor, espere un momento e inténtelo nuevamente.';
      } else {
        errorMsg += error.response?.data?.message || 'Por favor, intente nuevamente.';
      }

      setMensaje(errorMsg);
    } finally {
      setGuardando(false);
    }
  }, [form, archivo, id, inscripcionYaComenzo]);

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

    // Determinar si el campo debe estar deshabilitado
    // Si la inscripción ya comenzó, solo se puede editar la fecha de fin de inscripción
    // Si la fecha de fin de inscripción ya pasó, no se puede editar nada
    const estaDeshabilitado = inscripcionYaTermino || (inscripcionYaComenzo && name !== 'fin_inscripcion');

    // Función para obtener texto de ayuda contextual
    const obtenerTextoAyuda = (fieldName) => {
      const textoBase = {
        nombre: 'Nombre identificativo de la olimpiada. Debe ser único y descriptivo.',
        descripcion: 'Descripción detallada de la olimpiada, objetivos y características principales.',
        costo: 'Costo de inscripción por participante. Debe ser un valor positivo.',
        max_areas: 'Número máximo de áreas en las que un participante puede inscribirse. Dejar vacío para sin límite.',
        fecha_inicio: 'Fecha de inicio de la olimpiada. Debe ser igual o posterior a hoy.',
        fecha_fin: 'Fecha de finalización de la olimpiada. Debe ser posterior a la fecha de inicio.',
        inicio_inscripcion: 'Fecha de apertura del período de inscripciones. Debe estar dentro del rango de la olimpiada.',
        fin_inscripcion: 'Fecha de cierre del período de inscripciones. Debe ser anterior o igual a la fecha de fin de la olimpiada.',
        convocatoria: 'Documento PDF con la convocatoria oficial de la olimpiada. Máximo 10MB.'
      };

      let textoContextual = textoBase[fieldName] || '';
      
      if (inscripcionYaTermino) {
        textoContextual += ' (⚠️ BLOQUEADO: La fecha de fin de inscripción ya pasó)';
      } else if (estaDeshabilitado && fieldName !== 'fin_inscripcion') {
        textoContextual += ' (⚠️ BLOQUEADO: La inscripción ya comenzó)';
      } else if (fieldName === 'fin_inscripcion' && inscripcionYaComenzo) {
        textoContextual += ' (✏️ Editable para extender el período de inscripción)';
      }
      
      return (
        <>
          {textoContextual}
          <br />
          💾 Valor actual: {getValorOriginal(name)}
        </>
      );
    };

    const advertenciaToShow = advertencias[name];

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
              helperText={obtenerTextoAyuda(name)}
              error={errorToShow}
              className={hasChanged ? "border-primary-300 cursor-pointer" : "cursor-pointer"}
              disabled={estaDeshabilitado}
              {...inputProps}
            />
              {advertenciaToShow && (
              <div className="mt-1 p-2 rounded bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs">
                {advertenciaToShow}
              </div>
            )}
          </div>
          <PencilIcon className={
            estaDeshabilitado
              ? "text-gray-400"
              : (hasChanged ? "text-primary-500" : "")
          } />
        </div>
      </div>
    );
  };

  const hayErrores = Object.keys(errores).length > 0;

  // Deshabilitar botón si hay errores o no hay cambios
  const botonDeshabilitado = hayErrores || !hayModificaciones;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Configuración de {olimpiada.nombre}
            </h1>

            {inscripcionYaTermino && (
              <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">
                      🚫 Configuración Bloqueada - La fecha de fin de inscripción ya pasó
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      No se pueden modificar los parámetros de la olimpiada porque el período de inscripciones ya ha finalizado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {inscripcionYaComenzo && !inscripcionYaTermino && (
              <div className="mb-6 p-4 rounded-md bg-orange-50 border border-orange-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-orange-700 font-medium">
                      ⚠️ Edición Limitada - La inscripción ya comenzó
                    </p>
                    <p className="text-orange-600 text-sm mt-1">
                      Solo se puede modificar la fecha de fin de inscripción para ampliar el período de inscripción. Los demás campos están deshabilitados.
                    </p>
                  </div>
                </div>
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

                    {inscripcionYaComenzo && (
                      <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                        <strong>Nota:</strong> La subida de archivos está deshabilitada porque la inscripción ya comenzó.
                      </div>
                    )}

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
                        handleArchivo={inscripcionYaComenzo ? () => { } : handleArchivo}
                        inputRef={inputArchivoRef}
                        id="input-convocatoria"
                        hasExistingFile={tieneArchivoExistente && !archivo}
                        showFileStatus={true}
                        currentFileName={archivoActualNombre}
                        newFile={archivo}
                        onCancelFile={inscripcionYaComenzo ? () => { } : limpiarArchivoSeleccionado}
                        baseUrl="http://127.0.0.1:8000/storage"
                        fileTypeMessage="convocatoria"
                        disabled={inscripcionYaComenzo}
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
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => redirigir('/AdminLayout/Olimpiadas')}
                  className="flex items-center px-6 py-2 rounded-md bg-white border border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold shadow-none"
                >
                  <ArrowLeft size={20} className="mr-2" /> Volver a Olimpiadas
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