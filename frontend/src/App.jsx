import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AdminLayout from "./layouts/AdminLayout"
import Olympiad from "./pages/admin/Olympiad"
import RegistroTutor from "./pages/user/RegistroTutor"
import UserLayout from "./layouts/UserLayout"
import IdentificarEncargado from "./pages/user/IdentificarEncargado"
import SeleccionarOlimpiada from "./pages/user/SeleccionarOlimpiada"
import RegistrosPostulantes from "./pages/user/RegistrosPostulantes"
import OrdenesDePago from "./pages/user/OrdenesDePago"
import ValidarComprobante from "./pages/user/ValidarComprobante"
import RegistrarListaPostulantes from "./pages/user/RegistrarListaPostulantes"
import RegistrarPostulante from "./pages/user/RegistrarPostulante"

import Areas from "./pages/admin/Areas"
import NivelCategoria from "./pages/admin/NivelCategoria"
import ConfOlimpiada from "./pages/admin/ConfOlimpiada"
import CrearOlimpiada from "./pages/admin/CrearOlimpiada"
import Versiones from "./pages/Versiones"
import LayoutRegistro from "./pages/user/LayoutRegistro"

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/* Layout para público */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} /> {/* Página principal */}
          <Route path="versiones" element={<Versiones />} />

          <Route path="registros" element={<LayoutRegistro />} />

          <Route path="IdentificarEncargado" element={<IdentificarEncargado />} /> {/* Página de identificación */}
          <Route path="SeleccionarOlimpiada/:idEncargado" element={<SeleccionarOlimpiada />} /> {/* Página de error */}
          <Route path="RegistroEncargado" element={<RegistroTutor />} />
          
           {/* Página de registro 
          <Route path="/RegistrosPostulantes/:idEncargado/:idOlimpiada" element={<RegistrosPostulantes />} />
          <Route path="/OrdenesDePago/:idEncargado/:idOlimpiada" element={<OrdenesDePago />} />
          <Route path="/ValidarComprobante" element={<ValidarComprobante />} />
          <Route path="/RegistrarListaPostulantes/:idEncargado/:idOlimpiada" element={<RegistrarListaPostulantes />} />
          <Route path="RegistrarPostulante/:idEncargado/:idOlimpiada" element={<RegistrarPostulante />} />*/}


          <Route path="/RegistrarPostulante/:idEncargado/:idOlimpiada" element={<LayoutRegistro />} />
          <Route path="/RegistrarListaPostulantes/:idEncargado/:idOlimpiada" element={<LayoutRegistro />} />
          <Route path="/OrdenesDePago/:idEncargado/:idOlimpiada" element={<LayoutRegistro />} />
          <Route path="/ValidarComprobante/:idEncargado/:idOlimpiada" element={<LayoutRegistro />} />
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

