import React from 'react'
import { useState } from 'react'
import  Sidebar from '../components/Sidebar'
import {MenuIcon} from '../assets/Icons'
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Content */}
      <div className="flex-1">
        <div className="pt-3 pl-4 pb-0">
          <MenuIcon onClick={() => setIsCollapsed(!isCollapsed)} className="cursor-pointer" />

        </div>

        <div>

        <Outlet />
        
        
        </div>


      </div>
    </div>
  )
}

export default AdminLayout
