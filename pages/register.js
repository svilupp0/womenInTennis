import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Auth.module.css'

export default function Register() {
  const { registerAndRedirect, resendVerification, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    comune: '',
    livello: '',
    telefono: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setIsLoading(false)
      return
    }

    try {
      // Prepara dati per registrazione
      const userData = {
        email: formData.email,
        password: formData.password,
        comune: formData.comune,
        livello: formData.livello,
        telefono: formData.telefono
      }

      // Usa il hook useAuth per registrazione
      const result = await registerAndRedirect(userData, '/dashboard')

      if (result.success) {
        if (result.requiresEmailVerification) {
          // Mostra schermata verifica email
          setRegisteredEmail(formData.email)
          setShowEmailVerification(true)
          setSuccess(result.message)
        }
        // Se non richiede verifica, il redirect è automatico
      } else {
        setError(result.error || 'Errore durante la registrazione')
      }
    } catch (error) {
      console.error('Errore registrazione:', error)
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    setError('')
    setSuccess('')

    try {
      const result = await resendVerification(registeredEmail)
      
      if (result.success) {
        setSuccess(result.message)
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

  // Schermata verifica email
  if (showEmailVerification) {
    return (
      <>
        <Head>
          <title>Verifica Email - Women in Net</title>
          <meta name="description" content="Verifica la tua email per completare la registrazione" />
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
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
                  <h1>Controlla la tua email!</h1>
                  <p>Abbiamo inviato un link di verifica a <strong>{registeredEmail}</strong></p>
                </div>

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className={styles.successMessage}>
                    {success}
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--gray-700)' }}>
                    Prossimi passi:
                  </h3>
                  <ol style={{ textAlign: 'left', color: 'var(--gray-600)', lineHeight: '1.8' }}>
                    <li>Controlla la tua casella di posta elettronica</li>
                    <li>Clicca sul link di verifica nell'email</li>
                    <li>Torna qui per fare login</li>
                  </ol>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="btn btn-secondary"
                    style={{ marginBottom: '1rem', width: '100%' }}
                  >
                    {isResending ? '📤 Invio...' : '📧 Reinvia Email'}
                  </button>

                  <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                    🚀 Vai al Login
                  </Link>
                </div>

                <div className={styles.authFooter}>
                  <p>
                    Non hai ricevuto l'email? Controlla la cartella spam o{' '}
                    <button 
                      onClick={handleResendVerification}
                      disabled={isResending}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--primary-green)', 
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      richiedi un nuovo invio
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    )
  }

  // Form di registrazione normale
  return (
    <>
      <Head>
        <title>Registrati - Women in Net</title>
        <meta name="description" content="Registrati a Women in Net e trova la tua partner di tennis ideale" />
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
                <h1>Unisciti alla community</h1>
                <p>Crea il tuo account e inizia a trovare partner di net nella tua zona</p>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              {success && (
                <div className={styles.successMessage}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
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
                  <label htmlFor="password">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Almeno 6 caratteri"
                      required
                      minLength={6}
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: 'var(--gray-500)',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Conferma Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ripeti la password"
                      required
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        color: 'var(--gray-500)',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      aria-label={showConfirmPassword ? 'Nascondi conferma password' : 'Mostra conferma password'}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="comune">Comune</label>
                  <input
                    type="text"
                    id="comune"
                    name="comune"
                    value={formData.comune}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Es. Milano, Roma, Napoli..."
                    autocomplete="address-level2"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="livello">Livello di gioco</label>
                  <select
                    id="livello"
                    name="livello"
                    value={formData.livello}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Seleziona il tuo livello</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzato">Avanzato</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="telefono">Telefono (opzionale)</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Es. +39 123 456 7890"
                    autocomplete="tel"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || authLoading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {(isLoading || authLoading) ? '⏳ Registrazione...' : '🚀 Crea Account'}
                </button>
              </form>

              <div className={styles.authFooter}>
                <p>
                  Hai già un account?{' '}
                  <Link href="/login" className={styles.authLink}>
                    Accedi qui
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