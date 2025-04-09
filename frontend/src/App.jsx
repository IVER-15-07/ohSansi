import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AdminLayout from "./layouts/AdminLayout"
import Olympiad from "./pages/admin/Olympiad"
import RegistroTutor from "./pages/RegistroTutor"
import UserLayout from "./layouts/UserLayout"



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
          <Route index element={<Home />} /> {/* Página principal */}
          <Route path="registro-tutor" element={<RegistroTutor />} /> {/* Página de registro */}
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

