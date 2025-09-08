import { createContext, useContext, useEffect, useState } from 'react'

// Crea il Context
const AuthContext = createContext({})

// Hook per usare il context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }
  return context
}

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
        saveAuthData(data.user, data.token)
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  // Funzione register
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
        saveAuthData(data.user, data.token)
        return { success: true, user: data.user }
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

  // Valore del context
  const value = {
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
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext