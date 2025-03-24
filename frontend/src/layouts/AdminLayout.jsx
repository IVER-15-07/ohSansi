import React from 'react'
import  {useState} from 'react'
import Dashboard from '../pages/admin/Dashboard';
import Create from '../pages/admin/Create';


const AdminLayout = () => {

  const [paginacion, setPaginacion] = useState("DASHBOARD");

  const renderComponent = () => { 
    if(paginacion==='DASHBOARD'){
      return <Dashboard/>
    }else{
      if(paginacion==='CREAR'){
        return <Create/>
      }

    }

  }

  
  return (
    <div className="flex">
    {/* Sidebar */}
    <div className="w-1/5 p-4 bg-gray-800 text-white h-screen">
      <button onClick={() => setPaginacion('DASHBOARD')} className="block mb-4">Dashboard</button>
      <button onClick={() => setPaginacion('CREAR')} className="block mb-4">Crear</button>
    </div>

    {/* Main Content */}
    <div className="w-4/5 p-4">
      {renderComponent()}
    </div>
  </div>
  )
}

export default AdminLayout
