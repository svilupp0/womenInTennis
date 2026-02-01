import { useState, useEffect } from 'react'

/**
 * Custom Hook per gestione modifica profilo utente
 *
 * Responsabilità:
 * - Gestione stato form modifica profilo
 * - Validazione e aggiornamento profilo
 * - Gestione sport-livelli multipli
 * - Sincronizzazione con backend
 *
 * @param {object} user - Utente corrente
 * @param {string} token - JWT token per autenticazione API
 * @param {function} updateUser - Callback per aggiornare utente in AuthContext
 * @returns {object} - Stati e funzioni per modifica profilo
 */
export function useProfileEditor(user, token, updateUser) {
  // Stato form modifica profilo
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    comune: '',
    sportLevels: [],
    telefono: '',
    selectedSport: '',
    selectedLivello: '',
  })

  // Stati UI
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileUpdateError, setProfileUpdateError] = useState(null)

  /**
   * Inizializza form quando viene aperto
   */
  useEffect(() => {
    if (user && showEditProfile) {
      setEditProfileForm({
        name: user.name || '',
        comune: user.comune || '',
        sportLevels: user.sportLevels || [],
        telefono: user.telefono || '',
        selectedSport: '',
        selectedLivello: '',
      })
      setProfileUpdateError(null)
    }
  }, [user, showEditProfile])

  /**
   * Aggiorna un campo del form
   */
  const handleProfileFormChange = (field, value) => {
    setEditProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Pulisci errore quando l'utente modifica
    if (profileUpdateError) {
      setProfileUpdateError(null)
    }
  }

  /**
   * Aggiungi una combinazione sport-livello
   */
  const addSportLevel = () => {
    if (!editProfileForm.selectedSport || !editProfileForm.selectedLivello) {
      return {
        success: false,
        error: 'Seleziona sia lo sport che il livello',
      }
    }

    const newSportLevel = {
      sport: editProfileForm.selectedSport,
      livello: editProfileForm.selectedLivello,
    }

    // Verifica se già presente
    const exists = editProfileForm.sportLevels.some(
      (sl) => sl.sport === newSportLevel.sport && sl.livello === newSportLevel.livello
    )

    if (exists) {
      return {
        success: false,
        error: 'Questa combinazione sport-livello è già presente',
      }
    }

    setEditProfileForm((prev) => ({
      ...prev,
      sportLevels: [...prev.sportLevels, newSportLevel],
      selectedSport: '',
      selectedLivello: '',
    }))

    return { success: true }
  }

  /**
   * Rimuovi una combinazione sport-livello
   */
  const removeSportLevel = (index) => {
    setEditProfileForm((prev) => ({
      ...prev,
      sportLevels: prev.sportLevels.filter((_, i) => i !== index),
    }))
  }

  /**
   * Salva modifiche profilo al backend
   */
  const saveProfileChanges = async () => {
    if (!token) {
      setProfileUpdateError('Sessione scaduta. Effettua nuovamente il login.')
      return { success: false }
    }

    setIsUpdatingProfile(true)
    setProfileUpdateError(null)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editProfileForm),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Aggiorna utente nel context (senza reload)
        const updatedUserFromDB = data.user
        updateUser(updatedUserFromDB)

        // Chiudi form
        setShowEditProfile(false)

        return {
          success: true,
          message: 'Profilo aggiornato con successo!',
        }
      } else {
        // Errore dal server
        const errorMsg = data.error || "Errore durante l'aggiornamento del profilo"
        setProfileUpdateError(errorMsg)
        return { success: false, error: errorMsg }
      }
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error)
      const errorMsg = 'Errore di connessione. Riprova più tardi.'
      setProfileUpdateError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  /**
   * Annulla modifiche e chiudi form
   */
  const cancelProfileEdit = () => {
    setShowEditProfile(false)
    setProfileUpdateError(null)
    // Reset form ai valori originali
    if (user) {
      setEditProfileForm({
        name: user.name || '',
        comune: user.comune || '',
        sportLevels: user.sportLevels || [],
        telefono: user.telefono || '',
        selectedSport: '',
        selectedLivello: '',
      })
    }
  }

  /**
   * Apri form modifica
   */
  const openProfileEdit = () => {
    setShowEditProfile(true)
  }

  return {
    // Stato form
    editProfileForm,
    showEditProfile,
    isUpdatingProfile,
    profileUpdateError,

    // Funzioni gestione form
    handleProfileFormChange,
    addSportLevel,
    removeSportLevel,

    // Funzioni principali
    saveProfileChanges,
    cancelProfileEdit,
    openProfileEdit,
    setShowEditProfile,
  }
}
