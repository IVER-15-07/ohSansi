import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar' 

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
  
    <Navbar />

    <div className="flex-1">
      <Outlet />
    </div>


    <footer className="bg-blue-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <p className="mb-2">© {new Date().getFullYear()} OhSansi - Universidad Mayor de San Simón</p>
        <p className="text-blue-200 text-sm">
          Sistema de Olimpiadas STEM para estudiantes del sistema educativo regular
        </p>
      </div>
    </footer>
  </div>
  )
}

export default UserLayout
