import React, { useEffect, useRef} from 'react'
import { useState } from 'react';
import { createOlimpiada, getOlimpiadas } from '../../../service/olimpiadas.api';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import SubirArchivo from '../../components/SubirArchivo';


const CrearOlimpiada = () => {
  const clienteQuery = useQueryClient();
  const redirigir = useNavigate();

  const [olimpiadas, setOlimpiadas] = useState([]);
  const [agregando, setAgregando] = useState(false);

  const [datosFormulario, setDatosFormulario] = useState({
    nombre: '',
    convocatoria: null,
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
    const archivo = e.target.files[0]; // Obtén el archivo seleccionado
    setDatosFormulario((prev) => ({
      ...prev,
      convocatoria: archivo, // Actualiza el estado con el archivo
    }));
  };

  const normalizarTexto = (texto) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const validarCampo = (campo, valor) => {
    const nuevosErrores = { ...errores };
    const hoy = new Date().toISOString().split("T")[0];

    switch (campo) {
      case 'nombre':
        if (!valor) {
          nuevosErrores.nombre = 'El nombre es obligatorio.';
        } else  {
          delete nuevosErrores.nombre;
        }
        break;

      case 'fechaInicio':
        if (!valor) {
          nuevosErrores.fechaInicio = 'La fecha de inicio es obligatoria.';
        } else if (valor < hoy) {
          nuevosErrores.fechaInicio = 'La fecha de inicio no puede ser anterior a hoy.';
        } else {
          delete nuevosErrores.fechaInicio;
          if (datosFormulario.fechaFin && valor > datosFormulario.fechaFin) {
            nuevosErrores.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio.';
          } else {
            delete nuevosErrores.fechaFin;
          }
        }
        break;

      case 'fechaFin':
        if (!valor) {
          nuevosErrores.fechaFin = 'La fecha de fin es obligatoria.';
        } else if (datosFormulario.fechaInicio && valor < datosFormulario.fechaInicio) {
          nuevosErrores.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio.';
        } else {
          delete nuevosErrores.fechaFin;
        }
        break;

        case 'inicioInscripcion': {
          const inicio = valor;
          const fin = datosFormulario.finInscripcion;
    
          if (!inicio) {
            nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción es obligatoria.';
          } else if (inicio < datosFormulario.fechaInicio || inicio > datosFormulario.fechaFin) {
            nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción debe estar dentro del rango de la olimpiada.';
          } else if (fin && inicio > fin) {
            nuevosErrores.inicioInscripcion = 'La fecha de inicio de inscripción no puede ser posterior a la fecha de fin de inscripción.';
          } else {
            delete nuevosErrores.inicioInscripcion;
          }
          break;
        }
    
        case 'finInscripcion': {
          const inicio = datosFormulario.inicioInscripcion;
          const fin = valor;
    
          if (!fin) {
            nuevosErrores.finInscripcion = 'La fecha de fin de inscripción es obligatoria.';
          } else if (fin < datosFormulario.fechaInicio || fin > datosFormulario.fechaFin) {
            nuevosErrores.finInscripcion = 'La fecha de fin de inscripción debe estar dentro del rango de la olimpiada.';
          } else if (inicio && fin < inicio) {
            nuevosErrores.finInscripcion = 'La fecha de fin de inscripción no puede ser anterior a la fecha de inicio de inscripción.';
          } else {
            delete nuevosErrores.finInscripcion;
          }
          break;
        }

      case 'costo':
        if (!valor) nuevosErrores.costo = 'El costo es obligatorio.';
        else delete nuevosErrores.costo;
        break;

      case 'descripcion':
        if (!valor) nuevosErrores.descripcion = 'La descripción es obligatoria.';
        else delete nuevosErrores.descripcion;
        break;

      default:
        break;
    }

    setErrores(nuevosErrores);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({ ...prev, [name]: value }));
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    validarCampo(name, value);
  };

  const validarFormularioCompleto = () => {
    const campos = Object.keys(datosFormulario);
    campos.forEach(campo => validarCampo(campo, datosFormulario[campo]));
    return Object.keys(errores).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorGeneral(''); // Limpia el mensaje de error general

    // Validar si el nombre ya existe
    if (olimpiadas.some(o => normalizarTexto(o.nombre) === normalizarTexto(datosFormulario.nombre))) {
      setErrorGeneral('El nombre de la olimpiada ya existe. Por favor, elija otro nombre.');
      return;
    }

    if (!validarFormularioCompleto()) return;

    const nuevaOlimpiada = {
      nombre: datosFormulario.nombre,
      convocatoria: datosFormulario.convocatoria,
      descripcion: datosFormulario.descripcion,
      costo: datosFormulario.costo,
      max_areas: datosFormulario.max_areas,
      fecha_inicio: datosFormulario.fechaInicio,
      fecha_fin: datosFormulario.fechaFin,
      inicio_inscripcion: datosFormulario.inicioInscripcion,
      fin_inscripcion: datosFormulario.finInscripcion,
    };

    setAgregando(true);
    try {
      await createOlimpiada(nuevaOlimpiada);
      clienteQuery.invalidateQueries(['olimpiadas']);
      alert('Olimpiada creada exitosamente.');
      redirigir('/AdminLayout/Olympiad');
    } catch (error) {
      console.error('Error al crear la olimpiada:', error);
    } finally {
      setAgregando(false);
    }
  };

  const campoFormulario = (etiqueta, nombreCampo, tipo = 'text', placeholder = '', colSpan = 1) => (
    <div className={`col-span-2 md:col-span-${colSpan}`}>
      <label className="block font-medium text-gray-600 mb-1">{etiqueta}</label>
      <input
        type={tipo}
        name={nombreCampo}
        value={datosFormulario[nombreCampo]}
        onChange={manejarCambio}
        onBlur={manejarBlur}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 ${errores[nombreCampo] ? 'border-red-500 ring-red-300' : 'focus:ring-blue-500'
          }`}
      />
      {errores[nombreCampo] && <p className="text-red-600 text-sm mt-1">{errores[nombreCampo]}</p>}
    </div>
  );

  
  console.log(datosFormulario);
  return (
    <div className="w-full px-6 py-3 bg-gray-50 rounded-xl">
      <h1 className="text-xl font-bold text-gray-700 mb-4">Datos generales de la Olimpiada</h1>

      {/* Mostrar mensaje de error general debajo del título */}
      {errorGeneral && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded-lg border border-red-300 text-sm">
          {errorGeneral}
        </div>
      )}

      <form
        id="formulario-crear-olimpiada"
        onSubmit={manejarEnvio}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-white p-6 rounded-2xl shadow border border-gray-200 text-sm"
      >
        {campoFormulario('Nombre de la olimpiada', 'nombre', 'text', 'Ingrese el nombre', 2)}
        {campoFormulario('Fecha de inicio', 'fechaInicio', 'date')}
        {campoFormulario('Fecha de finalización', 'fechaFin', 'date')}
        {campoFormulario('Inicio de inscripción', 'inicioInscripcion', 'date')}
        {campoFormulario('Fin de inscripción', 'finInscripcion', 'date')}
        {campoFormulario('Costo', 'costo', 'number', '00.00 Bs')}
        {campoFormulario('Maxima Cantidad de Áreas por Persona', 'max_areas', 'number', "SIN MÁXIMO")}
        <div className="md:col-span-1">
          <label className="block font-medium text-gray-600 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={datosFormulario.descripcion}
            onChange={manejarCambio}
            onBlur={manejarBlur}
            placeholder="Inserte la descripción"
            className={`w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 h-24 resize-none ${errores.descripcion ? 'border-red-500 ring-red-300' : 'focus:ring-blue-500'
              }`}
          />
          {errores.descripcion && <p className="text-red-600 text-sm mt-1">{errores.descripcion}</p>}
        </div>

        <SubirArchivo
          nombreArchivo="Subir la convocatoria de la olimpiada"
          tipoArchivo="pdf"
          handleArchivo={handleArchivo}
          inputRef={useRef()}
        />

      </form>

      <div className="flex justify-end mt-4 p-4 gap-6">
        <button
          type="button"
          onClick={() => redirigir('/AdminLayout/Olympiad')}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition w-40 h-12 flex items-center justify-center"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="formulario-crear-olimpiada"
          disabled={agregando}
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${agregando
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
        >
          {agregando ? 'Cargando...' : 'Crear Olimpiada'}
        </button>
      </div>
    </div>
  );
};

export default CrearOlimpiada
