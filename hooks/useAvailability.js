// 🔄 CUSTOM HOOK - User Availability Management
// Hook per gestire lo stato di disponibilità con persistenza

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export const useAvailability = () => {
  const { user, token, isAvailable, updateUser } = useAuth()
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
  const updateAvailability = useCallback(
    async (newAvailability) => {
      if (!token) {
        setError('Non autenticato. Effettua il login.')
        return false
      }

      // 🎯 Ottimismo UI - Aggiorna subito l'interfaccia
      const previousState = availability
      setAvailability(newAvailability)
      setIsUpdating(true)
      setError(null)

      try {
        const response = await fetch('/api/users/availability', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ available: newAvailability }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Errore aggiornamento disponibilità')
        }

        // ✅ Successo - Conferma stato e aggiorna timestamp
        // Gestisce sia la vecchia (available, timestamp) che la nuova (disponibilita, updatedAt) struttura
        const confirmedAvailability = data.disponibilita ?? data.available
        const confirmedTimestamp = data.updatedAt ?? data.timestamp

        // --- Gestione e Setting dell'Availability ---
        // Verifico se ho un valore di disponibilità valido da una delle due chiavi.
        // Ho bisogno di un controllo più rigoroso per evitare che 'undefined' venga passato ai setters
        // e per implementare il fallback richiesto.
        if (confirmedAvailability !== undefined && confirmedAvailability !== null) {
          // Uso il valore confermato (o la vecchia o la nuova chiave)
          setAvailability(confirmedAvailability)
        } else {
          // Fallback al valore ottimistico/locale (newAvailability) se l'API non ha restituito
          // né la vecchia né la nuova chiave valide.
          setAvailability(newAvailability)
          console.warn(
            'API response missing expected availability field. Falling back to optimistic state.'
          )
        }

        // --- Gestione e Setting del Timestamp ---
        // Se confirmedTimestamp è un valore truthy (non null, non undefined, non '')
        if (confirmedTimestamp) {
          // Utilizzo il timestamp confermato (nuovo o vecchio)
          setLastUpdated(new Date(confirmedTimestamp))
        } else {
          // Fallback al momento attuale se nessun timestamp è disponibile da entrambe le chiavi
          setLastUpdated(new Date())
          console.warn(
            'API response missing expected timestamp field. Falling back to current local time.'
          )
        }

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
    [availability, token]
  )

  // 🔄 Toggle disponibilità
  const toggleAvailability = useCallback(async () => {
    return await updateAvailability(!availability)
  }, [availability, updateAvailability])

  // 🔄 Imposta disponibilità specifica
  const setAvailabilityTo = useCallback(
    async (newState) => {
      if (newState === availability) {
        return true // Nessun cambiamento necessario
      }
      return await updateAvailability(newState)
    },
    [availability, updateAvailability]
  )

  // 📊 Stato di sincronizzazione
  const isSynced = !isUpdating && !error
  const isOnline = availability && isSynced
  const isOffline = !availability && isSynced

  // 🔄 Funzione per ricaricare stato dal server
  const refreshAvailability = useCallback(async () => {
    if (!token) return

    try {
      setIsUpdating(true)
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

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
  }, [token])

  // 🔄 Auto-refresh periodico (opzionale)
  useEffect(() => {
    if (!user || !token) return

    // Refresh ogni 5 minuti per sincronizzare con altri dispositivi
    const interval = setInterval(refreshAvailability, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, token, refreshAvailability])

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
