import React from 'react'
import { useState } from 'react'
import Dashboard from '../pages/admin/Dashboard';
import Olympiad from '../pages/admin/Olympiad';
import { PanelIcon, OlympiadIcon, MenuIcon, LogoIcon, ConfigIcon, PasswordIcon, ExitIcon } from '../assets/Icons'


const AdminLayout = () => {
  const [paginacion, setPaginacion] = useState("DASHBOARD");
  const [isCollapsed, setIsCollapsed] = useState(false); // estado para  controlar el saidebar xd 

  const renderComponent = () => {
    if (paginacion === 'DASHBOARD') {
      return <Dashboard />
    } else if (paginacion === 'CREAR') {
      return <Olympiad />
    } 

  }


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed); // cambia el estado del sidebar 
  }

  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <div
        className={`p-4 bg-blue-800 text-white h-screen duration-600 ease-in-out ${isCollapsed ? 'w-[1.5cm] h-[80%] rounded-2xl mt-4 mb-4 ml-4' : 'w-1/5 h-screen'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="mt-2">
            <LogoIcon />
            {!isCollapsed && <h1 className="text-xl font-bold">Oh Sansi</h1>}
          </div>
        </div>

        {/* Navigation Buttons */}
        <ul>
          <li className="mb-1">
            <button
              onClick={() => setPaginacion('DASHBOARD')}
              className={`flex items-center w-full py-3 px-4 text-lg rounded-[15px] ${paginacion === 'DASHBOARD' ? 'bg-white text-blue-800' : 'text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <PanelIcon />
              {!isCollapsed && <span className="ml-2">Panel</span>}
            </button>
          </li>

          <li className="mb-1">
            <button
              onClick={() => setPaginacion('CREAR')}
              className={`flex items-center w-full py-3 px-4 text-lg rounded-[15px] ${paginacion === 'CREAR' ? 'bg-white text-blue-800' : 'text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <OlympiadIcon />
              {!isCollapsed && <span className="ml-3">Olimpiada</span>}
            </button>
          </li>

          <li className="mb-1">
            <button
              onClick={() => setPaginacion('CONFIGURACION')}
              className={`flex items-center w-full py-3 px-4 text-lg rounded-[15px] ${paginacion === 'CONFIGURACION' ? 'bg-white text-blue-800' : 'text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <ConfigIcon />
              {!isCollapsed && <span className="ml-3">Configuración</span>}
            </button>
          </li>

          <li className="mb-1">
            <button
              onClick={() => setPaginacion('CONTRASEÑA')}
              className={`flex items-center w-full py-3 px-4 text-lg rounded-[15px] ${paginacion === 'CONTRASEÑA' ? 'bg-white text-blue-800' : 'text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <PasswordIcon />
              {!isCollapsed && <span className="ml-3">Contraseña</span>}
            </button>
          </li>

          <li className="mb-1">
            <button
              onClick={() => console.log('Salir')}
              className={`flex items-center w-full py-3 px-4 text-lg rounded-[15px] ${paginacion === 'SALIR' ? 'bg-white text-blue-800' : 'text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <ExitIcon />
              {!isCollapsed && <span className="ml-3">Salir</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 ">
        
        <div className='pt-3 pl-4 pb-0'>
          <MenuIcon onClick={toggleSidebar} className="cursor-pointer" />
        </div >

        <div className="h-1/10">
          {renderComponent()}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
