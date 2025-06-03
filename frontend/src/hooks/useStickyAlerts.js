import { useState, useCallback } from 'react'

export const useStickyAlerts = () => {
  const [alerts, setAlerts] = useState([])

  const addAlert = useCallback((alert) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newAlert = {
      id,
      autoClose: true,
      autoCloseDelay: 5000,
      position: "top-right",
      priority: "normal",
      ...alert
    }
    
    setAlerts(prev => [...prev, newAlert])
    return id
  }, [])

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Métodos de conveniencia para diferentes tipos de alertas
  const showSuccess = useCallback((title, message, options = {}) => {
    return addAlert({
      variant: "success",
      title,
      message,
      ...options
    })
  }, [addAlert])

  const showError = useCallback((title, message, options = {}) => {
    return addAlert({
      variant: "error",
      title,
      message,
      autoClose: false, // Los errores no se cierran automáticamente por defecto
      ...options
    })
  }, [addAlert])

  const showWarning = useCallback((title, message, options = {}) => {
    return addAlert({
      variant: "warning",
      title,
      message,
      autoCloseDelay: 7000, // Un poco más de tiempo para warnings
      ...options
    })
  }, [addAlert])

  const showInfo = useCallback((title, message, options = {}) => {
    return addAlert({
      variant: "info",
      title,
      message,
      ...options
    })
  }, [addAlert])

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
