import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Home = () => {
    const navigate = useNavigate()

   

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
    <Navbar/>
    <div className="flex flex-col items-center justify-center flex-grow p-8">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-3xl">
        <h1 className="text-blue-900 text-3xl font-bold mb-4">Bienvenido a Home</h1>
        <p className="text-gray-700 text-lg mb-6">
          Explora y administra las olimpiadas con un diseño moderno y funcional.
        </p>

        {/* Botón para ir a AdminLayout */}
        <button
          onClick={() => navigate('/AdminLayout')}
          className="px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg shadow-md 
                    hover:bg-red-700 transition duration-300"
        >
          iniciar como  administra
        </button>
      </div>
    </div>
  </div>
  )
}

export default Home
