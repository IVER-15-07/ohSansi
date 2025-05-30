"use client"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "../../utils/cn"

const Alert = ({ variant = "info", title, children, onClose, className }) => {
  const variants = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info,
      iconColor: "text-blue-600",
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-800",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: AlertCircle,
      iconColor: "text-red-600",
    },
  }

  const { container, icon: Icon, iconColor } = variants[variant]

  return (
    <div className={cn("border rounded-lg p-4 relative", container, className)}>
      <div className="flex items-start space-x-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor)} />
        <div className="flex-1 min-w-0">
          {title && <h3 className="font-medium text-sm mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors duration-200"
            aria-label="Cerrar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert
