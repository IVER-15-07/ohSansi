"use client"

import { useState } from "react"
import { Menu, ChevronLeft, ChevronRight } from "lucide-react"
import { Outlet ,  useLocation } from "react-router-dom"
import Sidebar from "../components/layout/SideBar"

const AdminLayout = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Para dispositivos móviles
  const location = useLocation();
  const esReporte = location.pathname.startsWith('/AdminLayout/Reportes');

  const handleMenuClick = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
        onToggleCollapse={toggleCollapse}
        className={`fixed z-50 top-0 left-0 h-full transition-transform duration-300 shadow-lg
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:relative md:shadow-none`}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          esReporte ? 'h-auto overflow-auto' : 'md:h-screen md:overflow-hidden h-auto overflow-auto'
        }`}
      >
        <div className="pt-3 pl-4 pb-0">
          <button
            onClick={handleMenuClick}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
