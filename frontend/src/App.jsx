import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AdminLayout from "./layouts/AdminLayout"
import UserLayout from "./layouts/UserLayout"

// Admin pages
import Olimpiadas from "./pages/admin/Olimpiadas"
import Areas from "./pages/admin/Areas"
import NivelCategoria from "./pages/admin/NivelCategoria"
import ConfOlimpiada from "./pages/admin/ConfOlimpiada"
import ConfParamOlimpiada from "./pages/admin/ConfParamOlimpiada"
import ConfigurarCamposOlimpiada from "./pages/admin/ConfigurarCamposOlimpiada"
import CrearOlimpiada from "./pages/admin/CrearOlimpiada"
import Reportes from "./pages/admin/Reportes"

// User pages
import RegistroTutor from "./pages/user/RegistroTutor"
import IdentificarEncargado from "./pages/user/IdentificarEncargado"
import LayoutRegistro from "./pages/user/LayoutRegistro"
import MenuOlimpiada from "./pages/user/MenuOlimpiada"
import Versiones from "./pages/Versiones"

function App() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Routes>
        {/* Public Layout */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
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
    </div>
  )
}

export default App
