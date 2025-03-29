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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
            <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
          </svg>Dashboard
        </button>

        <button
          onClick={() => setPaginacion('CREAR')}
          className={`block mb-4 ${isCollapsed ? 'text-sm' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
            <path d="M6 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
            <path d="M18 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
            <path d="M12 9m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
            <path d="M9 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
            <path d="M15 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
          </svg>
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

        <div className="h-1/10 ">

          {renderComponent()}

        </div>
      </div>
    </div>
  )
}

export default AdminLayout
