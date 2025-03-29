import React from 'react'
import { useState } from 'react'
import Dashboard from '../pages/admin/Dashboard';
import Olympiad from '../pages/admin/Olympiad';
import { PanelIcon, OlympiadIcon, MenuIcon } from '../assets/Icons'


const AdminLayout = () => {
  const [paginacion, setPaginacion] = useState("DASHBOARD");
  const [isCollapsed, setIsCollapsed] = useState(false); // estado para  controlar el saidebar xd 

  const renderComponent = () => {
    if (paginacion === 'DASHBOARD') {
      return <Dashboard />
    } else {
      if (paginacion === 'CREAR') {
        return <Olympiad />
      }
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed); // cambia el estado del sidebar 
  }


  return (
    <div className="flex">

      {/* Sidebar */}
      <div className={`p-4 bg-blue-800 text-white h-screen transition-all duration-300 ${isCollapsed ? 'w-[1.5cm] h-[50%] rounded-2xl mt-4 mb-4 ml-4' : 'w-1/5'
        }`}>
        <div className="flex items-center space-x-2 ">
          <h1 className={`text-2xl mb-4 'hidden' : 'block'}`}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
            <path d="M10.363 20.405l-8.106 -13.534a1.914 1.914 0 0 1 1.636 -2.871h16.214a1.914 1.914 0 0 1 1.636 2.871l-8.106 13.534a1.914 1.914 0 0 1 -3.274 0z"></path>
          </svg>Oh Sansi</h1>
        </div>


        <button
          onClick={() => setPaginacion('DASHBOARD')}
          className={`block mb-4 ${isCollapsed ? 'text-sm' : ''}`} >
          <PanelIcon />Dashboard 
        </button>

        <button
          onClick={() => setPaginacion('CREAR')}
          className={`block mb-4 ${isCollapsed ? 'text-sm' : ''}`}>
          
          <OlympiadIcon />
          Olimpiadas
        </button>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-4">
        <div > <MenuIcon onClick={toggleSidebar}/>
        </div>

        <div className="h-1/10 ">

          {renderComponent()}

        </div>
      </div>
    </div>
  )
}

export default AdminLayout
