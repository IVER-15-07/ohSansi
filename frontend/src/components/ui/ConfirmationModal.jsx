import React from "react"
import { X, AlertTriangle } from "lucide-react"
import { cn } from "../../utils/cn"
import Button from "./Button"

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  variant = "danger",
  icon: CustomIcon = AlertTriangle,
  className
}) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={cn(
        "bg-white rounded-xl shadow-strong p-6 w-full max-w-md animate-scale-in",
        className
      )}>
        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center -mt-2">
          <div className={cn(
            "mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4",
            variant === "danger" && "bg-danger-100",
            variant === "warning" && "bg-warning-100",
            variant === "success" && "bg-success-100"
          )}>
            <CustomIcon className={cn(
              "h-6 w-6",
              variant === "danger" && "text-danger-600",
              variant === "warning" && "text-warning-600", 
              variant === "success" && "text-success-600"
            )} />
          </div>
          
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            {title}
          </h3>
          
          <p className="text-secondary-600 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={onConfirm}
              loading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
