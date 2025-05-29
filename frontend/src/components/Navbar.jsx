import React from 'react'
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  return (
      <div className="bg-gradient-to-r fixed top-0 left-0 w-full z-50 from-white via-blue-500 to-red-500 h-20 flex items-center justify-between px-6 shadow-lg">
      {/* Logo y título alineados a la izquierda */}
      <div className="flex items-center gap-4 px-10">
        <img src={logo} alt="Logo" className="h-14 w-17" />
        <h1 className="text-blue-900 text-3xl md:text-2x1 font-bold">
          Olimpiadas de Ciencia y Tecnologia
        </h1>
      </div>

      {/* Botones alineados a la derecha */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className={`relative font-bold text-xl pr-10 group transition duration-300
            ${location.pathname === "/" ? "text-blue-900" : "text-blue-900 hover:text-gray-200"}
          `}
        >
          Inicio
          <span className={`
            block h-1 bg-blue-900 transition-transform duration-300 origin-left mt-1
            ${location.pathname === "/" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
          `}></span>
        </button>
        <button
          onClick={() => navigate("/versiones")}
          className={`relative font-bold text-xl pr-15 group transition duration-300
            ${location.pathname === "/versiones" ? "text-blue-900" : "text-blue-900 hover:text-gray-200"}
          `}
        >
          Versiones
          <span className={`
            block h-1 bg-blue-900 transition-transform duration-300 origin-left mt-1
            ${location.pathname === "/versiones" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
          `}></span>
        </button>
        <button
          onClick={() => navigate("/AdminLayout")}
          className="bg-white font-semibold text-blue-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  )
}

export default Navbar
