import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AdminLayout from "./layouts/AdminLayout"
import Olympiad from "./pages/admin/Olympiad"
import RegistroTutor from "./pages/public/RegistroTutor"
import UserLayout from "./layouts/UserLayout"
import IdentificarEncargado from "./pages/public/IdentificarEncargado"
import SeleccionarOlimpiada from "./pages/public/SeleccionarOlimpiada"
import RegistrosPostulantes from "./pages/public/RegistrosPostulantes"


import Areas from "./pages/admin/Areas"
import NivelCategoria from "./pages/admin/NivelCategoria"
import ConfOlimpiada from "./pages/admin/ConfOlimpiada"
import CrearOlimpiada from "./pages/admin/CrearOlimpiada"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
        <Routes>
        {/* Layout para público */}
        <Route path="/" element={<UserLayout />}>
          <Route path="IdentificarEncargado" element={<IdentificarEncargado />} /> {/* Página de identificación */}
          <Route path="SeleccionarOlimpiada/:idEncargado" element={<SeleccionarOlimpiada />} /> {/* Página de error */}
          <Route index element={<Home />} /> {/* Página principal */}
          <Route path="RegistroEncargado" element={<RegistroTutor />} /> {/* Página de registro */}
          <Route path="/RegistrosPostulantes/:idEncargado/:idOlimpiada" element={<RegistrosPostulantes />} /> 
        </Route>

        {/* Layout para el admin */}
        <Route path="/AdminLayout" element={<AdminLayout />}>
          <Route path="Olympiad" element={<Olympiad />} />
          <Route path="Olympiad/CrearOlimpiada" element={<CrearOlimpiada />} />
          <Route path="Olympiad/:id/configurar/:nombreOlimpiada" element={<ConfOlimpiada />} />
          <Route path="Areas" element={<Areas />} />
          <Route path="NivelCategoria" element={<NivelCategoria />} />
        </Route>

      </Routes>
    </div>
  )
}

export default App

