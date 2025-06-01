"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Trophy, Users, Settings, BarChart3, BookOpen, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../utils/cn"
import { ConfirmationModal } from "../ui"
import { useState } from "react"
import logo from "../../assets/logo.png"

const Sidebar = ({ isCollapsed, isMobileOpen, toggleMobileSidebar, onToggleCollapse, className }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/AdminLayout", icon: Home },
    { name: "Olimpiadas", href: "/AdminLayout/VistaOlimpiadas", icon: Trophy },
    { name: "Áreas", href: "/AdminLayout/Areas", icon: BookOpen },
    { name: "Niveles y Categorías", href: "/AdminLayout/NivelCategoria", icon: BarChart3 },
    { name: "Reportes", href: "/AdminLayout/Reportes", icon: BarChart3 },
    { name: "Configuración", href: "/AdminLayout/config", icon: Settings },
  ]

  const isActive = (href) => location.pathname === href

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    // Limpiar cualquier estado de autenticación si es necesario
    // localStorage.removeItem('authToken') // Si hay tokens de autenticación
    // sessionStorage.clear() // Si hay datos de sesión
    
    // Navegar al home/login
    navigate('/')
    setShowLogoutModal(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMobileSidebar} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-slate-200 h-full flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="h-20 w-20 rounded-lg flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Logo"
                  >
                  </img>
                </div>
                <span className="text-lg font-bold text-slate-900">Admin</span>
              </div>
            )}

            {/* Desktop collapse button */}
            <div className="hidden md:flex items-center gap-2">
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={toggleMobileSidebar}
              className="md:hidden p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              aria-label="Cerrar sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  isCollapsed && "justify-center",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          {/* User info */}
          <div className={cn("flex items-center space-x-3 text-sm text-slate-600 mb-3", isCollapsed && "justify-center")}>
            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-medium">Administrador</p>
                <p className="text-xs text-slate-500">admin@osansi.edu.bo</p>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              "text-red-600 hover:text-red-700 hover:bg-red-50 w-full",
              isCollapsed && "justify-center",
            )}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Cerrar Sesión"
        message="¿Está seguro que desea cerrar sesión? Será redirigido a la página principal."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        variant="warning"
        icon={LogOut}
      />
    </>
  )
}

export default Sidebar
