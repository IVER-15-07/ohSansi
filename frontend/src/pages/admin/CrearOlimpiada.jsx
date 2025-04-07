import React from 'react'
import { useState } from 'react';
import { createOlimpiada } from '../../../service/olimpiadas.api';
import Detalles from './Detalles';

const CrearOlimpiada = () => {

    const [nombre, setNombre] = useState("");
      const [fechaInicio, setFechaInicio] = useState("");
      const [fechaFin, setFechaFin] = useState("");
      const [inicioInscripcion, setInicioInscripcion] = useState("");
      const [finInscripcion, setFinInscripcion] = useState("");
      const [costo, setCosto] = useState("");
      const [descripcion, setDescripcion] = useState("");
      const [urlMapa, setUrlMapa] = useState("");
    
      const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validaciones
        if (!nombre || !fechaInicio || !fechaFin || !inicioInscripcion || !finInscripcion || !costo || !descripcion) {
          alert("Por favor, complete todos los campos.");
          return;
        }
    
        if (new Date(fechaInicio) > new Date(fechaFin)) {
          alert("La fecha de inicio no puede ser posterior a la fecha de finalización.");
          return;
        }
    
        const nuevaOlimpiada = {
          nombre,
          descripcion,
          costo,
          ubicacion: urlMapa,
          fecha_inicio: fechaInicio, // Cambiado a "fecha_inicio"
          fecha_fin: fechaFin,       // Cambiado a "fecha_fin"
          inicio_inscripcion: inicioInscripcion, // Cambiado a "inicio_inscripcion"
          fin_inscripcion: finInscripcion,       // Cambiado a "fin_inscripcion"
        };
    
        try {
          const response = await createOlimpiada(nuevaOlimpiada);
          alert("Olimpiada creada exitosamente.");
          console.log("Olimpiada creada:", response);
    
          // Limpia los campos del formulario
          setNombre("");
          setFechaInicio("");
          setFechaFin("");
          setInicioInscripcion("");
          setFinInscripcion("");
          setCosto("");
          setDescripcion("");
          setUrlMapa("");
        } catch (error) {
          console.error("Error al crear la olimpiada:", error.response?.data || error.message);
          alert("Hubo un error al crear la olimpiada. Verifique los datos e intente nuevamente.");
        }
      };
    return (
        <div className="w-full px-6 py-3 bg-gray-50 rounded-xl">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Datos generales de la Olimpiada</h2>

      <form
        onSubmit={handleSubmit} // Conecta la función de envío
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-white p-4 rounded-2xl shadow border border-gray-200 text-sm"
      >
        {/* Nombre */}
        <div className="col-span-2">
          <label className="block font-medium text-gray-600 mb-1">Nombre de la olimpiada</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingrese el nombre de la olimpiada"
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fechas */}
        <div>
          <label className="block font-medium text-gray-600 mb-1">Fecha de inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-600 mb-1">Fecha de finalización</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Inicio de inscripción</label>
          <input
            type="date"
            value={inicioInscripcion}
            onChange={(e) => setInicioInscripcion(e.target.value)}
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-600 mb-1">Fin de inscripción</label>
          <input
            type="date"
            value={finInscripcion}
            onChange={(e) => setFinInscripcion(e.target.value)}
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Costo */}
        <div>
          <label className="block font-medium text-gray-600 mb-1">Costo de la Olimpiada</label>
          <input
            type="number"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            placeholder="00.00 Bs."
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-1">
          <label className="block font-medium text-gray-600 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Inserte descripción de la olimpiada"
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
        </div>

        {/* Ubicación */}
        <div className="col-span-2">
          <label className="block font-medium text-gray-600 mb-1">Ubicación</label>
          <input
            type="text"
            value={urlMapa}
            onChange={(e) => setUrlMapa(e.target.value)}
            placeholder="Ingrese ubicación"
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botón de envío */}
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
          >
            Crear Olimpiada
          </button>
        </div>
      </form>
    </div>
    )
}

export default CrearOlimpiada
