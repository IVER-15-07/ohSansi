import React, { useEffect, useState, useRef } from 'react';
import { getOlimpiada, updateOlimpiada } from '../../../service/olimpiadas.api';
import { useParams, useNavigate } from 'react-router-dom';
import { PencilIcon } from '../../../src/assets/Icons';
import { LoadingSpinner } from '../../components/ui';

const ConfParamOlimpiada = () => {
  const { id } = useParams();
  const redirigir = useNavigate();
  const [olimpiada, setOlimpiada] = useState(null);
  const [editando, setEditando] = useState({});
  const [form, setForm] = useState({});
  const [archivo, setArchivo] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const inputArchivoRef = useRef();

  function formatoDDMMAAAA(fecha) {
    if (!fecha) return '';
    const [y, m, d] = fecha.split('-');
    if (!y || !m || !d) return fecha;
    return `${d}/${m}/${y}`;
  }

  function aYYYYMMDD(fecha) {
    if (!fecha) return '';
    const [d, m, y] = fecha.split('/');
    if (!d || !m || !y) return fecha;
    return `${y}-${m}-${d}`;
  }

  useEffect(() => {
    getOlimpiada(id)
      .then(data => {
        setOlimpiada(data);
        setForm({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          costo: data.costo || '',
          max_areas: data.max_areas || '',
          fecha_inicio: formatoDDMMAAAA(data.fecha_inicio),
          fecha_fin: formatoDDMMAAAA(data.fecha_fin),
          inicio_inscripcion: formatoDDMMAAAA(data.inicio_inscripcion),
          fin_inscripcion: formatoDDMMAAAA(data.fin_inscripcion),
          convocatoria: data.convocatoria || '',
        });
      })
      .catch(() => setMensaje('No se pudo cargar la olimpiada.'));
  }, [id]);

  // Validaciones
  useEffect(() => {
    validarCampos(form);
    // eslint-disable-next-line
  }, [form]);

  function soloFecha(date) {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const validarCampos = (valores) => {
    const errs = {};
    // Descripción
    if (valores.descripcion && valores.descripcion.length > 500) {
      errs.descripcion = 'La descripción debe tener máximo 500 caracteres.';
    }
    // Costo
    if (!valores.costo || isNaN(valores.costo) || Number(valores.costo) < 1) {
      errs.costo = 'El costo debe ser un número mayor o igual a 1.';
    }
    // Máximo inscripciones
    if (!valores.max_areas || isNaN(valores.max_areas) || Number(valores.max_areas) < 1) {
      errs.max_areas = 'El máximo de inscripciones debe ser un número mayor o igual a 1.';
    }
    // Fechas
    // Obtener hoy en GMT-4 y dejar solo la fecha
    const now = new Date();
    const hoyGMT4 = soloFecha(new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - (4 * 60 * 60 * 1000)));

    const fecha_inicio = soloFecha(parseFecha(valores.fecha_inicio));
    const fecha_fin = soloFecha(parseFecha(valores.fecha_fin));
    const inicio_inscripcion = soloFecha(parseFecha(valores.inicio_inscripcion));
    const fin_inscripcion = soloFecha(parseFecha(valores.fin_inscripcion));

    if (!fecha_inicio || fecha_inicio < hoyGMT4) {
      errs.fecha_inicio = 'La fecha de inicio debe ser hoy o una fecha futura.';
    }
    if (!fecha_fin || fecha_fin < hoyGMT4) {
      errs.fecha_fin = 'La fecha de fin debe ser hoy o una fecha futura.';
    }
    if (fecha_inicio && fecha_fin && fecha_fin < fecha_inicio) {
      errs.fecha_fin = 'La fecha de fin debe ser igual o posterior a la fecha de inicio.';
    }
    if (inicio_inscripcion && fecha_inicio && inicio_inscripcion < fecha_inicio) {
      errs.inicio_inscripcion = 'El inicio de inscripción debe ser igual o posterior a la fecha de inicio.';
    }
    if (inicio_inscripcion && fecha_fin && inicio_inscripcion > fecha_fin) {
      errs.inicio_inscripcion = 'El inicio de inscripción debe ser igual o anterior a la fecha de fin.';
    }
    if (fin_inscripcion && inicio_inscripcion && fin_inscripcion < inicio_inscripcion) {
      errs.fin_inscripcion = 'El fin de inscripción debe ser igual o posterior al inicio de inscripción.';
    }
    if (fin_inscripcion && fecha_fin && fin_inscripcion > fecha_fin) {
      errs.fin_inscripcion = 'El fin de inscripción debe ser igual o anterior a la fecha de fin.';
    }
    setErrores(errs);
  };

  function parseFecha(fecha) {
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
  }

  const handleEdit = campo => setEditando({ ...editando, [campo]: true });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleArchivo = e => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setArchivo(file);
      setForm(prev => ({ ...prev, convocatoria: file.name }));
      setErrores(prev => ({ ...prev, convocatoria: undefined }));
    } else {
      setErrores(prev => ({ ...prev, convocatoria: "Solo se permite PDF." }));
    }
  };

  const handleGuardar = async e => {
    e.preventDefault();
    setModal(true);
  };

  const confirmarGuardar = async () => {
    setGuardando(true);
    setMensaje('');
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k !== 'convocatoria') formData.append(k, v ?? '');
    });
    if (archivo) formData.append('convocatoria', archivo);
    formData.append('_method', 'PUT');
    try {
      await updateOlimpiada(id, formData);
      setMensaje('Cambios guardados correctamente.');
      setEditando({});
      setModal(false);
    } catch (error) {
      setMensaje('Error al guardar cambios.');
    }
    setGuardando(false);
  };

  const cancelarGuardar = () => {
    setModal(false);
  };

  if (!olimpiada) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <LoadingSpinner size="xl" text="Cargando parámetros..." />
    </div>
  );

  // Helper para mostrar campo editable o no
  const campoEditable = (label, name, type = 'text') => (
    <div className="mb-3 flex flex-col">
      <div className="flex items-center">
        <label className="w-48 font-medium">{label}:</label>
        {editando[name] ? (
          <input
            type={type}
            name={name}
            value={form[name] || ''}
            onChange={handleChange}
            className="border rounded px-2 py-1 flex-1"
          />
        ) : (
          <span className="flex-1">{form[name] || <span className="text-gray-400">Sin definir</span>}</span>
        )}
        <button
          type="button"
          className="ml-2 text-blue-600 hover:text-blue-800"
          onClick={() => handleEdit(name)}
          title="Editar"
        >
          <PencilIcon />
        </button>
      </div>
      {errores[name] && <span className="text-red-500 text-sm ml-48">{errores[name]}</span>}
    </div>
  );

  const hayErrores = Object.keys(errores).length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-50 rounded-xl p-6 shadow">
      <h1 className="text-2xl font-bold text-center mb-6">{olimpiada.nombre}</h1>
      {mensaje && <div className="mb-4 text-green-700 font-semibold">{mensaje}</div>}
      <form onSubmit={handleGuardar} encType="multipart/form-data">
        {campoEditable('Nombre', 'nombre')}
        {campoEditable('Descripción', 'descripcion')}
        {campoEditable('Costo', 'costo', 'number')}
        {campoEditable('Maximo inscripciones', 'max_areas', 'number')}
        {campoEditable('Fecha de Inicio', 'fecha_inicio', 'date')}
        {campoEditable('Fecha de Fin', 'fecha_fin', 'date')}
        {campoEditable('Inicio Inscripción', 'inicio_inscripcion', 'date')}
        {campoEditable('Fin Inscripción', 'fin_inscripcion', 'date')}
        {/* Convocatoria */}
        <div className="mb-3 flex flex-col">
          <div className="flex items-center">
            <label className="w-48 font-medium">Convocatoria:</label>
            {olimpiada.convocatoria && !archivo && (
              <a
                href={`http://127.0.0.1:8000/storage/${olimpiada.convocatoria}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline mr-2"
              >
                Ver PDF actual
              </a>
            )}
            <input
              type="file"
              accept="application/pdf"
              ref={inputArchivoRef}
              style={{ display: 'none' }}
              onChange={handleArchivo}
            />
            <button
              type="button"
              className="ml-2 text-blue-600 hover:text-blue-800"
              onClick={() => inputArchivoRef.current.click()}
              title="Editar archivo"
            >
              <PencilIcon />
            </button>
            {archivo && <span className="ml-2">{archivo.name}</span>}
          </div>
          {errores.convocatoria && <span className="text-red-500 text-sm ml-48">{errores.convocatoria}</span>}
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="bg-red-900 text-white px-4 py-2 rounded mr-2"
            onClick={() => redirigir('/AdminLayout/Olimpiadas')}
          >
            volver
          </button>
          <button
            type="submit"
            className={`bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 ${hayErrores ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={hayErrores || guardando}
          >
            Guardar configuración
          </button>
        </div>
      </form>

      {/* Modal de confirmación */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Confirmar cambios</h2>
            <p className="mb-6 text-center">
              ¿Está seguro de guardar los cambios en los parámetros de la olimpiada: <span className="font-semibold">{olimpiada.nombre}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelarGuardar}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarGuardar}
                className="px-4 py-2 rounded bg-blue-900 text-white hover:bg-blue-800"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfParamOlimpiada;