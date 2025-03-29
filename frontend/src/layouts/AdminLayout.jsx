import React from 'react'
import { useState } from 'react'
import Dashboard from '../pages/admin/Dashboard';
import Olympiad from '../pages/admin/Olympiad';
import { PanelIcon, OlympiadIcon, MenuIcon, LogoIcon, ConfigIcon, PasswordIcon } from '../assets/Icons'


const AdminLayout = () => {
  const [paginacion, setPaginacion] = useState("DASHBOARD");
  const [isCollapsed, setIsCollapsed] = useState(false); // estado para  controlar el saidebar xd 

  const renderComponent = () => {
    if (paginacion === 'DASHBOARD') {
      return <Dashboard />
    } else if (paginacion === 'CREAR') {
      return <Olympiad />
    } else if (paginacion === 'CONFIGURACION') {
      return <ConfigIcon />
    }

  }



  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed); // cambia el estado del sidebar 
  }




  return (
    <div className="flex">

      {/* Sidebar */}
      <div className={`p-4 bg-blue-800 text-white h-screen duration-600 ease-in-out ${isCollapsed ? 'w-[1.5cm) h-[80%] rounded-2xl mt-4 mb-4 ml-4' : 'w-1/5 h-screen'
        }`}>

        <div className="flex items-center space-x-2 ">

          <div className='mt-15 mb-15 md:ml-0'>
            <LogoIcon />
            {<h1 className={`text-xl font-bold ${isCollapsed ? 'hidden' : 'block'}`}>Oh Sansi</h1>}

          </div>
        </div>

        <button
          onClick={() => setPaginacion('DASHBOARD')}
          className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <PanelIcon />
          {!isCollapsed && <span className="ml-2">Dashboard</span>}
        </button>

        <button
          onClick={() => setPaginacion('CREAR')}
          className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <OlympiadIcon />
          {!isCollapsed && <span className="ml-2">Olimpiadas</span>}
        </button>

        <button
          onClick={() => setPaginacion('CREAR')}
          className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <ConfigIcon />
          {!isCollapsed && <span className="ml-2">Configuracion</span>}
        </button>

        <button
          onClick={() => setPaginacion('CREAR')}
          className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <PasswordIcon />
          {!isCollapsed && <span className="ml-2">Contraseña</span>}
        </button>
      </div>




      {/* Main Content */}
      <div className="w-4/5 p-4">
        <div > <MenuIcon onClick={toggleSidebar} /></div>
        <div className="h-1/10 ">
          {renderComponent()}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
