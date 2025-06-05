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

  const camposTutor = Array.from(
    new Set(
      reportes.flatMap(
        (item) =>
          (item.tutor?.datos_adicionales?.[0] || []).map((d) => d.campo) || []
      )
    )
  );




  return (
   <div className="flex flex-col px-2 py-4 min-h-screen bg-slate-50">
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

          {/* Listado de olimpiadas */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-700">Olimpiadas Activas</h2>
              <ul className="mb-4">
                {olimpiadasActivas.length === 0 && <li className="text-gray-500">No hay olimpiadas activas.</li>}
                {olimpiadasActivas.map((o) => (
                  <li key={o.id} className="flex justify-between items-center border-b py-2">
                    <span className="truncate">{o.nombre}</span>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => cargarReportes(o)}
                    >
                      Ver Reporte
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-blue-700">Todas las Olimpiadas</h2>
              <ul>
                {olimpiadas.length === 0 && <li className="text-gray-500">No hay olimpiadas registradas.</li>}
                {olimpiadas.map((o) => (
                  <li key={o.id} className="flex justify-between items-center border-b py-2">
                    <span className="truncate">{o.nombre}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => cargarReportes(o)}
                    >
                      Ver Reporte
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detalle de reportes */}
          {olimpiadaSeleccionada && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 text-center">
                Reportes de la olimpiada: <span className="text-blue-700">{olimpiadaSeleccionada.nombre}</span>
              </h3>

              {/* Tabs */}
              <div className="flex justify-center mb-6 border-b">
                <Button
                  variant={tab === "reporte" ? "primary" : "outline"}
                  size="md"
                  className={`rounded-none border-b-2 ${tab === "reporte" ? "border-blue-600" : "border-transparent"} `}
                  onClick={() => setTab("reporte")}
                >
                  Reporte
                </Button>
                <Button
                  variant={tab === "estadisticas" ? "primary" : "outline"}
                  size="md"
                  className={`rounded-none border-b-2 ${tab === "estadisticas" ? "border-blue-600" : "border-transparent"} `}
                  onClick={() => setTab("estadisticas")}
                >
                  Estadísticas
                </Button>
              </div>

              {/* Contenido de las pestañas */}
              {tab === "reporte" && (
                <>
                  {/* Filtros */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, apellido o CI"
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      className="border px-2 py-1 rounded w-full md:w-1/3"
                    />
                    {areas.length > 0 && (
                      <select
                        value={areaSeleccionada}
                        onChange={handleAreaChange}
                        className="border px-2 py-1 rounded w-full md:w-1/4"
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
                        className="border px-2 py-1 rounded w-full md:w-1/4"
                      >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Tabla de reportes */}
                  <div className="overflow-x-auto rounded border border-gray-200 bg-white">
                    {loadingReportes ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" text="Cargando reportes..." />
                      </div>
                    ) : reportesFiltrados.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No hay reportes para esta olimpiada.</div>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="border px-2 py-1 bg-slate-100">Nombres postulante</th>
                            <th className="border px-2 py-1 bg-slate-100">CI</th>
                            <th className="border px-2 py-1 bg-slate-100">Área</th>
                            <th className="border px-2 py-1 bg-slate-100">Categoría</th>
                            {camposAdicionales.map((campo) => (
                              <th key={campo} className="border px-2 py-1 bg-slate-100">{campo}</th>
                            ))}
                            <th className="border px-2 py-1 bg-slate-100">Nombres Responsable</th>
                            <th className="border px-2 py-1 bg-slate-100">CI Responsable</th>
                            <th className="border px-2 py-1 bg-slate-100">Correo Responsable</th>
                            {camposTutor.map((campo) => (
                              <th key={campo} className="border px-2 py-1 bg-slate-100">Tutor: {campo}</th>
                            ))}
                            <th className="border px-2 py-1 bg-slate-100">Estado de Pago</th>
                            <th className="border px-2 py-1 bg-slate-100">Validado</th>
                            <th className="border px-2 py-1 bg-slate-100">Tipo de Inscripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportesFiltrados.map((r, idx) => (
                            <tr key={idx} className="hover:bg-blue-50">
                              <td className="border px-2 py-1">{r.postulante.nombres} {r.postulante.apellidos}</td>
                              <td className="border px-2 py-1">{r.postulante.ci}</td>
                              <td className="border px-2 py-1">{r.postulante.area_categoria.area}</td>
                              <td className="border px-2 py-1">{r.postulante.area_categoria.categoria}</td>
                              {camposAdicionales.map((campo) => {
                                const dato = (r.postulante.datos_adicionales?.[0] || []).find(d => d.campo === campo);
                                return (
                                  <td key={campo} className="border px-2 py-1">{dato ? dato.valor : ""}</td>
                                );
                              })}
                              <td className="border px-2 py-1">{r.encargado?.nombres || ""} {r.encargado?.apellidos || ""}</td>
                              <td className="border px-2 py-1">{r.encargado?.ci || ""}</td>
                              <td className="border px-2 py-1">{r.encargado?.correo || ""}</td>
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
                                      ? "bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs"
                                      : "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-xs"
                                  }
                                >
                                  {r.estado_pago}
                                </span>
                              </td>
                              <td className="border px-2 py-1">
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
                              <td className="border px-2 py-1">
                                {r.tipo_inscripcion === "Individual" ? (
                                  <span className="flex items-center gap-1">
                                    <User size={16} /> {r.tipo_inscripcion}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
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
