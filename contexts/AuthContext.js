import { createContext, useContext, useEffect, useState } from 'react'

// Crea il Context
export const AuthContext = createContext({})

// Hook base per accedere al context
export const useAuth = () => useContext(AuthContext)

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // Loading iniziale per check sessione

  // Funzione per salvare user in localStorage (SSR safe)
  const saveAuthData = (userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData))
    }
    setUser(userData)
  }

  // Funzione per rimuovere dati auth
  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token') // pulizia backward-compat
    }
    setUser(null)
  }

  // Funzione login
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        saveAuthData(data.user)
        return { success: true, user: data.user }
      } else {
        // Gestione specifica per email non verificata
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          return {
            success: false,
            error: data.error,
            code: 'EMAIL_NOT_VERIFIED',
            email: data.email,
          }
        }
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  // Funzione register (AGGIORNATA per email verification)
  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        // NON salvare auth data se richiede verifica email
        if (data.nextStep === 'EMAIL_VERIFICATION_REQUIRED') {
          return {
            success: true,
            user: data.user,
            requiresEmailVerification: true,
            message: data.message,
          }
        } else {
          // Fallback per registrazioni già verificate
          saveAuthData(data.user)
          return { success: true, user: data.user }
        }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  // Funzione logout — cancella il cookie HttpOnly server-side
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Errore logout:', error)
    }
    clearAuthData()
  }

  // Funzione per reinviare email di verifica
  const resendVerificationEmail = async (email) => {
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  // Funzione per richiedere reset password
  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  // Funzione per reset password
  const resetPassword = async (token, email, password, confirmPassword) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, password, confirmPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  // Funzione per verificare se utente è autenticato
  const isAuthenticated = () => {
    return !!user
  }

  // Effect per caricare user da localStorage al mount (SSR safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user')

        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Errore caricamento dati auth:', error)
        clearAuthData()
      }
    }
    setLoading(false)
  }, [])

  // Aggiorna dati utente senza logout/login
  const updateUser = (updatedUserData) => {
    if (!user) {
      console.warn('⚠️ Tentativo di aggiornare user quando user è null')
      return
    }

    // Merge con i dati esistenti (non sovrascrivere!)
    const mergedUserData = {
      ...user,
      ...updatedUserData,
    }

    // Aggiorna localStorage con i dati completi
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(mergedUserData))
    }

    // Aggiorna React state
    setUser(mergedUserData)

    console.log('🔄 User data updated:', {
      before: user,
      received: updatedUserData,
      after: mergedUserData,
    })
  }

  // Valore del context
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    isAuthenticated,
    saveAuthData,
    clearAuthData,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
