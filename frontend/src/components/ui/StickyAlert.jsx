import React, { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "../../utils/cn"

const StickyAlert = ({ 
  id,
  variant = "info", 
  title, 
  message, 
  onClose, 
  className,
  autoClose = true,
  autoCloseDelay = 5000,
  position = "top-right", // top-right, top-left, top-center, bottom-right, bottom-left, bottom-center
  priority = "normal" // low, normal, high, critical
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000)

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsAnimating(true), 10)

    if (autoClose && autoCloseDelay > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleClose()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [autoClose, autoCloseDelay])

  const variants = {
    info: {
      container: "bg-blue-600 border-blue-700 text-white shadow-blue-500/25",
      icon: Info,
      iconColor: "text-blue-100",
      progressBar: "bg-blue-300"
    },
    success: {
      container: "bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/25",
      icon: CheckCircle,
      iconColor: "text-emerald-100",
      progressBar: "bg-emerald-300"
    },
    warning: {
      container: "bg-amber-600 border-amber-700 text-white shadow-amber-500/25",
      icon: AlertTriangle,
      iconColor: "text-amber-100",
      progressBar: "bg-amber-300"
    },
    error: {
      container: "bg-red-600 border-red-700 text-white shadow-red-500/25",
      icon: AlertCircle,
      iconColor: "text-red-100",
      progressBar: "bg-red-300"
    },
  }

  const positions = {
    "top-right": "fixed top-4 right-4 z-50",
    "top-left": "fixed top-4 left-4 z-50",
    "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2 z-50",
    "bottom-right": "fixed bottom-4 right-4 z-50",
    "bottom-left": "fixed bottom-4 left-4 z-50",
    "bottom-center": "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
  }

  const animations = {
    "top-right": isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
    "top-left": isAnimating ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
    "top-center": isAnimating ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
    "bottom-right": isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
    "bottom-left": isAnimating ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
    "bottom-center": isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
  }

  const priorities = {
    low: "border shadow-lg",
    normal: "border-2 shadow-xl",
    high: "border-2 shadow-2xl ring-2 ring-white/20",
    critical: "border-4 shadow-2xl ring-4 ring-white/30 animate-pulse"
  }

  const { container, icon: Icon, iconColor, progressBar } = variants[variant]

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose && onClose(id)
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div 
      className={cn(
        positions[position],
        "transition-all duration-300 ease-out transform w-96 max-w-[calc(100vw-2rem)]",
        animations[position],
        className
      )}
    >
      <div className={cn(
        "rounded-lg relative overflow-hidden backdrop-blur-sm",
        container,
        priorities[priority],
        "p-4"
      )}>
        {/* Barra de progreso de auto-close */}
        {autoClose && (
          <div className="absolute top-0 left-0 h-1 bg-black bg-opacity-20 w-full">
            <div 
              className={cn("h-full transition-all ease-linear", progressBar)}
              style={{
                animation: `shrink ${autoCloseDelay}ms linear forwards`,
              }}
            />
          </div>
        )}

        <div className="flex items-start space-x-3 pt-1">
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor)} />
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-semibold mb-1 text-sm">
                {title}
              </h3>
            )}
            <div className="text-sm opacity-90">
              {message}
            </div>
            {autoClose && timeLeft > 0 && (
              <div className="text-xs opacity-75 mt-1">
                Se cierra automáticamente en {timeLeft}s
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
            aria-label="Cerrar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
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

export default StickyAlert
