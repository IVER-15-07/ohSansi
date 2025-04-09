import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AdminLayout from "./layouts/AdminLayout"
import Olympiad from "./pages/admin/Olympiad"
import RegistroTutor from "./pages/RegistroTutor"

import Datosgenerales from "./pages/admin/Datosgenerales"

import Areas from "./pages/admin/Areas"
import NivelCategoria from "./pages/admin/NivelCategoria"
import ConfOlimpiada from "./pages/admin/ConfOlimpiada"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Rutas del admin */}
        <Route path="/AdminLayout" element={<AdminLayout />}>
          {/* Subrutas */}
          <Route path="Olympiad" element={<Olympiad />} />
          <Route path="Olympiad/Datosgenerales" element={<Datosgenerales />} />
          <Route path="Olympiad/:id/configurar" element={<ConfOlimpiada />} />
          <Route path="Areas" element={<Areas />} />
          <Route path="NivelCategoria" element={<NivelCategoria />} />
        </Route>

       
       

        {/* Rutas del user */}
        <Route path="/registro-tutor" element={<RegistroTutor />} />
      </Routes>
    </div>
  )
}

export default App

