import React from 'react'
import { useState } from 'react'
import Dashboard from '../pages/admin/Dashboard';
import Olympiad from '../pages/admin/Olympiad';


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
      <div className={`p-4 bg-blue-800 text-white h-screen transition-all duration-300 ${
          isCollapsed ? 'w-[2cm] rounded-2xl' : 'w-1/5'
        }`}>
        <div className="p-5 text-center">
          <h1 className={`text-2xl mb-4 ${isCollapsed ? 'hidden' : 'block'}`}>Oh Sansi</h1>
        </div>
        <button
          onClick={() => setPaginacion('DASHBOARD')}
          className={`block mb-4 ${isCollapsed ? 'text-sm' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setPaginacion('CREAR')}
          className={`block mb-4 ${isCollapsed ? 'text-sm' : ''}`}
        >
          Olimpiadas
        </button>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-4">
        <div ><svg onClick={toggleSidebar} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
          <path d="M4 6l16 0"></path>
          <path d="M4 12l16 0"></path>
          <path d="M4 18l16 0"></path>
        </svg></div>

        <ion-icon name="airplane-outline"></ion-icon>

        <div className="h-1/10 ">

          {renderComponent()}

        </div>
      </div>
    </div>
  )
}

export default AdminLayout
