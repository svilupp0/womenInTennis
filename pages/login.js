import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import styles from '../styles/Auth.module.css'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
    if (!formData.email || !formData.password) {
      setError('Email e password sono obbligatori')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to dashboard on success
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Errore durante il login')
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
        <title>Accedi - Women in Tennis</title>
        <meta name="description" content="Accedi al tuo account Women in Tennis" />
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
                <h1>Bentornata!</h1>
                <p>Accedi al tuo account per trovare nuove partner di tennis</p>
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
                  disabled={isLoading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {isLoading ? '⏳ Accesso...' : '🚀 Accedi'}
                </button>
              </form>

              <div className={styles.authFooter}>
                <p>
                  Non hai ancora un account?{' '}
                  <Link href="/register" className={styles.authLink}>
                    Registrati qui
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