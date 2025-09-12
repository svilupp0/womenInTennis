// pages/calendar.js
// Pagina calendario per gestire disponibilità

import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Calendar from '../components/Calendar'
import styles from '../styles/CalendarPage.module.css'
import calendarStyles from '../styles/Calendar.module.css'

export default function CalendarPage() {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    logout,
    getDisplayName,
    isAdmin
  } = useAuth()

  // Redirect se non autenticato o se admin
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      window.location.href = '/login'
    } else if (!loading && isAuthenticated() && isAdmin()) {
      // Redirect admin alla dashboard admin
      window.location.href = '/admin'
    }
  }, [loading, isAuthenticated, isAdmin])

  // Logout con conferma
  const handleLogout = () => {
    if (confirm('Sei sicura di voler uscire?')) {
      logout()
      window.location.href = '/'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingContent}>
          ⏳ Caricamento calendario...
        </div>
      </div>
    )
  }

  // Non autenticato
  if (!isAuthenticated()) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorContent}>
          🔒 Accesso non autorizzato. Reindirizzamento...
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Calendario - Women in Tennis</title>
        <meta name="description" content="Gestisci le tue disponibilità e organizza partite di tennis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.calendarPage}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div className="container">
            <div className={styles.headerContent}>
              <Link href="/dashboard" className={styles.logo}>
                <div className={styles.logoIcon}>🎾</div>
                <span>Women in Tennis</span>
              </Link>
              
              <nav className={styles.navigation}>
                <Link href="/dashboard" className={styles.navLink}>
                  🏠 Dashboard
                </Link>
                <Link href="/calendar" className={`${styles.navLink} ${styles.active}`}>
                  📅 Calendario
                </Link>
              </nav>
              
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{getDisplayName()}</span>
                  <span className={styles.userEmail}>{user?.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-xs) var(--space-md)', fontSize: '0.875rem' }}
                >
                  Esci
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className="container">
            {/* Istruzioni */}
            <section className={styles.instructionsSection}>
              <div className={styles.instructionsCard}>
                <h2>📅 Come Funziona il Calendario</h2>
                <div className={styles.instructionsList}>
                  <div className={styles.instructionItem}>
                    <span className={styles.instructionIcon}>📅</span>
                    <div>
                      <strong>Clicca su una data</strong> per creare una nuova disponibilità
                    </div>
                  </div>
                  <div className={styles.instructionItem}>
                    <span className={styles.instructionIcon}>🎾</span>
                    <div>
                      <strong>Clicca su un evento</strong> per vedere i dettagli o eliminarlo
                    </div>
                  </div>
                  <div className={styles.instructionItem}>
                    <span className={styles.instructionIcon}>🔵</span>
                    <div>
                      <strong>Eventi blu</strong> sono le tue disponibilità visibili ad altre giocatrici
                    </div>
                  </div>
                  <div className={styles.instructionItem}>
                    <span className={styles.instructionIcon}>🟡</span>
                    <div>
                      <strong>Eventi gialli</strong> hanno ricevuto una proposta di partita
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Calendario */}
            <section className={styles.calendarSection}>
              <Calendar />
            </section>

            {/* Tips */}
            <section className={styles.tipsSection}>
              <div className={styles.tipsCard}>
                <h3>💡 Suggerimenti</h3>
                <ul className={styles.tipsList}>
                  <li>Crea disponibilità regolari per essere più visibile</li>
                  <li>Specifica sempre il luogo dove preferisci giocare</li>
                  <li>Aggiungi note per comunicare il tuo livello o preferenze</li>
                  <li>Controlla regolarmente le proposte ricevute</li>
                  <li>Elimina le disponibilità se non puoi più giocare</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}