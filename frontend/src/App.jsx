import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AdminLayout from "./layouts/AdminLayout"
import Olympiad from "./pages/admin/Olympiad"
import RegistroTutor from "./pages/user/RegistroTutor"
import UserLayout from "./layouts/UserLayout"
import IdentificarEncargado from "./pages/user/IdentificarEncargado"




import Areas from "./pages/admin/Areas"
import NivelCategoria from "./pages/admin/NivelCategoria"
import ConfOlimpiada from "./pages/admin/ConfOlimpiada"
import ConfigurarCamposOlimpiada from "./pages/admin/ConfigurarCamposOlimpiada"
import CrearOlimpiada from "./pages/admin/CrearOlimpiada"
import Versiones from "./pages/Versiones"
import LayoutRegistro from "./pages/user/LayoutRegistro"
import MenuOlimpiada from "./pages/user/MenuOlimpiada"

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>

        {/* Layout para público */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} /> 
          <Route path="versiones" element={<Versiones />} />
          <Route path="/olimpiadas/:idOlimpiada" element={<MenuOlimpiada />} />
          <Route path="IdentificarEncargado" element={<IdentificarEncargado />} />
          <Route path="RegistroEncargado" element={<RegistroTutor />} />
          <Route path="registros/:idEncargado/:idOlimpiada" element={<LayoutRegistro />} />
        </Route>


        {/* Layout para el admin */}
        <Route path="/AdminLayout" element={<AdminLayout />}>
          <Route path="Olympiad" element={<Olympiad />} />
          <Route path="Olympiad/CrearOlimpiada" element={<CrearOlimpiada />} />
          <Route path="Olympiad/:id/configurar/:nombreOlimpiada" element={<ConfOlimpiada />} />
          <Route path="Olympiad/:id/configurar-campos" element={<ConfigurarCamposOlimpiada/>} />
          <Route path="Areas" element={<Areas />} />
          <Route path="NivelCategoria" element={<NivelCategoria />} />
        </Route>

      </Routes>
    </div>
  )
}

export default App

