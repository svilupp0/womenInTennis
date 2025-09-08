import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import styles from '../styles/Auth.module.css'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    comune: '',
    livello: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          comune: formData.comune,
          livello: formData.livello
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Registrazione completata! Ora puoi accedere.')
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          comune: '',
          livello: ''
        })
      } else {
        setError(data.error || 'Errore durante la registrazione')
      }
    } catch (error) {
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Registrati - Women in Tennis</title>
        <meta name="description" content="Registrati a Women in Tennis e trova la tua partner di tennis ideale" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.authPage}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>🎾</div>
              <span>Women in Tennis</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className="container">
            <div className={styles.authCard}>
              <div className={styles.authHeader}>
                <h1>Unisciti alla community</h1>
                <p>Crea il tuo account e inizia a trovare partner di tennis nella tua zona</p>
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
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Almeno 6 caratteri"
                    required
                    minLength={6}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Conferma Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ripeti la password"
                    required
                  />
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

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {isLoading ? '⏳ Registrazione...' : '🚀 Crea Account'}
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