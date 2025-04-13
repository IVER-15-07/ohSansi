import React from 'react'
import { useNavigate } from 'react-router-dom';
import { PanelIcon, OlympiadIcon, ExitIcon, CategoriaIcon, AreasIcon } from '../assets/Icons';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';


const Sidebar = ({ isCollapsed, isMobileOpen, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtiene la ruta actual
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const menuItems = [
    { label: 'Panel', icon: <PanelIcon />, path: '/AdminLayout' },
    { label: 'Olimpiada', icon: <OlympiadIcon />, path: '/AdminLayout/Olympiad' },
    { label: 'Areas', icon: <AreasIcon />, path: '/AdminLayout/Areas' },
    { label: 'Nivel/Categoria', icon: <CategoriaIcon />, path: '/AdminLayout/NivelCategoria' },
  ];

  return (
    <div
      className={`p-4 duration-500 ease-in-out flex flex-col justify-between shadow-2xl
        ${isMobileOpen
          ? 'fixed top-0 left-0 h-full w-[70%] bg-gradient-to-b from-blue-900 via-blue-800 to-red-600 z-50'
          : 'hidden'} 
        md:block
        ${isCollapsed
          ? 'w-[60px] h-[95vh] mt-4 mb-4 ml-4 rounded-2xl bg-gradient-to-b from-white via-blue-200 to-red-300'
          : 'w-1/5 h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-red-600'}`}
    >
      {/* Logo */}
      <div className="flex flex-col items-center">
        {!isCollapsed && <h1 className="text-xl font-bold text-white mb-6">Oh Sansi</h1>}
      </div>

      {/* Navigation */}
      <ul className="flex flex-col gap-2">
        {menuItems.map(({ label, icon, path }, index) => (
          <li key={label}>
            <button
              onClick={() => {
                navigate(path);
                if (isMobileOpen) toggleMobileSidebar(); // Cierra el Sidebar en móviles al navegar
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center w-full py-3 px-4 text-lg rounded-lg transition-all duration-300 ease-in-out
              ${location.pathname === path
                  ? 'bg-white text-blue-900 shadow-md scale-[1.02]'
                  : hoveredIndex === index
                    ? 'bg-blue-800 text-white'
                    : 'text-white hover:bg-blue-800 hover:text-white'}
              ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span
                className={`transition-colors duration-300 text-[22px]
                ${location.pathname === path
                    ? 'text-blue-900'
                    : hoveredIndex === index
                      ? 'text-white'
                      : isCollapsed
                        ? 'text-blue-700'
                        : 'text-white'}`}
              >
                {icon}
              </span>
              {!isCollapsed && <span className="ml-3 transition-colors duration-300">{label}</span>}
            </button>
          </li>
        ))}
      </ul>

      {/* Botón salir */}
      <button
        onClick={() => navigate('/')}
        className={`flex items-center w-full py-3 px-4 text-lg rounded-lg hover:bg-red-800 transition duration-300
          ${isCollapsed ? 'justify-center' : 'text-white'}`}
      >
        <span className={`${isCollapsed ? 'text-blue-600' : 'text-white'} transition duration-300 text-[22px]`}>
          <ExitIcon />
        </span>
        {!isCollapsed && <span className="ml-3">Salir</span>}
      </button>
    </div>
  )
}

export default Sidebar
