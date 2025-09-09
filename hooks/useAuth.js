import { useAuth as useAuthContext } from '../contexts/AuthContext'

/**
 * Hook personalizzato per gestione autenticazione
 * Fornisce accesso semplificato al AuthContext con funzioni helper
 */
export const useAuth = () => {
  const context = useAuthContext()

  // Verifica che il hook sia usato dentro AuthProvider
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }

  const {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    getAuthHeader,
    saveAuthData,
    clearAuthData
  } = context

  // Funzioni helper aggiuntive
  const helpers = {
    // Check se utente ha completato il profilo
    hasCompleteProfile: () => {
      return user && user.comune && user.livello
    },

    // Get user display name (email se non c'è nome)
    getDisplayName: () => {
      return user?.nome || user?.email?.split('@')[0] || 'Utente'
    },

    // Check se utente è disponibile per giocare
    isAvailable: () => {
      return user?.disponibilita === true
    },

    // Get user level in italiano
    getUserLevel: () => {
      const levels = {
        'Principiante': 'Principiante',
        'Intermedio': 'Intermedio', 
        'Avanzato': 'Avanzato'
      }
      return levels[user?.livello] || 'Non specificato'
    },

    // Get user location
    getUserLocation: () => {
      return user?.comune || 'Non specificato'
    },

    // Check se utente è admin
    isAdmin: () => {
      return user?.isAdmin === true
    },

    // Check se token è scaduto (basic check)
    isTokenExpired: () => {
      if (!token) return true
      
      try {
        // Decode JWT payload (senza verifica, solo per check scadenza)
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Date.now() / 1000
        return payload.exp < now
      } catch (error) {
        console.error('Errore verifica token:', error)
        return true
      }
    },

    // Logout con redirect
    logoutAndRedirect: (redirectPath = '/') => {
      logout()
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
    },

    // Login con redirect automatico
    loginAndRedirect: async (email, password, redirectPath = '/dashboard') => {
      const result = await login(email, password)
      
      if (result.success && typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
      
      return result
    },

    // Register con redirect automatico
    registerAndRedirect: async (userData, redirectPath = '/dashboard') => {
      const result = await register(userData)
      
      if (result.success && typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
      
      return result
    }
  }

  return {
    // Stato base
    user,
    token,
    loading,
    
    // Funzioni core
    login,
    register,
    logout,
    isAuthenticated,
    getAuthHeader,
    saveAuthData,
    clearAuthData,
    
    // Helper functions
    ...helpers
  }
}

export default useAuth