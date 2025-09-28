import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Auth.module.css'

export default function VerifyEmail() {
  const router = useRouter()
  const { token, email } = router.query
  
  const [status, setStatus] = useState('loading') // loading, success, error, already_verified
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (token && email) {
      verifyEmail(token, email)
    }
  }, [token, email])

  const verifyEmail = async (verificationToken, userEmail) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()

      if (response.ok) {
        if (data.code === 'ALREADY_VERIFIED') {
          setStatus('already_verified')
          setMessage('Email già verificata! Puoi fare login.')
        } else {
          setStatus('success')
          setMessage('Email verificata con successo! Ora puoi fare login.')
        }
      } else {
        setStatus('error')
        if (data.code === 'TOKEN_EXPIRED') {
          setMessage('Il link di verifica è scaduto. Puoi richiedere un nuovo link qui sotto.')
        } else if (data.code === 'INVALID_TOKEN') {
          setMessage('Link di verifica non valido.')
        } else if (data.code === 'USER_NOT_FOUND') {
          setMessage('Utente non trovato.')
        } else {
          setMessage(data.error || 'Errore durante la verifica.')
        }
      }
    } catch (error) {
      console.error('Errore verifica email:', error)
      setStatus('error')
      setMessage('Errore di connessione. Riprova più tardi.')
    }
  }

  const resendVerification = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Nuova email di verifica inviata! Controlla la tua casella di posta.')
        setStatus('success')
      } else {
        setMessage(data.error || 'Errore nell\'invio dell\'email.')
      }
    } catch (error) {
      console.error('Errore reinvio:', error)
      setMessage('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳'
      case 'success':
      case 'already_verified':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '📧'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'already_verified':
        return '#4caf50'
      case 'error':
        return '#f44336'
      default:
        return '#2c5530'
    }
  }

  return (
    <>
      <Head>
        <title>Verifica Email - Women in Net</title>
        <meta name="description" content="Verifica la tua email per completare la registrazione" />
      </Head>

      <div className={styles.container}>
        <div className={styles.authBox}>
          <div className={styles.header}>
            <h1>🎾 Women in Net</h1>
            <h2>Verifica Email</h2>
          </div>

          <div className={styles.content}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                {getStatusIcon()}
              </div>
              
              <h3 style={{ color: getStatusColor(), marginBottom: '15px' }}>
                {status === 'loading' && 'Verifica in corso...'}
                {status === 'success' && 'Verifica completata!'}
                {status === 'already_verified' && 'Email già verificata!'}
                {status === 'error' && 'Errore di verifica'}
              </h3>
              
              <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {message}
              </p>
            </div>

            {(status === 'success' || status === 'already_verified') && (
              <div style={{ textAlign: 'center' }}>
                <Link href="/login" className={styles.button}>
                  🚀 Vai al Login
                </Link>
                <Link href="/dashboard" className={styles.linkButton}>
                  📊 Dashboard
                </Link>
              </div>
            )}

            {status === 'error' && email && (
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={resendVerification}
                  disabled={isResending}
                  className={styles.button}
                  style={{ marginBottom: '15px' }}
                >
                  {isResending ? '📤 Invio...' : '📧 Invia Nuovo Link'}
                </button>
                
                <div>
                  <Link href="/login" className={styles.linkButton}>
                    🔙 Torna al Login
                  </Link>
                  <Link href="/register" className={styles.linkButton}>
                    📝 Nuova Registrazione
                  </Link>
                </div>
              </div>
            )}

            {!token && !email && (
              <div style={{ textAlign: 'center' }}>
                <p>Link di verifica non valido o mancante.</p>
                <Link href="/login" className={styles.button}>
                  🔙 Torna al Login
                </Link>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <p>
              Problemi con la verifica?{' '}
              <Link href="/register">Registrati di nuovo</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}