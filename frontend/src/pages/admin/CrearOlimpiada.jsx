import { useEffect, useRef, useState } from 'react'
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
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    getOlimpiadas()
      .then(response => setOlimpiadas(response.data))
      .catch(error => console.error('Error al obtener olimpiadas:', error));
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
      await createOlimpiada(formData);
      clienteQuery.invalidateQueries(['olimpiadas']);
      setSuccessModalOpen(true);
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
        placeholder={placeholder}
        className={`w-full p-1.5 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-1 text-sm ${errores[nombreCampo] ? 'border-red-500 ring-red-300' : 'focus:ring-blue-500'
          }`}
      />
      {errores[nombreCampo] && <p className="text-red-600 text-xs mt-1">{errores[nombreCampo]}</p>}
      {!obligatorio && !errores[nombreCampo] && <p className="text-gray-400 text-xs mt-1">{nota || "Campo opcional"}</p>}
    </div>
  );
  const inputArchivoRef = useRef();
  const camposObligatoriosLlenos = datosFormulario.nombre.trim() !== '' && datosFormulario.fechaInicio.trim() !== '' && datosFormulario.fechaFin.trim() !== '' && Object.keys(errores).length === 0;
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
            {campoFormulario('Inicio de Inscripción', 'inicioInscripcion', 'date', '', 1, false,"Fecha de inicio inscripciones")}
          </div>
          <div className="col-span-1 md:col-span-1">
            {campoFormulario('Fin de Inscripción', 'finInscripcion', 'date', '', 1, false, "Fecha de fin inscripciones")}
          </div>
          
          {campoFormulario('Costo', 'costo', 'number', '00.00 Bs', 1, false, "Costo de la inscripción")}
          {campoFormulario('Máxima Cantidad de Áreas por Persona', 'max_areas', 'number', "SIN MÁXIMO", 3, false, "Máximo de áreas que un participante puede inscribirse")}
          
          <div className="col-span-1 md:col-span-3">
            <label className="block font-medium text-gray-600 mb-1 text-sm">Descripción (Máx. 500 caracteres)</label>
            <textarea
              name="descripcion"
              value={datosFormulario.descripcion}
              onChange={manejarCambio}
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