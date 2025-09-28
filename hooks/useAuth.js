import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const {
    user,
    token,
    loading,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
    isAuthenticated,
    getAuthHeader,
    saveAuthData,
    clearAuthData,
    updateUser // <- IMPORTATO dal context
  } = context

  // Funzioni helper aggiuntive
  const helpers = {
    // Informazioni utente
    getUserEmail: () => user?.email || '',
    getUserLocation: () => user?.comune || 'Non specificato',
    getUserLevel: () => {
      const levels = {
        'Principiante': 'Principiante',
        'Intermedio': 'Intermedio',
        'Avanzato': 'Avanzato'
      }
      return levels[user?.livello] || 'Non specificato'
    },
    getUserPhone: () => user?.telefono || 'Non specificato',
    isUserAvailable: () => user?.disponibilita ?? false,
    isEmailVerified: () => user?.emailVerified || false,
    isAdmin: () => user?.isAdmin || false,

    // Backward compatibility
    getDisplayName: () => {
      return user?.nome || user?.email?.split('@')[0] || 'Utente'
    },
    isAvailable: () => {
      return user?.disponibilita === true
    },

    // Informazioni auth
    hasValidToken: () => !!token && !loading,
    
    // Informazioni profilo
    hasCompleteProfile: () => {
      return !!(user?.comune && user?.livello)
    },
    
    getProfileCompleteness: () => {
      if (!user) return 0
      
      let completed = 0
      const fields = ['email', 'comune', 'livello', 'telefono']
      
      fields.forEach(field => {
        if (user[field]) completed++
      })
      
      return Math.round((completed / fields.length) * 100)
    },

    // Login con redirect automatico
    loginAndRedirect: async (email, password, redirectPath = '/dashboard') => {
      const result = await login(email, password)
      if (result.success && typeof window !== 'undefined') {
        window.location.href = redirectPath
      }
      return result
    }
  }

  return {
    // Stati base
    user,
    token,
    loading,
    
    // Funzioni auth
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
    isAuthenticated,
    getAuthHeader,
    saveAuthData,
    clearAuthData,
    updateUser, // <- ESPORTATO per l'uso nei componenti
    
    // Helper functions
    ...helpers
  }
}

export default useAuth