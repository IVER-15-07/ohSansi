import React from "react"
import StickyAlert from "./StickyAlert"

const StickyAlertContainer = ({ alerts, onRemoveAlert }) => {
  if (!alerts || alerts.length === 0) return null

  // Agrupar alertas por posición
  const alertsByPosition = alerts.reduce((acc, alert) => {
    const position = alert.position || "top-right"
    if (!acc[position]) acc[position] = []
    acc[position].push(alert)
    return acc
  }, {})

  return (
    <>
      {Object.entries(alertsByPosition).map(([position, positionAlerts]) => (
        <div key={position} className="pointer-events-none">
          <div 
            className={`fixed z-50 space-y-2 pointer-events-auto ${
              position === "top-right" ? "top-4 right-4" :
              position === "top-left" ? "top-4 left-4" :
              position === "top-center" ? "top-4 left-1/2 transform -translate-x-1/2" :
              position === "bottom-right" ? "bottom-4 right-4" :
              position === "bottom-left" ? "bottom-4 left-4" :
              position === "bottom-center" ? "bottom-4 left-1/2 transform -translate-x-1/2" :
              "top-4 right-4"
            }`}
          >
            {positionAlerts.map((alert, index) => (
              <div 
                key={alert.id} 
                style={{ 
                  zIndex: 1000 + index,
                  marginTop: index > 0 ? '8px' : '0'
                }}
              >
                <StickyAlert
                  {...alert}
                  onClose={() => onRemoveAlert(alert.id)}
                  position="static" // Posición manejada por el contenedor
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default StickyAlertContainer
