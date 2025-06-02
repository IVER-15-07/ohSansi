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
  const inputArchivoRef = useRef();

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
      // Opcional: recargar datos
    } catch (error) {
      setMensaje('Error al guardar cambios.');
    }
  };

  if (!olimpiada) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <LoadingSpinner size="xl" text="Cargando parámetros..." />
    </div>
  );

  // Helper para mostrar campo editable o no
  const campoEditable = (label, name, type = 'text') => (
    <div className="mb-3 flex items-center">
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
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-50 rounded-xl p-6 shadow">
      <h1 className="text-2xl font-bold text-center mb-6">{olimpiada.nombre}</h1>
      {mensaje && <div className="mb-4 text-red-600">{mensaje}</div>}
      <form onSubmit={handleGuardar} encType="multipart/form-data">
        {campoEditable('Nombre', 'nombre')}
        {campoEditable('Descripción', 'descripcion')}
        {campoEditable('Costo', 'costo', 'number')}
        {campoEditable('Fecha de Inicio', 'fecha_inicio', 'text')}
        {campoEditable('Fecha de Fin', 'fecha_fin', 'text')}
        {campoEditable('Inicio Inscripción', 'inicio_inscripcion', 'text')}
        {campoEditable('Fin Inscripción', 'fin_inscripcion', 'text')}
        {/* Convocatoria */}
        <div className="mb-3 flex items-center">
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
          {errores.convocatoria && <span className="text-red-500 ml-2">{errores.convocatoria}</span>}
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="bg-red-900 text-white px-4 py-2 rounded mr-2"
            onClick={() => redirigir('/AdminLayout/Olimpiadas')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfParamOlimpiada;