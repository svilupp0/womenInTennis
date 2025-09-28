import { createContext, useContext, useEffect, useState } from 'react'

// Crea il Context
export const AuthContext = createContext({})

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true) // Loading iniziale per check token

  // Funzione per salvare token e user in localStorage (SSR safe)
  const saveAuthData = (userData, authToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
    }
    setToken(authToken)
    setUser(userData)
  }

  // Funzione per rimuovere dati auth
  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setToken(null)
    setUser(null)
  }

  // Funzione login (AGGIORNATA per email verification)
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
        saveAuthData(data.user, data.token)
        return { success: true, user: data.user }
      } else {
        // Gestione specifica per email non verificata
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          return { 
            success: false, 
            error: data.error,
            code: 'EMAIL_NOT_VERIFIED',
            email: data.email 
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
            message: data.message 
          }
        } else {
          // Fallback per registrazioni già verificate
          saveAuthData(data.user, data.token)
          return { success: true, user: data.user }
        }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  // Funzione logout
  const logout = () => {
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
    return !!user && !!token
  }

  // Funzione per ottenere token per API calls
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Effect per caricare dati da localStorage al mount (SSR safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (savedToken && savedUser) {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Errore caricamento dati auth:', error)
        // Se c'è errore, pulisci localStorage
        clearAuthData()
      }
    }
    setLoading(false)
  }, [])

  // 🆕 FUNZIONE: Aggiorna dati utente senza logout/login (VERSIONE CORRETTA)
  const updateUser = (updatedUserData) => {
    if (!user) {
      console.warn('⚠️ Tentativo di aggiornare user quando user è null')
      return
    }

    // 🔄 MERGE con i dati esistenti (non sovrascrivere!)
    const mergedUserData = {
      ...user, // ← MANTIENI tutti i dati esistenti
      ...updatedUserData // ← SOVRASCRIVI solo i campi forniti
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
      after: mergedUserData
    })
  }

  // Valore del context
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    isAuthenticated,
    getAuthHeader,
    saveAuthData,
    clearAuthData,
    updateUser // ← NUOVA FUNZIONE ESPOSTA
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}