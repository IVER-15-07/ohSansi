import  { useEffect, useState } from "react";
import { getOlimpiadasActivas, getOlimpiadas } from "../../../service/olimpiadas.api";

import { getReportes } from "../../../service/Reporte.api"; // Asegúrate de tener esta función en tu servicio





const Reportes = () => {

  const [olimpiadasActivas, setOlimpiadasActivas] = useState([]);
  const [olimpiadas, setOlimpiadas] = useState([]);
  const [error, setError] = useState(null);
  
 
  const [olimpiadaSeleccionada, setOlimpiadaSeleccionada] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(false);

  useEffect(() => {
    // Cargar olimpiadas activas
    getOlimpiadasActivas()
      .then(res => setOlimpiadasActivas(res.data))
      .catch(() => setError("Error al cargar olimpiadas activas"));
    // Cargar todas las olimpiadas
    getOlimpiadas()
      .then(res => setOlimpiadas(res.data))
      .catch(() => setError("Error al cargar todas las olimpiadas"));
  }, []);



const cargarReportes = (olimpiada) => {
  setLoadingReportes(true);
  setOlimpiadaSeleccionada(olimpiada); // Guarda el objeto completo
  getReportes(olimpiada.id)
    .then(res => setReportes(res.data))
    .catch(() => setReportes([]))
    .finally(() => setLoadingReportes(false));
};

  const camposAdicionales = Array.from(
  new Set(
    reportes.flatMap(
      (item) =>
        (item.postulante.datos_adicionales?.[0] || []).map((d) => d.campo) || []
    )
  )
);

// Obtén todos los nombres de campos adicionales únicos de los tutores (si los usas)
const camposTutor = Array.from(
  new Set(
    reportes.flatMap(
      (item) =>
        (item.tutor?.datos_adicionales?.[0] || []).map((d) => d.campo) || []
    )
  )
);


  return (
    <div className="flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-4">Reportes de Inscritos</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">Olimpiadas Activas</h2>
        <ul className="mb-6">
          {olimpiadasActivas.length === 0 && <li className="text-gray-500">No hay olimpiadas activas.</li>}
          {olimpiadasActivas.map((o) => (
            <li key={o.id} className="flex justify-between items-center border-b py-2">
              <span>{o.nombre}</span>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => cargarReportes(o)}
              >
                Ver Reporte
              </button>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mb-2 text-blue-700">Todas las Olimpiadas</h2>
        <ul>
          {olimpiadas.length === 0 && <li className="text-gray-500">No hay olimpiadas registradas.</li>}
          {olimpiadas.map((o) => (
            <li key={o.id} className="flex justify-between items-center border-b py-2">
              <span>{o.nombre}</span>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => cargarReportes(o)}
              >
                Ver Reporte
              </button>
            </li>
          ))}
        </ul>
      </div>

       {olimpiadaSeleccionada && (
      <div className="w-full max-w-2xl mt-8">
        <h3 className="text-lg font-bold mb-2">
          Reportes de la olimpiada seleccionada (ID: {olimpiadaSeleccionada.nombre})
        </h3>
        {loadingReportes ? (
          <p>Cargando reportes...</p>
        ) : reportes.length === 0 ? (
          <p className="text-gray-500">No hay reportes para esta olimpiada.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Nombres</th>
                <th className="border px-2 py-1">Apellidos</th>
                <th className="border px-2 py-1">CI</th>
                <th className="border px-2 py-1">Área</th>
                <th className="border px-2 py-1">Categoría</th>
                {/* Campos adicionales del postulante */}
                {camposAdicionales.map((campo) => (
                  <th key={campo} className="border px-2 py-1">{campo}</th>
                ))}
                {/* Si quieres mostrar datos del tutor, agrega aquí */}
                {/* {camposTutor.map((campo) => (
                  <th key={campo} className="border px-2 py-1">Tutor: {campo}</th>
                ))} */}
              </tr>
            </thead>
            <tbody>
              {reportes.map((r, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{r.postulante.nombres}</td>
                  <td className="border px-2 py-1">{r.postulante.apellidos}</td>
                  <td className="border px-2 py-1">{r.postulante.ci}</td>
                  <td className="border px-2 py-1">{r.postulante.area_categoria.area}</td>
                  <td className="border px-2 py-1">{r.postulante.area_categoria.categoria}</td>
                  {/* Valores dinámicos de campos adicionales del postulante */}
                  {camposAdicionales.map((campo) => {
                    const dato = (r.postulante.datos_adicionales?.[0] || []).find(d => d.campo === campo);
                    return (
                      <td key={campo} className="border px-2 py-1">{dato ? dato.valor : ""}</td>
                    );
                  })}
                  {/* Si quieres mostrar datos del tutor, agrega aquí */}
                  {/* {camposTutor.map((campo) => {
                    const dato = (r.tutor?.datos_adicionales?.[0] || []).find(d => d.campo === campo);
                    return (
                      <td key={campo} className="border px-2 py-1">{dato ? dato.valor : ""}</td>
                    );
                  })} */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )}
    </div>


  )
}

export default Reportes
