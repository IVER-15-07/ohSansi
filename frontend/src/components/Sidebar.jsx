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
          ? 'fixed top-0 left-0 h-full w-[70%] bg-gradient-to-b  from-white  via-blue-500 to-red-500 z-50'
          : 'hidden'} 
      md:flex
      ${isCollapsed
          ? 'w-[60px] h-[95vh] mt-4 mb-4 ml-4 rounded-2xl bg-gradient-to-b from-white via-blue-300 to-red-300'
          : 'w-1/5 h-screen bg-gradient-to-b to-white via-blue-500 from-red-600'}`}
    >

      {/* --- LOGO arriba --- */}
      <div className="flex flex-col items-center mb-8">
        {!isCollapsed && <h1 className="text-xl font-bold text-white">Oh Sansi</h1>}
      </div>

      {/* --- NAVEGACIÓN en el centro --- */}
      <div className="flex-1 flex flex-col justify-center">
        <ul className="flex flex-col gap-2">
          {menuItems.map(({ label, icon, path }, index) => (
            <li key={label}>
              <button
                onClick={() => {
                  navigate(path);
                  if (isMobileOpen) toggleMobileSidebar();
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center w-full py-4 px-4 text-lg rounded-lg transition-all duration-300 ease-in-out
              ${location.pathname === path
                    ? 'bg-white text-blue-900 shadow-md scale-[1.02]'
                    : hoveredIndex === index
                      ? 'bg-blue-800 text-white'
                      : 'text-white hover:bg-blue-800 hover:text-white'}

                ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className={`transition-colors duration-300 text-[23px]
                ${location.pathname === path
                    ? 'text-blue-900'
                    : hoveredIndex === index
                      ? 'text-white'
                      : isCollapsed
                        ? 'text-blue-700'
                        : 'text-white'}`}>
                  {icon}
                </span>
                {!isCollapsed && <span className="ml-3">{label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- BOTÓN SALIR abajo --- */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center w-full py-3 px-4 text-lg rounded-lg hover:bg-red-800 transition duration-300
          ${isCollapsed ? 'justify-center' : 'text-blue-900'}`}
        >
          <span className={`${isCollapsed ? 'text-blue-600' : 'text-blue-900'} transition duration-300 text-[22px]`}>
            <ExitIcon />
          </span>
          {!isCollapsed && <span className="ml-3 font-bold">Salir</span>}
        </button>
      </div>

    </div >
  )
}

export default Sidebar
