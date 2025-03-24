import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AdminLayout from './layouts/AdminLayout'


function App() {


  return (

    
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/AdminLayout/*" element={<AdminLayout />} />
        </Routes>
      </>
  


  )
}

export default App
