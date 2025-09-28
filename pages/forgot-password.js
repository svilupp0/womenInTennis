import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import styles from '../styles/Auth.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // Validazione client-side
    if (!email.trim()) {
      setError('Email è obbligatoria')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Inserisci un indirizzo email valido')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message)
        setEmail('') // Pulisci il form
      } else {
        setError(data.error || 'Errore durante la richiesta')
      }
    } catch (error) {
      console.error('Errore richiesta reset:', error)
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    // Pulisci errori quando l'utente inizia a digitare
    if (error) setError('')
    if (message) setMessage('')
  }

  return (
    <>
      <Head>
        <title>Password Dimenticata - Women in Net</title>
        <meta name="description" content="Recupera la tua password per Women in Net" />
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
              {!isSuccess ? (
                <>
                  <div className={styles.authHeader}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                    <h1>Password Dimenticata?</h1>
                    <p>Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password</p>
                  </div>

                  {error && (
                    <div className={styles.errorMessage}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Indirizzo Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="la.tua.email@esempio.com"
                        required
                        disabled={isLoading}
                      />
                      <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        Inserisci l'email associata al tuo account
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                      style={{ width: '100%', marginTop: '1rem' }}
                    >
                      {isLoading ? '📤 Invio...' : '🔐 Invia Istruzioni Reset'}
                    </button>
                  </form>

                  <div className={styles.authFooter}>
                    <p>
                      Ti sei ricordata la password?{' '}
                      <Link href="/login" className={styles.authLink}>
                        Torna al Login
                      </Link>
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                      Non hai ancora un account?{' '}
                      <Link href="/register" className={styles.authLink}>
                        Registrati qui
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.authHeader}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
                    <h1>Email Inviata!</h1>
                    <p>{message}</p>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>
                      Prossimi passi:
                    </h3>
                    <ol style={{ textAlign: 'left', color: 'var(--gray-600)', lineHeight: '1.8' }}>
                      <li>Controlla la tua casella di posta elettronica</li>
                      <li>Cerca l'email da Women in Net (controlla anche lo spam)</li>
                      <li>Clicca sul link "Reset Password" nell'email</li>
                      <li>Imposta la tua nuova password</li>
                      <li>Torna qui per fare login</li>
                    </ol>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <Link href="/login" className="btn btn-primary" style={{ marginBottom: '1rem', width: '100%' }}>
                      🔙 Torna al Login
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsSuccess(false)
                        setMessage('')
                        setEmail('')
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      📤 Invia di Nuovo
                    </button>
                  </div>

                  <div className={styles.authFooter}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                      ⏰ Il link di reset scadrà tra 1 ora per motivi di sicurezza
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}