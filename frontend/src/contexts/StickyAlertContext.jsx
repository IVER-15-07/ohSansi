import React, { createContext, useContext } from 'react'
import { useStickyAlerts } from '../hooks/useStickyAlerts'
import StickyAlertContainer from '../components/ui/StickyAlertContainer'

const StickyAlertContext = createContext()

export const StickyAlertProvider = ({ children }) => {
  const alertSystem = useStickyAlerts()

  return (
    <StickyAlertContext.Provider value={alertSystem}>
      {children}
      <StickyAlertContainer 
        alerts={alertSystem.alerts}
        onRemoveAlert={alertSystem.removeAlert}
      />
    </StickyAlertContext.Provider>
  )
}

export const useStickyAlert = () => {
  const context = useContext(StickyAlertContext)
  if (!context) {
    throw new Error('useStickyAlert debe ser usado dentro de un StickyAlertProvider')
  }
  return context
}
