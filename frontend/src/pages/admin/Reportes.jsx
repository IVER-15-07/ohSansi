import { useEffect, useState, lazy, Suspense } from "react";
import { getOlimpiadasActivas, getOlimpiadas } from "../../../service/olimpiadas.api";
import { getReportes } from "../../../service/Reporte.api"; // Asegúrate de tener esta función en tu servicio
import { useParams } from "react-router-dom";
import { User, FileText, Users } from "lucide-react";
//import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent, Button, Alert, LoadingSpinner } from "../../components/ui";

// Lazy load componentes pesados que contienen librerías de exportación
const Estadisticas = lazy(() => import("./Estadisticas"));
const ExportarReportes = lazy(() => import("./ExportarReportes"));



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
      cargarReportes(olimpiadaSeleccionada, area, categoriaSeleccionada);
    }
  };

const reportesFiltrados = reportes.filter(r => {
  const texto = busqueda.toLowerCase();

  // Unir todos los campos relevantes en un solo string
  const campos = [
    r.postulante.nombres,
    r.postulante.apellidos,
    r.postulante.ci,
    r.postulante.area_categoria?.area,
    r.postulante.area_categoria?.categoria,
    // Datos adicionales del postulante
    ...(r.postulante.datos_adicionales?.[0]?.map?.(d => d.valor) || []),
    // Responsable
    r.encargado?.nombres,
    r.encargado?.apellidos,
    r.encargado?.ci,
    r.encargado?.correo,
    // Tutor (si existe)
    r.tutor?.nombres,
    r.tutor?.apellidos,
    r.tutor?.ci,
    r.tutor?.correo,
    // Datos adicionales del tutor
    ...(r.tutor?.datos_adicionales?.[0]?.map?.(d => d.valor) || []),
    // Estado de pago, validado, tipo de inscripción
    r.estado_pago,
    r.validado,
    r.tipo_inscripcion
  ]
    .filter(Boolean) // Elimina undefined/null
    .join(" ")
    .toLowerCase();

  return campos.includes(texto);
});

  const camposAdicionales = Array.from(
    new Set(
      reportes.flatMap(
        (item) =>
          (item.postulante.datos_adicionales?.[0] || []).map((d) => d.campo) || []
      )
    )
  );

  const camposTutor = Array.from(
    new Set(
      reportes.flatMap(
        (item) =>
          (item.tutor?.datos_adicionales?.[0] || []).map((d) => d.campo) || []
      )
    )
  );




  return (
    <div className="flex flex-col px-6 py-4 min-h-screen bg-slate-50">
      <Card className="max-w-7xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold mb-2">Reporte de Inscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" title="Error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Listado de olimpiadas en una sola columna */}
          <div className="flex flex-col gap-8 mb-8 max-w-4xl mx-auto w-full">
            {/* Activas */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700">
                <Users className="text-green-600" size={22} /> Olimpiadas Activas
              </h2>
              <div className="flex flex-col gap-4">
                {olimpiadasActivas.length === 0 && (
                  <div className="text-gray-500 text-center bg-gray-50 rounded-lg py-6 border">No hay olimpiadas activas.</div>
                )}
                {olimpiadasActivas.map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-sm hover:shadow transition"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-green-900">{o.nombre}</span>
                      <span className="text-xs text-green-700">Activa</span>
                    </div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => cargarReportes(o)}
                      className="font-semibold"
                    >
                      Ver Reporte
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            {/* Históricas */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
                <FileText className="text-blue-600" size={22} /> Todas las Olimpiadas
              </h2>
              <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {olimpiadas.length === 0 && (
                  <div className="text-gray-500 text-center bg-gray-50 rounded-lg py-6 border">No hay olimpiadas registradas.</div>
                )}
                {olimpiadas.map((o) => (
                  <div
                    key={o.id}
                    className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 shadow-sm hover:shadow transition"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-blue-900">{o.nombre}</span>
                      <span className="text-xs text-blue-700">Histórica</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => cargarReportes(o)}
                      className="font-semibold"
                    >
                      Ver Reporte
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detalle de reportes */}
          {olimpiadaSeleccionada && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 text-center">
                Reportes de la olimpiada: <span className="text-blue-700">{olimpiadaSeleccionada.nombre}</span>
              </h3>

              <div className="flex justify-center mb-8">
                <div className="inline-flex gap-6 bg-blue-50 rounded-full shadow border border-blue-200 p-3">
                  <Button
                    variant="ghost"
                    size="md"
                    className={`rounded-full px-10 py-1 font-semibold transition-all duration-200
        ${tab === "reporte"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-blue-700 hover:bg-blue-100"}
      `}
                    onClick={() => setTab("reporte")}
                  >
                    Reporte
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    className={`rounded-full px-10 py-1 font-semibold transition-all duration-200
        ${tab === "estadisticas"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-blue-700 hover:bg-blue-100"}
      `}
                    onClick={() => setTab("estadisticas")}
                  >
                    Estadísticas
                  </Button>
                </div>
              </div>

              {/* Contenido de las pestañas */}
              {tab === "reporte" && (
                <>

                  {/* Filtros */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200 shadow-sm items-center">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, apellido o CI"
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      className="border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 px-3 py-2 rounded-lg w-full md:w-1/3 transition"
                    />
                    {areas.length > 0 && (
                      <select
                        value={areaSeleccionada}
                        onChange={handleAreaChange}
                        className="border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 px-3 py-2 rounded-lg w-full md:w-1/4 transition"
                      >
                        <option value="">Todas las áreas</option>
                        {areas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    )}
                    {categorias.length > 0 && (
                      <select
                        value={categoriaSeleccionada}
                        onChange={handleCategoriaChange}
                        className="border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 px-3 py-2 rounded-lg w-full md:w-1/4 transition"
                      >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Tabla de reportes */}
                  <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white shadow-md mt-2">
                    {loadingReportes ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" text="Cargando reportes..." />
                      </div>
                    ) : reportesFiltrados.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No hay reportes para esta olimpiada.</div>
                    ) : (
                      <table className="min-w-full text-sm rounded-xl overflow-hidden">
                        <thead>
                          <tr>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Nombre Postulante</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Apellidos Postulante</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">CI Postulante</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Área</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Categoría</th>
                            {camposAdicionales.map((campo) => (
                              <th key={campo} className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">{campo}</th>
                            ))}
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Nombres Responsable</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">CI Responsable</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Correo Responsable</th>
                            {camposTutor.map((campo) => (
                              <th key={campo} className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Tutor: {campo}</th>
                            ))}
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Estado de Pago</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Validado</th>
                            <th className="border px-3 py-2 bg-blue-100 text-blue-900 font-bold">Tipo de Inscripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportesFiltrados.map((r, idx) => (
                            <tr
                              key={idx}
                              className={`
                               ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"}
                               hover:bg-blue-200 transition
                               `}
                            >
                              <td className="border px-3 py-2">{r.postulante.nombres}</td>
                              <td className="border px-3 py-2"> {r.postulante.apellidos}</td>
                              <td className="border px-3 py-2">{r.postulante.ci}</td>
                              <td className="border px-3 py-2">{r.postulante.area_categoria.area}</td>
                              <td className="border px-3 py-2">{r.postulante.area_categoria.categoria}</td>
                              {camposAdicionales.map((campo) => {
                                const dato = (r.postulante.datos_adicionales?.[0] || []).find(d => d.campo === campo);
                                return (
                                  <td key={campo} className="border px-3 py-2">{dato ? dato.valor : ""}</td>
                                );
                              })}
                              <td className="border px-3 py-2">{r.encargado?.nombres || ""} {r.encargado?.apellidos || ""}</td>
                              <td className="border px-3 py-2">{r.encargado?.ci || ""}</td>
                              <td className="border px-3 py-2">{r.encargado?.correo || ""}</td>
                              {camposTutor.map((campo) => {
                                const dato = (r.tutor?.datos_adicionales?.[0] || []).find(d => d.campo === campo);
                                return (
                                  <td key={campo} className="border px-3 py-2">{dato ? dato.valor : ""}</td>
                                );
                              })}
                              <td className="border px-3 py-2 text-center">
                                <span
                                  className={
                                    r.estado_pago === "Pagado"
                                      ? "bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs"
                                      : "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-xs"
                                  }
                                >
                                  {r.estado_pago}
                                </span>
                              </td>
                              <td className="border px-3 py-2 text-center">
                                <span
                                  className={
                                    r.validado === "Validado"
                                      ? "bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs"
                                      : "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-xs"
                                  }
                                >
                                  {r.validado}
                                </span>
                              </td>
                              <td className="border px-3 py-2 text-center">
                                {r.tipo_inscripcion === "Individual" ? (
                                  <span className="flex items-center gap-1 justify-center">
                                    <User size={16} /> {r.tipo_inscripcion}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 justify-center">
                                    <Users size={16} /> {r.tipo_inscripcion} <FileText size={16} />
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Exportar */}
                  <div className="flex justify-end mt-6">
                    <Suspense fallback={<LoadingSpinner size="md" text="Preparando exportación..." />}>
                      <ExportarReportes
                        reportesFiltrados={reportesFiltrados}
                        camposAdicionales={camposAdicionales}
                        camposTutor={camposTutor}
                        nombreOlimpiada={olimpiadaSeleccionada?.nombre}
                      />
                    </Suspense>
                  </div>
                </>
              )}

              {/* Estadísticas */}
              {tab === "estadisticas" && (
                <div className="mt-8">
                  <Suspense fallback={<LoadingSpinner size="lg" text="Cargando estadísticas..." />}>
                    {reportes.length > 0 ? (
                      <Estadisticas reportes={reportes} />
                    ) : (
                      <div className="text-center text-gray-500 py-8">No hay datos para mostrar estadísticas.</div>
                    )}
                  </Suspense>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Reportes
