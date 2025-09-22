// __tests__/auth.test.js
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Mock fetch per simulare API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

// Componente di test per testare il context
function TestComponent() {
  const { user, login, register, logout, loading } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => register({ email: 'new@example.com', password: 'password123' })}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

function renderWithAuthProvider(component) {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  it('should initialize with no user and loading false', async () => {
    renderWithAuthProvider(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    
    // Mock successful login response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: 1, email: 'test@example.com', emailVerified: true },
        token: 'fake-jwt-token'
      })
    })

    renderWithAuthProvider(<TestComponent />)
    
    await user.click(screen.getByTestId('login-btn'))
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      })
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should handle login with unverified email', async () => {
    const user = userEvent.setup()
    
    // Mock unverified email response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Email non verificata',
        code: 'EMAIL_NOT_VERIFIED',
        email: 'unverified@example.com'
      })
    })

    renderWithAuthProvider(<TestComponent />)
    
    await user.click(screen.getByTestId('login-btn'))
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })

  it('should handle registration requiring email verification', async () => {
    const user = userEvent.setup()
    
    // Mock registration response requiring verification
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: 1, email: 'new@example.com', emailVerified: false },
        requiresEmailVerification: true,
        message: 'Controlla la tua email per verificare l\'account.'
      })
    })

    renderWithAuthProvider(<TestComponent />)
    
    await user.click(screen.getByTestId('register-btn'))
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new@example.com', password: 'password123' })
      })
      // Non dovrebbe fare auto-login se richiede verifica
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })

  it('should handle logout', async () => {
    const user = userEvent.setup()
    
    // Setup initial user state
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }))
    
    renderWithAuthProvider(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
    
    await user.click(screen.getByTestId('logout-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  it('should load user from localStorage on mount', async () => {
    const userData = { id: 1, email: 'stored@example.com' }
    localStorage.setItem('token', 'stored-token')
    localStorage.setItem('user', JSON.stringify(userData))
    
    renderWithAuthProvider(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('stored@example.com')
    })
  })
})