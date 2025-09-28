// 🔍 DEBUG VERSION - useAvailability Hook
// Versione con logging esteso per troubleshooting

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export const useAvailabilityDebug = () => {
  const { user, token, isAvailable } = useAuth()
  const [availability, setAvailability] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [debugLog, setDebugLog] = useState([])

  // 🔍 Debug logging function
  const addDebugLog = useCallback((message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data
    }
    console.log('🔍 DEBUG:', logEntry)
    setDebugLog(prev => [...prev.slice(-9), logEntry]) // Keep last 10 logs
  }, [])

  // 🔄 Inizializza stato da database
  useEffect(() => {
    if (user && isAvailable) {
      const initialState = isAvailable()
      setAvailability(initialState)
      addDebugLog('Availability initialized', { 
        user: user.email, 
        initialState,
        userObject: user 
      })
    }
  }, [user, isAvailable, addDebugLog])

  // 🚀 Funzione per aggiornare disponibilità con debug esteso
  const updateAvailability = useCallback(async (newAvailability) => {
    addDebugLog('Update availability started', { 
      newAvailability, 
      currentAvailability: availability,
      hasToken: !!token 
    })

    if (!token) {
      const errorMsg = 'Non autenticato. Effettua il login.'
      setError(errorMsg)
      addDebugLog('Error: No token', { errorMsg })
      return false
    }

    // 🎯 Ottimismo UI - Aggiorna subito l'interfaccia
    const previousState = availability
    setAvailability(newAvailability)
    setIsUpdating(true)
    setError(null)

    addDebugLog('Optimistic UI update', { 
      previousState, 
      newAvailability,
      isUpdating: true 
    })

    try {
      addDebugLog('Making API request', {
        url: '/api/users/availability',
        method: 'PUT',
        body: { available: newAvailability }
      })

      const response = await fetch('/api/users/availability', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ available: newAvailability })
      })

      addDebugLog('API response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      // 🔧 SENIOR DEV: Error handling robusto per risposte malformate
      if (!response.ok) {
        let errorMessage = 'Errore aggiornamento disponibilità'
        
        try {
          const errorData = await response.json()
          errorMessage = errorData?.error || errorData?.message || errorMessage
          addDebugLog('Error response parsed', { errorData, errorMessage })
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
          console.warn('Impossibile parsare risposta errore:', jsonError)
          addDebugLog('JSON parse error on error response', { jsonError, status: response.status })
        }
        
        const fullErrorMessage = `${errorMessage} (Status: ${response.status})`
        addDebugLog('API error final', { fullErrorMessage, status: response.status })
        throw new Error(fullErrorMessage)
      }

      const data = await response.json()
      addDebugLog('Success response parsed', { data })

      // ✅ Successo - Gestisce sia struttura vecchia che nuova
      const updatedAvailability = data.disponibilita ?? data.available ?? newAvailability
      const timestamp = data.updatedAt || data.timestamp || new Date().toISOString()
      
      setAvailability(updatedAvailability)
      setLastUpdated(new Date(timestamp))
      
      addDebugLog('Success: Availability updated', {
        updatedAvailability,
        timestamp,
        responseData: data
      })
      
      return true

    } catch (error) {
      addDebugLog('Error caught', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack
      })
      
      // 🔄 Rollback ottimismo UI
      setAvailability(previousState)
      
      // 🔧 Gestione errori migliorata
      let errorMessage = 'Errore di connessione. Riprova più tardi.'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.name === 'TypeError') {
        errorMessage = 'Errore di rete. Controlla la connessione.'
      }
      
      setError(errorMessage)
      
      addDebugLog('Rollback completed', {
        rolledBackTo: previousState,
        errorMessage
      })
      
      return false
    } finally {
      setIsUpdating(false)
      addDebugLog('Update process completed', { isUpdating: false })
    }
  }, [availability, token, addDebugLog])

  // 🔄 Toggle disponibilità
  const toggleAvailability = useCallback(async () => {
    addDebugLog('Toggle availability called', { currentState: availability })
    return await updateAvailability(!availability)
  }, [availability, updateAvailability, addDebugLog])

  // 📊 Stato di sincronizzazione
  const isSynced = !isUpdating && !error
  const isOnline = availability && isSynced
  const isOffline = !availability && isSynced

  // 🔍 Debug info object
  const debugInfo = {
    logs: debugLog,
    state: {
      availability,
      isUpdating,
      error,
      lastUpdated,
      isSynced,
      isOnline,
      isOffline
    },
    auth: {
      hasUser: !!user,
      hasToken: !!token,
      userEmail: user?.email
    }
  }

  // 🎯 Return hook interface with debug info
  return {
    // Stato normale
    availability,
    isUpdating,
    error,
    lastUpdated,
    
    // Stato derivato
    isSynced,
    isOnline,
    isOffline,
    
    // Azioni
    toggleAvailability,
    updateAvailability,
    
    // Debug
    debugInfo,
    addDebugLog,
    
    // Utilities
    clearError: () => {
      setError(null)
      addDebugLog('Error cleared manually')
    }
  }
}

export default useAvailabilityDebug