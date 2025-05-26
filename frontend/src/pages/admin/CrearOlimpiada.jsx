import React, { useEffect, useRef} from 'react'
import { useState } from 'react';
import { createOlimpiada, getOlimpiadas } from '../../../service/olimpiadas.api';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SubirArchivo from '../../components/SubirArchivo';
import ConfirmationModal from '../../components/ConfirmationModal';
import Modal from '../../components/Modal';


const CrearOlimpiada = () => {
  const clienteQuery = useQueryClient();
  const redirigir = useNavigate();

  const [olimpiadas, setOlimpiadas] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

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
  const [errorGeneral, setErrorGeneral] = useState(''); // Estado para el mensaje de error general

  useEffect(() => {
    getOlimpiadas()
      .then(response => setOlimpiadas(response.data))
      .catch(error => console.error('Error al obtener olimpiadas:', error));
  }, []);

  const handleArchivo = (e) => {
    e.stopPropagation(); // Evita que el evento se propague al formulario
    const archivo = e.target.files[0]; // Obtén el archivo seleccionado
    if(!archivo) return;
    // Validar archivo PDF
    if (archivo.type !== "application/pdf"){
      setErrores(prev => ({ ...prev, convocatoria: "Solo se permite subir archivos PDF." }));
      setDatosFormulario(prev => ({ ...prev, convocatoria: "" }));
      return;
    }
    // Si pasa las validaciones
    setErrores(prev => ({ ...prev, convocatoria: undefined }));
    setDatosFormulario((prev) => ({
      ...prev,
      convocatoria: archivo, // Actualiza el estado con el archivo
    }));
  };

  const normalizarTexto = (texto) =>
    texto && texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const ERROR_NOMBRE_DUPLICADO = 'El nombre de la olimpiada ya existe. Por favor, elija otro nombre.';

  const validarCampo = (campo, valor, datosPersonalizados = null) => {
    const datos = datosPersonalizados || datosFormulario;
    const nuevosErrores = { ...errores };
    const hoy = new Date().toISOString().split("T")[0];

    // Debug logging
    if (['fechaInicio', 'fechaFin', 'inicioInscripcion', 'finInscripcion'].includes(campo)) {
      console.log(`🔍 Validando ${campo} con valor "${valor}"`);
      console.log(`📅 Datos disponibles:`, {
        fechaInicio: datos.fechaInicio,
        fechaFin: datos.fechaFin,
        inicioInscripcion: datos.inicioInscripcion,
        finInscripcion: datos.finInscripcion
      });
    }

    switch (campo) {
      case 'nombre':
        if (!valor || valor.trim() === '') {
          nuevosErrores.nombre = 'El nombre es obligatorio.';
        } else if (/[!"#$%&/{}[\]*]/.test(valor)) {
          nuevosErrores.nombre = 'El nombre no debe contener caracteres especiales como !"#$%&/{}[]*';
        } else {
            const nombreNormalizado = normalizarTexto(valor);
            const existe = olimpiadas.some(o => normalizarTexto(o.nombre) === nombreNormalizado);
          if (existe) {
            nuevosErrores.nombre = ERROR_NOMBRE_DUPLICADO;
          } else {
            delete nuevosErrores.nombre;
          }
        }
        break;

      case 'fechaInicio':
        if (!valor || valor.trim() === '') {
          nuevosErrores.fechaInicio = 'La fecha de inicio es obligatoria.';
        } else if (valor < hoy) {
          nuevosErrores.fechaInicio = 'La fecha de inicio no puede ser anterior a hoy.';
        } else {
          delete nuevosErrores.fechaInicio;
        }
        break;

      case 'fechaFin':
        if (!valor || valor.trim() === '') {
          nuevosErrores.fechaFin = 'La fecha de fin es obligatoria.';
        } else if (datos.fechaInicio && valor < datos.fechaInicio) {
          nuevosErrores.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio.';
        } else if (datos.fechaInicio && valor === datos.fechaInicio) {
          nuevosErrores.fechaFin = 'La fecha de fin debe ser al menos un día después de la fecha de inicio.';
        } else {
          delete nuevosErrores.fechaFin;
        }
        break;

      case 'costo':
        if (valor && parseFloat(valor) < 0) {
          nuevosErrores.costo = 'El costo no puede ser negativo.';
        } else {
          delete nuevosErrores.costo;
        }
        break;

      case 'inicioInscripcion':
        if (!valor) {
          delete nuevosErrores.inicioInscripcion;
        } else if (datos.fechaInicio && valor < datos.fechaInicio) {
          nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción no puede ser anterior a la fecha de inicio de la olimpiada.';
        } else if (datos.fechaFin && valor > datos.fechaFin) {
          nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción no puede ser posterior a la fecha de fin de la olimpiada.';
        } else if (datos.finInscripcion && valor > datos.finInscripcion) {
          nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción no puede ser posterior a la fecha de fin de inscripción.';
        } else {
          delete nuevosErrores.inicioInscripcion;
        }
        break;

      case 'finInscripcion':
        if (!valor) {
          delete nuevosErrores.finInscripcion;
        } else if (datos.fechaFin && valor > datos.fechaFin) {
          nuevosErrores.finInscripcion = 'La fecha de fin de inscripción no puede ser posterior a la fecha de finalización de la olimpiada.';
        } else if (datos.fechaInicio && valor <= datos.fechaInicio) {
          nuevosErrores.finInscripcion = 'La fecha de fin de inscripción no puede ser anterior o igual a la fecha de inicio de la olimpiada.';
        } else if (datos.inicioInscripcion && valor < datos.inicioInscripcion) {
          nuevosErrores.finInscripcion = 'La fecha de fin de inscripción no puede ser anterior a la fecha de inicio de inscripción.';
        } else if (datos.inicioInscripcion && valor <= datos.inicioInscripcion) {
          nuevosErrores.finInscripcion = 'La fecha de fin de inscripción debe ser posterior a la fecha de inicio de inscripción.';
        } else {
          delete nuevosErrores.finInscripcion;
        }
        break;

      // Los otros campos ya no son obligatorios
      default:
        break;
    }

    setErrores(nuevosErrores);
    return !nuevosErrores[campo]; // Retorna true si el campo es válido
  };

  // Función para revalidar campos relacionados cuando cambian las dependencias
  const validarCamposRelacionados = (campoModificado, datosActualizados) => {
    const camposParaRevalidar = [];

    switch (campoModificado) {
      case 'fechaInicio':
        // Si cambia la fecha de inicio, revalidar fechaFin, inicioInscripcion y finInscripcion
        camposParaRevalidar.push('fechaFin', 'inicioInscripcion', 'finInscripcion');
        break;
      case 'fechaFin':
        // Si cambia la fecha de fin, revalidar inicioInscripcion y finInscripcion
        camposParaRevalidar.push('inicioInscripcion', 'finInscripcion');
        break;
      case 'inicioInscripcion':
        // Si cambia inicio de inscripción, revalidar fin de inscripción
        camposParaRevalidar.push('finInscripcion');
        break;
      case 'finInscripcion':
        // Si cambia fin de inscripción, revalidar inicio de inscripción
        camposParaRevalidar.push('inicioInscripcion');
        break;
    }

    // Revalidar cada campo relacionado inmediatamente
    // IMPORTANTE: Validamos tanto campos con valor como campos vacíos
    // porque un campo vacío puede ahora tener errores debido al cambio de dependencias
    camposParaRevalidar.forEach(campo => {
      const valorCampo = datosActualizados[campo] || '';
      validarCampo(campo, valorCampo, datosActualizados);
    });
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    // Limitación para la descripción (500 caracteres)
    if (name === 'descripcion' && value.length > 500) {
      return;
    }

    setDatosFormulario(prev => {
      const datosActualizados = { ...prev, [name]: value };
      
      // Validar el campo actual
      validarCampo(name, value, datosActualizados);
      
      // Revalidar campos relacionados si es necesario
      if (['fechaInicio', 'fechaFin', 'inicioInscripcion', 'finInscripcion'].includes(name)) {
        validarCamposRelacionados(name, datosActualizados);
      }
      
      return datosActualizados;
    });
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    validarCampo(name, value);
  };

  const validarFormularioCompleto = () => {
    // Solo validamos los campos obligatorios
    const camposObligatorios = ['nombre', 'fechaInicio', 'fechaFin'];
    let formularioValido = true;
    
    camposObligatorios.forEach(campo => {
      const esValido = validarCampo(campo, datosFormulario[campo]);
      if (!esValido) formularioValido = false;
    });

    // Validación adicional para fechas de inscripción
    if (datosFormulario.inicioInscripcion) {
      const esValido = validarCampo('inicioInscripcion', datosFormulario.inicioInscripcion);
      if (!esValido) formularioValido = false;
    }
    
    if (datosFormulario.finInscripcion) {
      const esValido = validarCampo('finInscripcion', datosFormulario.finInscripcion);
      if (!esValido) formularioValido = false;
    }
    
    return formularioValido;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorGeneral('');

    // Verificar campos obligatorios antes de continuar
    if (!datosFormulario.nombre || datosFormulario.nombre.trim() === '') {
      setErrores(prev => ({ ...prev, nombre: 'El nombre es obligatorio.' }));
      return;
    }
    
    if (!datosFormulario.fechaInicio || datosFormulario.fechaInicio.trim() === '') {
      setErrores(prev => ({ ...prev, fechaInicio: 'La fecha de inicio es obligatoria.' }));
      return;
    }
    
    if (!datosFormulario.fechaFin || datosFormulario.fechaFin.trim() === '') {
      setErrores(prev => ({ ...prev, fechaFin: 'La fecha de fin es obligatoria.' }));
      return;
    }

    // Validar campos obligatorios
    if (!validarFormularioCompleto()) {
      setErrorGeneral('Por favor, complete todos los campos obligatorios correctamente antes de continuar.');
      return;
    }

    // Mostrar modal de confirmación si todo es válido
    setShowConfirmModal(true);
  };

  const handleConfirmCrear = async () => {
    setShowConfirmModal(false);
    setAgregando(true);
    try {
      // Crear FormData para enviar datos incluyendo el archivo
      const formData = new FormData();
      formData.append('nombre', datosFormulario.nombre);
      formData.append('fecha_inicio', datosFormulario.fechaInicio);
      formData.append('fecha_fin', datosFormulario.fechaFin);
      
      // Agregar campos opcionales solo si tienen valor
      if (datosFormulario.descripcion) {
        formData.append('descripcion', datosFormulario.descripcion);
      } else {
        formData.append('descripcion', ''); // Enviar cadena vacía en lugar de omitir
      }
      
      if (datosFormulario.costo) {
        formData.append('costo', datosFormulario.costo);
      } else {
        formData.append('costo', ''); // Enviar cadena vacía en lugar de omitir
      }
      
      if (datosFormulario.max_areas) {
        formData.append('max_areas', datosFormulario.max_areas);
      } else {
        formData.append('max_areas', ''); // Enviar cadena vacía en lugar de omitir
      }
      
      if (datosFormulario.inicioInscripcion) {
        formData.append('inicio_inscripcion', datosFormulario.inicioInscripcion);
      }
      // Si no se especifica, no se envía el campo para que sea null
      
      if (datosFormulario.finInscripcion) {
        formData.append('fin_inscripcion', datosFormulario.finInscripcion);
      }
      // Si no se especifica, no se envía el campo para que sea null
      
      // Agregar el archivo solo si existe y es un objeto File válido
      if (datosFormulario.convocatoria && datosFormulario.convocatoria instanceof File) {
        formData.append('convocatoria', datosFormulario.convocatoria);
      } else {
        // Importante: NO enviamos un campo vacío para 'convocatoria' cuando no hay archivo
        // Esto garantiza que el backend no intente procesar un archivo inexistente
      }

      await createOlimpiada(formData);
      clienteQuery.invalidateQueries(['olimpiadas']);
      setSuccessModalOpen(true); // Mostrar modal de éxito
    } catch (error) {
      console.error('Error al crear la olimpiada:', error);
      
      // Mensaje de error más detallado si está disponible
      if (error.response && error.response.data && error.response.data.message) {
        setErrorGeneral(`Error al crear la olimpiada: ${error.response.data.message}`);
      } else {
        setErrorGeneral('Error al crear la olimpiada. Por favor, intente nuevamente.');
      }
    } finally {
      setAgregando(false);
    }
  };

  const campoFormulario = (etiqueta, nombreCampo, tipo = 'text', placeholder = '', colSpan = 1, obligatorio = false, nota = null) => (
    <div className={`col-span-1 md:col-span-${colSpan}`}>
      <label className="block font-medium text-gray-600 mb-1 text-sm">
        {etiqueta} {obligatorio && <span className="text-red-500">*</span>}
      </label>
      <input
        type={tipo}
        name={nombreCampo}
        value={datosFormulario[nombreCampo]}
        onChange={manejarCambio}
        onInput={tipo === 'date' ? manejarCambio : undefined} // Agregar onInput para campos de fecha
        onBlur={manejarBlur}
        placeholder={placeholder}
        className={`w-full p-1.5 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-1 text-sm ${errores[nombreCampo] ? 'border-red-500 ring-red-300' : 'focus:ring-blue-500'
          }`}
      />
      {errores[nombreCampo] && <p className="text-red-600 text-xs mt-1">{errores[nombreCampo]}</p>}
      {!obligatorio && !errores[nombreCampo] && <p className="text-gray-400 text-xs mt-1">{nota || "Campo opcional"}</p>}
    </div>
  );
  const inputArchivoRef = useRef();
  // Determinar si los campos obligatorios están completos y no hay errores
  const camposObligatoriosLlenos = datosFormulario.nombre.trim() !== '' && datosFormulario.fechaInicio.trim() !== '' && datosFormulario.fechaFin.trim() !== '' && Object.keys(errores).every(k => !errores[k]) && !errores.nombre;
  return (
    <div className="w-full px-4 py-3 bg-gray-50 rounded-xl max-h-[85vh] overflow-auto">
      <h1 className="text-xl font-bold text-gray-700 mb-4 top-0 bg-gray-50 pt-2 pb-2 z-10">Datos generales de la Olimpiada</h1>

      {/* Mostrar mensaje de error general debajo del título */}
      {errorGeneral && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded-lg border border-red-300 text-sm">
          {errorGeneral}
        </div>
      )}

      <div className="flex flex-col">
        <form
          id="formulario-crear-olimpiada"
          onSubmit={manejarEnvio}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 bg-white p-4 rounded-2xl shadow border border-gray-200 text-sm"
        >
          {/* Campos obligatorios */}
          {campoFormulario('Nombre de la Olimpiada', 'nombre', 'text', 'Ingrese el nombre (sin caracteres especiales)', 3, true)}
          {campoFormulario('Fecha de Inicio', 'fechaInicio', 'date', '', 1, true)}
          {campoFormulario('Fecha de Finalización', 'fechaFin', 'date', '', 1, true)}
          
          {/* Campos opcionales */}
          <div className="col-span-1 md:col-span-3 mt-3 mb-1">
            <h2 className="text-md font-semibold text-gray-700">Datos adicionales (opcionales)</h2>
          </div>

          {/* Campos de inscripción sin estilos especiales */}
          <div className="col-span-1 md:col-span-1">
            {campoFormulario('Inicio de Inscripción', 'inicioInscripcion', 'date', '', 1, false, "Si se deja vacío, se usará la fecha de inicio")}
          </div>
          <div className="col-span-1 md:col-span-1">
            {campoFormulario('Fin de Inscripción', 'finInscripcion', 'date', '', 1, false, "Si se deja vacío, se usará la fecha de finalización")}
          </div>
          
          {campoFormulario('Costo', 'costo', 'number', '00.00 Bs', 1, false, "Costo de la inscripción")}
          {campoFormulario('Máxima Cantidad de Áreas por Persona', 'max_areas', 'number', "SIN MÁXIMO", 3, false, "Máximo de áreas que un participante puede inscribirse")}
          
          <div className="col-span-1 md:col-span-3">
            <label className="block font-medium text-gray-600 mb-1 text-sm">Descripción (Máx. 500 caracteres)</label>
            <textarea
              name="descripcion"
              value={datosFormulario.descripcion}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              placeholder="Inserte la descripción"
              className={`w-full p-1.5 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-1 h-20 resize-none text-sm ${errores.descripcion ? 'border-red-500 ring-red-300' : 'focus:ring-blue-500'
                }`}
              maxLength={500}
            />
            <p className={`text-xs mt-1 ${datosFormulario.descripcion && datosFormulario.descripcion.length >= 500 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>Campo opcional - Descripción breve de la olimpiada ({datosFormulario.descripcion ? datosFormulario.descripcion.length : 0}/500 caracteres)</p>
          </div>

          <div className="col-span-1 md:col-span-3">
            <SubirArchivo
              nombreArchivo={datosFormulario.convocatoria && datosFormulario.convocatoria.name ? datosFormulario.convocatoria.name : "Subir la convocatoria de la olimpiada"}
              tipoArchivo="pdf"
              handleArchivo={handleArchivo}
              inputRef={inputArchivoRef}
              id="convocatoria-input" // Añadiendo un ID único
            />
            {errores.convocatoria && (
              <p className="text-gray-400 text-xs mt-1">{errores.convocatoria}</p>
            )}
          </div>
        </form>

        {/* Botones siempre visibles */}
        <div className="sticky bottom-0 flex justify-end mt-4 p-3 gap-2 bg-transparent rounded-b-xl border-t border-gray-200">
          <button
            type="button"
            onClick={() => redirigir('/AdminLayout/Olympiad')}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="formulario-crear-olimpiada"
            disabled={agregando || !camposObligatoriosLlenos}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${agregando || !camposObligatoriosLlenos
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
          >
            {agregando ? 'Cargando...' : 'Crear Olimpiada'}
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCrear}
        title="Confirmar creación de Olimpiada"
        message="¿Está seguro que desea crear esta olimpiada con los datos ingresados?"
        confirmText="Crear"
        cancelText="Cancelar"
        isLoading={agregando}
        confirmButtonColor="blue"
      />
      {/* Modal de éxito */}
      {successModalOpen && (
        <Modal
          message="La olimpiada se ha registrado exitosamente."
          onClose={() => {
            setSuccessModalOpen(false);
            redirigir('/AdminLayout/Olympiad');
          }}
        />
      )}
    </div>
  );
};

export default CrearOlimpiada