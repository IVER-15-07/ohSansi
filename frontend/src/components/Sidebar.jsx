import React from 'react'
import { useNavigate } from 'react-router-dom';
import { PanelIcon, OlympiadIcon, ParametrosIcon, ExitIcon } from '../assets/Icons';


const Sidebar = ({ isCollapsed }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Panel', icon: <PanelIcon />, path: '/AdminLayout' },
    { label: 'Olimpiada', icon: <OlympiadIcon />, path: '/AdminLayout/Olympiad' },
    { label: 'Parametros', icon: <ParametrosIcon />, path: '/AdminLayout/Parametros' },
  ];

  return (
    <div className={`p-4 bg-blue-800 text-white duration-600 ease-in-out ${isCollapsed ? 'w-[1.5cm] h-[80%] rounded-2xl mt-4 mb-4 ml-4' : 'w-1/5 h-screen'}`}>
    {/* Logo */}
    <div className="flex items-center mb-8 mt-2">
      <h1 className="text-xl font-bold">Oh Sansi</h1>
    </div>

    {/* Navigation Buttons */}
    <ul>
      {menuItems.map(({ label, icon, path }) => (
        <li key={label} className="mb-1">
          <button onClick={() => navigate(path)} className="flex items-center w-full py-3 px-4 text-lg rounded-[15px] text-white">
            {icon}
            {!isCollapsed && <span className="ml-3">{label}</span>}
          </button>
        </li>
      ))}

      <li className="mb-1">
        <button onClick={() => console.log('Salir')} className="flex items-center w-full py-3 px-4 text-lg rounded-[15px] text-white">
          <ExitIcon />
          {!isCollapsed && <span className="ml-3">Salir</span>}
        </button>
      </li>
    </ul>
  </div>
  )
}

export default Sidebar
