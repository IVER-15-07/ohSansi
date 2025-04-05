import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AdminLayout from './layouts/AdminLayout'
import Olympiad from './pages/admin/Olympiad'
import Parametros from './pages/admin/Parametros'
import Datosgenerales from './pages/admin/Datosgenerales'
import Detalles from './pages/admin/Detalles'
import Divisiones from './pages/admin/Divisiones'
import Areas from './pages/admin/Areas'
import NivelCategoria from './pages/admin/NivelCategoria'







function App() {


  return (


    <>
      <Routes>

      <Route path="/" element={<Home />} />

        {/* Rutas del  admin */}
        <Route path="/AdminLayout" element={<AdminLayout />}>
          {/* Subrutas */}
          <Route path="Olympiad" element={<Olympiad />} />

          <Route path="Areas" element={<Areas />}/>
          <Route path="NivelCategoria" element={<NivelCategoria />} />
          
          <Route path="Parametros" element={<Parametros />} />

        </Route>


        <Route path="/Datosgenerales" element={<Datosgenerales />} /> 
        <Route path="/Detalles" element={<Detalles />} />
        <Route path="/Divisiones" element={<Divisiones />} />
        <Route path="/ConfOlimpiada" element={<Olympiad />} />

         {/* Rutas del  user */}




        
      </Routes>

    </>
  )
}

export default App
