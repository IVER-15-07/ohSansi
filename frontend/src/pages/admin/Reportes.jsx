import { useEffect, useState } from "react";
import { getOlimpiadasActivas, getOlimpiadas } from "../../../service/olimpiadas.api";

import { getReportes } from "../../../service/Reporte.api"; // Asegúrate de tener esta función en tu servicio

import { useParams } from "react-router-dom";
import { User, FileText, Users } from "lucide-react";
import Estadisticas from "./Estadisticas";
import ExportarReportes from "./ExportarReportes";



const Reportes = () => {

  const [olimpiadasActivas, setOlimpiadasActivas] = useState([]);
  const [olimpiadas, setOlimpiadas] = useState([]);
  const [error, setError] = useState(null);
  const { idOlimpiada } = useParams();
  const [olimpiadaSeleccionada, setOlimpiadaSeleccionada] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [areas, setAreas] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tab, setTab] = useState("reporte");

  useEffect(() => {
    getOlimpiadasActivas()
      .then(res => setOlimpiadasActivas(res.data))
      .catch(() => setError("Error al cargar olimpiadas activas"));
    getOlimpiadas()
      .then(res => setOlimpiadas(res.data))
      .catch(() => setError("Error al cargar todas las olimpiadas"));
  }, []);

  useEffect(() => {
    if (idOlimpiada && olimpiadas.length > 0) {
      const olimpiada = olimpiadas.find(o => o.id === Number(idOlimpiada));
      if (olimpiada) {
        cargarReportes(olimpiada, "");
      }
    }
  }, [idOlimpiada, olimpiadas]);


  const cargarReportes = (olimpiada, area = "", categoria = "") => {
    setLoadingReportes(true);
    setOlimpiadaSeleccionada(olimpiada);
    getReportes(olimpiada.id, area, categoria)
      .then(res => {
        setReportes(res.data);
        // Extraer áreas y categorías únicas
        const areasUnicas = Array.from(
          new Set(res.data.map(r => r.postulante.area_categoria.area).filter(Boolean))
        );
        setAreas(areasUnicas);
        const categoriasUnicas = Array.from(
          new Set(res.data.map(r => r.postulante.area_categoria.categoria).filter(Boolean))
        );
        setCategorias(categoriasUnicas);
      })
      .catch(() => setReportes([]))
      .finally(() => setLoadingReportes(false));
  };

  const handleCategoriaChange = (e) => {
    const categoria = e.target.value;
    setCategoriaSeleccionada(categoria);
    if (olimpiadaSeleccionada) {
      cargarReportes(olimpiadaSeleccionada, areaSeleccionada, categoria);
    }
  };


  const handleAreaChange = (e) => {
    const area = e.target.value;
    setAreaSeleccionada(area);
    if (olimpiadaSeleccionada) {
      cargarReportes(olimpiadaSeleccionada, area);
    }
  };

  // Buscador: filtra reportes por nombre, apellido o CI
  const reportesFiltrados = reportes.filter(r => {
    const texto = busqueda.toLowerCase();
    return (
      (r.postulante.nombres && r.postulante.nombres.toLowerCase().includes(texto)) ||
      (r.postulante.apellidos && r.postulante.apellidos.toLowerCase().includes(texto)) ||
      (r.postulante.ci && r.postulante.ci.toLowerCase().includes(texto)) ||
      (r.encargado?.nombres && r.encargado.nombres.toLowerCase().includes(texto)) ||
      (r.encargado?.apellidos && r.encargado.apellidos.toLowerCase().includes(texto)) ||
      (r.encargado?.ci && r.encargado.ci.toLowerCase().includes(texto))
    );
  });

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
    <div className="flex flex-col   px-2">
      <h1 className=" text-2xl text-center font-bold mb-4">Reportes de Inscritos</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full px-10">
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
        <div className="w-full px-10 mt-8 my-20">
          <h3 className="text-lg font-bold mb-2">
            Reportes de la olimpiada seleccionada (ID: {olimpiadaSeleccionada.nombre})
          </h3>

          {/* Tabs */}
          <div className="flex mb-4 border-b">
            <button
              className={`px-4 py-2 font-semibold ${tab === "reporte"
                ? "border-b-2 border-blue-600 text-black"
                : "text-gray-500"
                }`}
              onClick={() => setTab("reporte")}
            >
              Reporte
            </button>
            <button
              className={`px-4 py-2 font-semibold ${tab === "estadisticas"
                ? "border-b-2 border-blue-600 text-black"
                : "text-gray-500"
                }`}
              onClick={() => setTab("estadisticas")}
            >
              Estadísticas
            </button>
          </div>

          {/* Contenido de las pestañas */}
          {tab === "reporte" && (
            <>
              {/* Buscador */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o CI"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              </div>


              {/* Formulario para filtrar por área */}
              {areas.length > 0 && (
                <form className="mb-4">
                  <label className="mr-2 font-semibold">Filtrar por área:</label>
                  <select
                    value={areaSeleccionada}
                    onChange={handleAreaChange}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Todas las áreas</option>
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </form>
              )}

              {categorias.length > 0 && (
                <form className="mb-4">
                  <label className="mr-2 font-semibold">Filtrar por categoría:</label>
                  <select
                    value={categoriaSeleccionada}
                    onChange={handleCategoriaChange}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </form>
              )}


              {loadingReportes ? (
                <p>Cargando reportes...</p>
              ) : reportes.length === 0 ? (
                <p className="text-gray-500">No hay reportes para esta olimpiada.</p>
              ) : (
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Nombres postulante</th>

                      <th className="border px-2 py-1">CI</th>
                      <th className="border px-2 py-1">Área</th>
                      <th className="border px-2 py-1">Categoría</th>
                      {/* Campos adicionales del postulante */}
                      {camposAdicionales.map((campo) => (
                        <th key={campo} className="border px-2 py-1">{campo}</th>
                      ))}

                      <th className="border px-2 py-1">Nombres Responsablee</th>

                      <th className="border px-2 py-1"> CI Responsable</th>
                      <th className="border px-2 py-1"> Correo Responsable</th>



                      {/* Si quieres mostrar datos del tutor, agrega aquí */}
                      {camposTutor.map((campo) => (
                        <th key={campo} className="border px-2 py-1">Tutor: {campo}</th>
                      ))}

                      <th className="border px-2 py-1">Estado de Pago</th>
                      <th className="border px-2 py-1">Validado</th>
                      <th className="border px-2 py-1">Tipo de Inscripcion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportesFiltrados.map((r, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{r.postulante.nombres} {r.postulante.apellidos}</td>

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

                        {/* Datos principales del tutor */}
                        <td className="border px-2 py-1">{r.encargado?.nombres || ""} {r.encargado?.apellidos || ""}</td>

                        <td className="border px-2 py-1">{r.encargado?.ci || ""}</td>
                        <td className="border px-2 py-1">{r.encargado?.correo || ""}</td>

                        {/* ...campos adicionales del tutor... */}



                        {/* Si quieres mostrar datos del tutor, agrega aquí */}
                        {camposTutor.map((campo) => {
                          const dato = (r.tutor?.datos_adicionales?.[0] || []).find(d => d.campo === campo);
                          return (
                            <td key={campo} className="border px-2 py-1">{dato ? dato.valor : ""}</td>
                          );
                        })}


                        <td className="border px-2 py-1">
                          <span
                            className={
                              r.estado_pago === "Pagado"
                                //BERTORO AQUI CAMBIAS LOS COLORES DE LOS ESTADOS DE PAGO
                                ? "bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-sm"
                                : "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm"
                            }
                          >
                            {r.estado_pago}
                          </span>
                        </td>
                        <td className="border px-2 py-1">
                          <span
                            className={
                              r.validado === "Validado"
                                // LO  PROPIO AQUI ES QUE CAMBIES LOS COLORES DE LOS ESTADOS DE VALIDACION
                                ? "bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-sm"
                                : "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm"
                            }
                          >
                            {r.validado}
                          </span>
                        </td>


                        <td className="border px-2 py-1">
                          {r.tipo_inscripcion === "Individual" ? (
                            <>
                              <User size={18} /> {r.tipo_inscripcion}
                            </>
                          ) : (
                            <>
                              <Users size={18} /> {r.tipo_inscripcion} <FileText size={18} />
                            </>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </>

          )}
          <div className="mt-6 my-8 px-10">

            <ExportarReportes
              reportesFiltrados={reportesFiltrados}
              camposAdicionales={camposAdicionales}
              camposTutor={camposTutor}
              nombreOlimpiada={olimpiadaSeleccionada?.nombre}
            />

          </div>

          {tab === "estadisticas" && (
            <div>
              {reportes.length > 0 ? (
                <Estadisticas reportes={reportes} />
              ) : (
                <p className="text-gray-500">No hay datos para mostrar estadísticas.</p>
              )}
            </div>
          )}


        </div>


      )}

    </div>
  )
}

export default Reportes
