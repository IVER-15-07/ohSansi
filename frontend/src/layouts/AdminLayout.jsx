import React from 'react'
import { useState } from 'react'
import  Sidebar from '../components/Sidebar'
import {MenuIcon} from '../assets/Icons'
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Para dispositivos móviles

  const handleMenuClick = () => {
    // Verifica si el dispositivo es móvil
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen); // Alterna el estado móvil
    } else {
      setIsCollapsed(!isCollapsed); // Alterna el estado colapsado en pantallas grandes
    }
  };

  
  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
        className={`fixed z-50 top-0 left-0 h-full transition-transform duration-300 bg-white shadow-lg
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:relative`}
      />

      {/* Main Content */}
      <div className="flex-1 h-auto overflow-auto md:h-screen md:overflow-hidden">
        <div className="pt-3 pl-4 pb-0">
          <MenuIcon
            onClick={handleMenuClick}
            className="cursor-pointer md:hidden"
          />
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
