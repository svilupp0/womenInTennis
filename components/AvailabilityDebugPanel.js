// 🔍 DEBUG PANEL - Availability System
// Componente per debug e troubleshooting del sistema disponibilità

import React, { useState } from 'react'
import { useAvailabilityDebug } from '../hooks/useAvailabilityDebug'

const AvailabilityDebugPanel = () => {
  const {
    availability,
    isUpdating,
    error,
    lastUpdated,
    isSynced,
    isOnline,
    isOffline,
    toggleAvailability,
    debugInfo,
    clearError
  } = useAvailabilityDebug()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  // Non mostrare in produzione
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div>
      Availability Debug Panel
    </div>
  )
}

export default AvailabilityDebugPanel
