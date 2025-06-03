import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import LoadingSpinner from "./components/ui/LoadingSpinner" // Necesitarás crear este componente

// Componentes que se cargan inmediatamente (críticos)
import AdminLayout from "./layouts/AdminLayout"
import UserLayout from "./layouts/UserLayout"

// Lazy loading para páginas principales
const Home = lazy(() => import("./pages/Home"))

// Admin pages - lazy loaded
const Olimpiadas = lazy(() => import("./pages/admin/Olimpiadas"))
const Areas = lazy(() => import("./pages/admin/Areas"))
const NivelCategoria = lazy(() => import("./pages/admin/NivelCategoria"))
const ConfOlimpiada = lazy(() => import("./pages/admin/ConfOlimpiada"))
const ConfParamOlimpiada = lazy(() => import("./pages/admin/ConfParamOlimpiada"))
const ConfigurarCamposOlimpiada = lazy(() => import("./pages/admin/ConfigurarCamposOlimpiada"))
const CrearOlimpiada = lazy(() => import("./pages/admin/CrearOlimpiada"))
const Reportes = lazy(() => import("./pages/admin/Reportes"))

// User pages - lazy loaded
const RegistroTutor = lazy(() => import("./pages/user/RegistroTutor"))
const IdentificarEncargado = lazy(() => import("./pages/user/IdentificarEncargado"))
const LayoutRegistro = lazy(() => import("./pages/user/LayoutRegistro"))
const MenuOlimpiada = lazy(() => import("./pages/user/MenuOlimpiada"))
const Versiones = lazy(() => import("./pages/Versiones"))

function App() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Layout */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="versiones" element={<Versiones />} />
            <Route path="/olimpiadas/:idOlimpiada" element={<MenuOlimpiada />} />
            <Route path="IdentificarEncargado" element={<IdentificarEncargado />} />
            <Route path="RegistroEncargado" element={<RegistroTutor />} />
            <Route path="registros/:idEncargado/:idOlimpiada" element={<LayoutRegistro />} />
          </Route>

          {/* Admin Layout */}
          <Route path="/AdminLayout" element={<AdminLayout />}>
            <Route path="Olimpiadas" element={<Olimpiadas />} />
            <Route path="Reportes" element={<Reportes />} />
            <Route path="Olimpiadas/CrearOlimpiada" element={<CrearOlimpiada />} />
            <Route path="Olimpiadas/:id/configurar/:nombreOlimpiada" element={<ConfOlimpiada />} />
            <Route path="Olimpiadas/:id/configurar-campos" element={<ConfigurarCamposOlimpiada />} />
            <Route path="Olimpiadas/:id/configurarParametros/:nombreOlimpiada" element={<ConfParamOlimpiada />} />
            <Route path="Areas" element={<Areas />} />
            <Route path="NivelCategoria" element={<NivelCategoria />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
