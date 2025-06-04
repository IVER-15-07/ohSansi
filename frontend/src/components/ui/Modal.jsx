"use client"
import React, { useEffect } from "react"
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"
import { cn } from "../../utils/cn"
import Button from "./Button"

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md", 
  className,
  // Modal variants
  variant = "default",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  isLoading = false,
  icon: CustomIcon,
  showCloseButton = false,
  preventCloseOnBackdrop = false,
  // Full screen overlay option
  fullScreenSuccess = false,
  // NUEVO: controlar si se muestra el botón de cancelar
  showCancelButton = true,
}) => {
  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
    fullscreen: "w-full h-full max-w-none max-h-none rounded-none"
  }

  const variants = {
    default: {
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      defaultIcon: Info,
      buttonVariant: "primary"
    },
    info: {
      iconBg: "bg-blue-100", 
      iconColor: "text-blue-600",
      defaultIcon: Info,
      buttonVariant: "primary"
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600", 
      defaultIcon: AlertTriangle,
      buttonVariant: "warning"
    },
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      defaultIcon: AlertCircle,
      buttonVariant: "danger"
    },
    success: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      defaultIcon: CheckCircle,
      buttonVariant: "success"
    }
  }

  const variantConfig = variants[variant] || variants.default
  const IconComponent = CustomIcon || variantConfig.defaultIcon

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventCloseOnBackdrop) {
      onClose()
    }
  }

  // Modificación: consider un modal como de confirmación cuando tiene un message y variante, incluso sin onConfirm
  const isConfirmationModal = variant !== "default" && message;

  // Cambios: lógica de botones para permitir solo uno
  const showConfirm = typeof onConfirm === 'function';
  const showCancel = typeof onClose === 'function' && showCancelButton;

  return (
    <div 
      key={`modal-${variant}-${isConfirmationModal ? 'confirmation' : 'default'}`}
      data-modal={`${variant}-modal`}
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto",
        fullScreenSuccess && "bg-emerald-50"
      )}
    >
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" />

        {/* Modal */}
        <div
          className={cn(
            "relative bg-white rounded-xl shadow-xl w-full transform transition-all",
            "scale-100 opacity-100",
            sizes[size],
            className,
          )}
        >
          {/* Confirmation Modal Layout */}
          {isConfirmationModal ? (
            <>
              {/* Close button for confirmation modals */}
              {showCloseButton && (
                <div className="flex justify-end p-4 pb-0">
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isLoading}
                  >
                    <X key="modal-close-x" className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Confirmation content */}
              <div className={cn("text-center px-6", showCloseButton ? "pb-6" : "pt-6 pb-6")}> 
                <div className={cn(
                  "mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4",
                  variantConfig.iconBg
                )}>
                  <IconComponent key={`modal-icon-${variant}`} className={cn("h-6 w-6", variantConfig.iconColor)} />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {title}
                </h3>
                
                <div className="text-slate-600 mb-6">
                  {message && (
                    <p className="mb-4 text-center font-semibold">{message}</p>
                  )}
                  {children}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  {showCancel && !showConfirm && (
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      {cancelText}
                    </Button>
                  )}
                  {showConfirm && !showCancel && (
                    <Button
                      variant={variantConfig.buttonVariant}
                      onClick={onConfirm}
                      loading={isLoading}
                    >
                      {confirmText}
                    </Button>
                  )}
                  {showCancel && showConfirm && (
                    <>
                      <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        {cancelText}
                      </Button>
                      <Button
                        variant={variantConfig.buttonVariant}
                        onClick={onConfirm}
                        loading={isLoading}
                      >
                        {confirmText}
                      </Button>
                    </>
                  )}
                  {/* NUEVO: Si no hay onConfirm y no se muestra cancelButton, 
                      pero sí hay onClose, mostrar un solo botón de confirmación que ejecuta onClose */}
                  {!showConfirm && !showCancel && onClose && (
                    <Button
                      variant={variantConfig.buttonVariant}
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      {confirmText}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Default Modal Layout */
            <>
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Cerrar modal"
                    >
                      <X key="default-modal-close-x" className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
