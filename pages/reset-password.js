import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Auth.module.css'

export default function ResetPassword() {
  const router = useRouter()
  const { token, email } = router.query

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(null) // null = checking, true = valid, false = invalid

  // Verifica se token ed email sono presenti
  useEffect(() => {
    if (router.isReady) {
      if (!token || !email) {
        setIsValidToken(false)
        setError('Link non valido. Token o email mancanti.')
      } else {
        setIsValidToken(true)
      }
    }
  }, [router.isReady, token, email])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Pulisci errori quando l'utente inizia a digitare
    if (error) setError('')
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'La password deve essere di almeno 8 caratteri'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La password deve contenere almeno una lettera minuscola'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La password deve contenere almeno una lettera maiuscola'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La password deve contenere almeno un numero'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validazione client-side
    if (!formData.password || !formData.confirmPassword) {
      setError('Tutti i campi sono obbligatori')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      setIsLoading(false)
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // Redirect al login dopo 3 secondi
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Errore durante il reset della password')
      }
    } catch (error) {
      console.error('Errore reset password:', error)
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state mentre verifica il router
  if (isValidToken === null) {
    return (
      <div className={styles.authPage}>
        <div className={styles.main}>
          <div className="container">
            <div className={styles.authCard}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Verifica del link in corso...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Token non valido
  if (isValidToken === false) {
    return (
      <>
        <Head>
          <title>Link Non Valido - Women in Net</title>
          <meta name="description" content="Link di reset password non valido" />
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
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
                  <h1>Link Non Valido</h1>
                  <p>Il link di reset password non è valido o è scaduto.</p>
                </div>

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <div style={{ textAlign: 'center' }}>
                  <Link href="/forgot-password" className="btn btn-primary" style={{ marginBottom: '1rem', width: '100%' }}>
                    🔐 Richiedi Nuovo Reset
                  </Link>
                  
                  <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                    🔙 Torna al Login
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    )
  }

  // Successo
  if (isSuccess) {
    return (
      <>
        <Head>
          <title>Password Aggiornata - Women in Net</title>
          <meta name="description" content="Password aggiornata con successo" />
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
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                  <h1>Password Aggiornata!</h1>
                  <p>La tua password è stata aggiornata con successo.</p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>
                    Sarai reindirizzata automaticamente al login tra pochi secondi...
                  </p>
                  <div style={{ fontSize: '2rem' }}>🎾</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                    🚀 Vai al Login
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    )
  }

  // Form reset password
  return (
    <>
      <Head>
        <title>Nuova Password - Women in Net</title>
        <meta name="description" content="Imposta la tua nuova password" />
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
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                <h1>Imposta Nuova Password</h1>
                <p>Scegli una password sicura per il tuo account</p>
                <small style={{ color: 'var(--gray-500)' }}>
                  Account: {email}
                </small>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Nuova Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Inserisci la nuova password"
                    required
                    disabled={isLoading}
                  />
                  <small style={{ color: 'var(--gray-600)', fontSize: '0.75rem' }}>
                    Almeno 8 caratteri con maiuscole, minuscole e numeri
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Conferma Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Conferma la nuova password"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {isLoading ? '⏳ Aggiornamento...' : '🔐 Aggiorna Password'}
                </button>
              </form>

              <div className={styles.authFooter}>
                <p>
                  Ti sei ricordata la password?{' '}
                  <Link href="/login" className={styles.authLink}>
                    Torna al Login
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