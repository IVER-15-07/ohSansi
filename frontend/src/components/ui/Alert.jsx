"use client"
import React, { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X, Clock } from "lucide-react"
import { cn } from "../../utils/cn"

const Alert = ({ 
  variant = "info", 
  title, 
  children, 
  onClose, 
  className,
  autoClose = false,
  autoCloseDelay = 5000,
  showCloseButton = true,
  showTimer = false,
  size = "md",
  priority = "normal", // low, normal, high, critical
  sticky = false, // Nueva prop para posicionamiento sticky
  position = "top" // top, bottom - posición del sticky
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000)

  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsVisible(false)
            setTimeout(() => {
              onClose && onClose()
            }, 300)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [autoClose, autoCloseDelay, onClose])

  const variants = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-900",
      icon: Info,
      iconColor: "text-blue-600",
      progressBar: "bg-blue-500",
      titleColor: "text-blue-900",
      textColor: "text-blue-800"
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      progressBar: "bg-emerald-500",
      titleColor: "text-emerald-900",
      textColor: "text-emerald-800"
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-900",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      progressBar: "bg-amber-500",
      titleColor: "text-amber-900",
      textColor: "text-amber-800"
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-900",
      icon: AlertCircle,
      iconColor: "text-red-600",
      progressBar: "bg-red-500",
      titleColor: "text-red-900",
      textColor: "text-red-800"
    },
  }

  const sizes = {
    sm: "text-xs p-3",
    md: "text-sm p-4", 
    lg: "text-base p-5"
  }

  const priorities = {
    low: "border-l-2",
    normal: "border-l-4",
    high: "border-l-4 shadow-md",
    critical: "border-l-8 shadow-lg ring-2 ring-red-200"
  }

  const { container, icon: Icon, iconColor, progressBar } = variants[variant]

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose && onClose()
    }, 300)
  }

  if (!isVisible) {
    return (
      <div className={cn(
        "border rounded-lg relative transition-all duration-300 ease-out transform scale-95 opacity-0",
        container, 
        sizes[size],
        sticky && "fixed z-50 left-4 right-4 max-w-md mx-auto",
        sticky && position === "top" && "top-4",
        sticky && position === "bottom" && "bottom-4",
        className
      )}>
        {/* Content placeholder to maintain layout during animation */}
      </div>
    )
  }

  const alertClasses = cn(
    "border rounded-lg relative transition-all duration-300 ease-in transform scale-100 opacity-100",
    container, 
    sizes[size],
    sticky && "fixed z-50 left-4 right-4 max-w-md mx-auto shadow-xl",
    sticky && position === "top" && "top-4",
    sticky && position === "bottom" && "bottom-4",
    className
  )

  return (
    <div className={alertClasses}>
      {/* Auto-close progress bar */}
      {autoClose && (
        <div className="absolute top-0 left-0 h-1 bg-black bg-opacity-10 rounded-t-lg overflow-hidden">
          <div 
            className={cn("h-full transition-all ease-linear", progressBar)}
            style={{
              animation: `shrink ${autoCloseDelay}ms linear forwards`,
            }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn(
              "font-semibold mb-1",
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
            )}>
              {title}
            </h3>
          )}
          <div className={cn(
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}>
            {children}
          </div>
        </div>
        {(onClose && showCloseButton) && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors duration-200"
            aria-label="Cerrar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default Alert
