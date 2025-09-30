import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Auth.module.css'

export default function Login() {
  const { loginAndRedirect, resendVerification, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear errors when user starts typing
    if (error) setError('')
    if (resendSuccess) setResendSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResendSuccess('')

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Email e password sono obbligatori')
      setIsLoading(false)
      return
    }

    try {
      // Usa il hook useAuth per login con redirect automatico
      const result = await loginAndRedirect(
        formData.email, 
        formData.password, 
        '/dashboard'
      )

      if (!result.success) {
        // Gestione specifica per email non verificata
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(result.email || formData.email)
          setShowEmailVerification(true)
          setError('')
        } else {
          setError(result.error || 'Errore durante il login')
        }
      }
      // Se success = true, il redirect è automatico
    } catch (error) {
      console.error('Errore login:', error)
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    setError('')
    setResendSuccess('')

    try {
      const result = await resendVerification(unverifiedEmail)
      
      if (result.success) {
        setResendSuccess(result.message)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Errore reinvio:', error)
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToLogin = () => {
    setShowEmailVerification(false)
    setUnverifiedEmail('')
    setError('')
    setResendSuccess('')
  }

  // Schermata email non verificata
  if (showEmailVerification) {
    return (
      <>
        <Head>
          <title>Email Non Verificata - Women in Net</title>
          <meta name="description" content="Verifica la tua email per accedere" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className={styles.authPage}>
          <header className={styles.header}>
            <div className="container">
              <Link href="/" className={styles.logo}>
                <div className={styles.logoIcon}>🎾</div>
                <span>Women in Net</span>
              </Link>
            </div>
          </header>

          <main className={styles.main}>
            <div className="container">
              <div className={styles.authCard}>
                <div className={styles.authHeader}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                  <h1>Email non verificata</h1>
                  <p>Devi verificare la tua email <strong>{unverifiedEmail}</strong> prima di poter accedere.</p>
                </div>

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                {resendSuccess && (
                  <div className={styles.successMessage}>
                    {resendSuccess}
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>
                    Come procedere:
                  </h3>
                  <ol style={{ textAlign: 'left', color: 'var(--gray-600)', lineHeight: '1.8' }}>
                    <li>Controlla la tua casella di posta elettronica</li>
                    <li>Cerca l'email di verifica da Women in Net</li>
                    <li>Clicca sul link di verifica nell'email</li>
                    <li>Torna qui per fare login</li>
                  </ol>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="btn btn-accent"
                    style={{ marginBottom: '1rem', width: '100%' }}
                  >
                    {isResending ? '📤 Invio...' : '📧 Reinvia Email di Verifica'}
                  </button>

                  <button
                    onClick={handleBackToLogin}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    🔙 Torna al Login
                  </button>
                </div>

                <div className={styles.authFooter}>
                  <p>
                    Non trovi l'email? Controlla la cartella spam o{' '}
                    <Link href="/register" className={styles.authLink}>
                      registrati di nuovo
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    )
  }

  // Form di login normale
  return (
    <>
      <Head>
        <title>Accedi - Women in Net</title>
        <meta name="description" content="Accedi al tuo account Women in Net" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.authPage}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>🎾</div>
              <span>Women in Net</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className="container">
            <div className={styles.authCard}>
              <div className={styles.authHeader}>
                <h1>Bentornata!</h1>
                <p>Accedi al tuo account per trovare nuove partner di net</p>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="la.tua.email@esempio.com"
                    autocomplete="email"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="La tua password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || authLoading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {(isLoading || authLoading) ? '⏳ Accesso...' : '🚀 Accedi'}
                </button>
              </form>

              <div className={styles.authFooter}>
                <p>
                  <Link href="/forgot-password" className={styles.authLink}>
                    🔐 Password dimenticata?
                  </Link>
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  Non hai ancora un account?{' '}
                  <Link href="/register" className={styles.authLink}>
                    Registrati qui
                  </Link>
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  Problemi con l'accesso?{' '}
                  <Link href="/verify-email" className={styles.authLink}>
                    Verifica email
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}