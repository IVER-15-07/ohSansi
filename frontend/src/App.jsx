import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import AdminLayout from './layouts/AdminLayout'
import Olympiad from './pages/admin/Olympiad'



function App() {


  return (

    
      <>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/AdminLayout" element={<AdminLayout />} />
          <Route path="/AdminLayout/Olympiad" element={<Olympiad />} />
        </Routes>
      </>
  


  )
}

export default App
