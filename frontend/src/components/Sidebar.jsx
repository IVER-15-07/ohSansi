import React from 'react'
import { useNavigate } from 'react-router-dom';
import { PanelIcon, OlympiadIcon, ParametrosIcon, ExitIcon } from '../assets/Icons';
import { useState } from 'react';


const Sidebar = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const menuItems = [
    { label: 'Panel', icon: <PanelIcon />, path: '/AdminLayout' },
    { label: 'Olimpiada', icon: <OlympiadIcon />, path: '/AdminLayout/Olympiad' },
    { label: 'Parametros', icon: <ParametrosIcon />, path: '/AdminLayout/Parametros' },
  ];

  return (
    <div
      className={`p-4 duration-500 ease-in-out flex flex-col justify-between
      ${isCollapsed
          ? 'w-[60px] h-[80vh] rounded-2xl mt-4 mb-4 ml-4 bg-white shadow-2xl'
          : 'w-1/5 h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-red-600'
        }`}
    >
      {/* Logo */}
      <div className="flex flex-col items-center">
        {!isCollapsed && <h1 className="text-xl font-bold text-white mb-6">Oh Sansi</h1>}
      </div>

      {/* Navigation Buttons */}
      <ul className="flex flex-col gap-2">
        {menuItems.map(({ label, icon, path }, index) => (
          <li key={label}>
            <button
              onClick={() => navigate(path)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center w-full py-3 px-4 text-lg rounded-lg transition duration-300 
              ${hoveredIndex === index ? 'bg-blue-900 text-white' : 'hover:bg-blue-950'}
              ${isCollapsed ? 'justify-center' : 'text-white'}
              `}
            >
              {/* Ícono siempre visible, cambia a azul si isCollapsed es true */}
              <span
                className={`${isCollapsed ? 'text-blue-900' : 'text-white'
                  } transition duration-300`}
              >
                {icon}
              </span>
              {/* Texto visible solo si no está colapsado */}
              {!isCollapsed && <span className="ml-3">{label}</span>}
            </button>
          </li>
        ))}
      </ul>

      {/* Botón de Salir */}
      <button
        onClick={() => console.log('Salir')}
        className={`flex items-center w-full py-3 px-4 text-lg rounded-lg hover:bg-red-800 transition duration-300
        ${isCollapsed ? 'justify-center' : 'text-white'}
        `}
      >
        {/* Ícono siempre visible, cambia a azul si isCollapsed es true */}
        <span
          className={`${isCollapsed ? 'text-blue-500' : 'text-white'
            } transition duration-300`}
        >
          <ExitIcon />
        </span>
        {/* Texto visible solo si no está colapsado */}
        {!isCollapsed && <span className="ml-3">Salir</span>}
      </button>
    </div>
  )
}

export default Sidebar
