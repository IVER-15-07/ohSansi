"use client"
import { Link, useLocation } from "react-router-dom"
import { Home, Trophy, Users, Settings, BarChart3, BookOpen, X } from "lucide-react"
import { cn } from "../../utils/cn"

const Sidebar = ({ isCollapsed, isMobileOpen, toggleMobileSidebar, className }) => {
  const location = useLocation()

  const navigation = [
    { name: "Dashboard", href: "/AdminLayout", icon: Home },
    { name: "Olimpiadas", href: "/AdminLayout/VistaOlimpiadas", icon: Trophy },
    { name: "Áreas", href: "/AdminLayout/Areas", icon: BookOpen },
    { name: "Niveles y Categorías", href: "/AdminLayout/NivelCategoria", icon: BarChart3 },
    { name: "Reportes", href: "/AdminLayout/Reportes", icon: BarChart3 },
    { name: "Configuración", href: "/AdminLayout/config", icon: Settings },
  ]

  const isActive = (href) => location.pathname === href

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
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-rose-600 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">Admin</span>
              </div>
            )}

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
          <div className={cn("flex items-center space-x-3 text-sm text-slate-600", isCollapsed && "justify-center")}>
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
        </div>
      </div>
    </>
  )
}

export default Sidebar
