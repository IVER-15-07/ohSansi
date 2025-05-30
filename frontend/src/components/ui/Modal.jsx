"use client"
import { X } from "lucide-react"
import { cn } from "../../utils/cn"

const Modal = ({ isOpen, onClose, title, children, size = "md", className }) => {
  if (!isOpen) return null

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200" onClick={onClose} />

        {/* Modal */}
        <div
          className={cn(
            "relative bg-white rounded-xl shadow-xl w-full transition-all duration-200",
            sizes[size],
            className,
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
