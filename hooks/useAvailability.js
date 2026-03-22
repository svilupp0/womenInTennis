// 🔄 CUSTOM HOOK - User Availability Management
// Hook per gestire lo stato di disponibilità con persistenza

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { updateUserAvailability } from '../lib/services/playerService'

export const useAvailability = () => {
  const { user, isAvailable, updateUser } = useAuth()
  const [availability, setAvailability] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 🔄 Inizializza stato da database
  useEffect(() => {
    if (user && isAvailable) {
      const initialState = isAvailable()
      setAvailability(initialState)
      console.log('🔄 Availability initialized:', initialState)
    }
  }, [user, isAvailable])

  // 🚀 Funzione per aggiornare disponibilità con ottimismo UI
  const updateAvailabilityState = useCallback(
    async (newAvailability) => {
      if (!user) {
        setError('Non autenticato. Effettua il login.')
        return false
      }

      // 🎯 Ottimismo UI - Aggiorna subito l'interfaccia
      const previousState = availability
      setAvailability(newAvailability)
      setIsUpdating(true)
      setError(null)

      try {
        const result = await updateUserAvailability(newAvailability)

        if (!result.success) {
          throw new Error(result.error || 'Errore aggiornamento disponibilità')
        }

        // ✅ Successo - Conferma stato e aggiorna timestamp
        const confirmedAvailability = result.disponibilita ?? newAvailability

        if (confirmedAvailability !== undefined && confirmedAvailability !== null) {
          setAvailability(confirmedAvailability)
        } else {
          setAvailability(newAvailability)
          console.warn(
            'API response missing expected availability field. Falling back to optimistic state.'
          )
        }

        setLastUpdated(new Date())

        console.log('✅ Availability updated successfully:', confirmedAvailability)

        // 🔄 SINCRONIZZA anche il user context per mantenere coerenza
        if (updateUser && user) {
          updateUser({ disponibilita: confirmedAvailability })
          console.log('🔄 User context synchronized with new availability:', confirmedAvailability)
        }

        return true
      } catch (error) {
        console.error('❌ Errore aggiornamento disponibilità:', error)

        // 🔄 Rollback ottimismo UI
        setAvailability(previousState)
        setError(error.message)

        // 🔔 Notifica utente (opzionale)
        if (typeof window !== 'undefined') {
          // Potresti usare una toast library qui
          alert(`Errore: ${error.message}`)
        }

        return false
      } finally {
        setIsUpdating(false)
      }
    },
    [availability, user, updateUser]
  )

  // 🔄 Toggle disponibilità
  const toggleAvailability = useCallback(async () => {
    return await updateAvailabilityState(!availability)
  }, [availability, updateAvailabilityState])

  // 🔄 Imposta disponibilità specifica
  const setAvailabilityTo = useCallback(
    async (newState) => {
      if (newState === availability) {
        return true // Nessun cambiamento necessario
      }
      return await updateAvailabilityState(newState)
    },
    [availability, updateAvailabilityState]
  )

  // 📊 Stato di sincronizzazione
  const isSynced = !isUpdating && !error
  const isOnline = availability && isSynced
  const isOffline = !availability && isSynced

  // 🔄 Funzione per ricaricare stato dal server
  const refreshAvailability = useCallback(async () => {
    if (!user) return

    try {
      setIsUpdating(true)
      const response = await fetch('/api/users/me')

      if (response.ok) {
        const userData = await response.json()
        // Gestisce sia la vecchia che la nuova struttura per il refresh
        const userAvailability = userData.disponibilita ?? userData.available ?? false
        setAvailability(userAvailability)
        setError(null)
      }
    } catch (error) {
      console.error('Errore refresh disponibilità:', error)
      setError('Errore sincronizzazione')
    } finally {
      setIsUpdating(false)
    }
  }, [user])

  // 🔄 Auto-refresh periodico (opzionale)
  useEffect(() => {
    if (!user) return

    // Refresh ogni 5 minuti per sincronizzare con altri dispositivi
    const interval = setInterval(refreshAvailability, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, refreshAvailability])

  // 🎯 Return hook interface
  return {
    // Stato
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
    setAvailabilityTo,
    refreshAvailability,

    // Utilities
    clearError: () => setError(null),
  }
}

// 🎯 Hook semplificato per casi base
export const useSimpleAvailability = () => {
  const { availability, toggleAvailability, isUpdating } = useAvailability()

  return {
    isAvailable: availability,
    toggle: toggleAvailability,
    isLoading: isUpdating,
  }
}

export default useAvailability
