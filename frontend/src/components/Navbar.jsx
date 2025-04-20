import React from 'react'
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-red-600 h-20 flex items-center justify-between px-6 shadow-lg">
      {/* Logo y título alineados a la izquierda */}
      <div className="flex items-center gap-4 px-10">
        <img src={logo} alt="Logo" className="h-14 w-17" />
        <h1 className="text-white text-xl md:text-2xl font-semibold">
          OLIMPIADAS DE CIENCIA Y TECNOLOGIA
        </h1>
      </div>

      {/* Botones alineados a la derecha */}
      <div className="flex items-center gap-4 ">
        <button 
         onClick={() => navigate("/")}
        className="text-white hover:text-gray-200 transition duration-300 pr-10">
          Inicio
        </button>
        <button 
        onClick={() => navigate("/versiones")}
        className="text-white hover:text-gray-200 transition duration-300 pr-15">
          Versiones
        </button>
        <button 
        onClick={() => navigate("/AdminLayout")}
        className="bg-white text-blue-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition duration-300">
          Iniciar Sesión
        </button>
       
      </div>
    </div>
  )
} 

export default Navbar
