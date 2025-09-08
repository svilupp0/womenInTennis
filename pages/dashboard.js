import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    logout,
    getDisplayName,
    getUserLevel,
    getUserLocation,
    isAvailable
  } = useAuth()

  const [availability, setAvailability] = useState(false)

  // Redirect se non autenticato
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      window.location.href = '/login'
    }
  }, [loading, isAuthenticated])

  // Imposta disponibilità iniziale
  useEffect(() => {
    if (user) {
      setAvailability(isAvailable())
    }
  }, [user, isAvailable])

  // Toggle disponibilità
  const handleAvailabilityToggle = async () => {
    // TODO: Implementare API call per aggiornare disponibilità
    setAvailability(!availability)
  }

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
      <div className={styles.dashboardPage}>
        <div className={styles.loading}>
          ⏳ Caricamento dashboard...
        </div>
      </div>
    )
  }

  // Non autenticato
  if (!isAuthenticated()) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.error}>
          🔒 Accesso non autorizzato. Reindirizzamento...
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - Women in Tennis</title>
        <meta name="description" content="La tua dashboard personale per trovare partner di tennis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.dashboardPage}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <div className={styles.headerContent}>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoIcon}>🎾</div>
                <span>Women in Tennis</span>
              </Link>
              
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
            {/* Welcome Section */}
            <section className={styles.welcomeSection}>
              <div className={styles.welcomeCard}>
                <h1 className={styles.welcomeTitle}>
                  Benvenuta, {getDisplayName()}! 🎾
                </h1>
                <p className={styles.welcomeSubtitle}>
                  Pronta per trovare nuove partner di tennis nella tua zona?
                </p>
                
                {/* Quick Stats */}
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>0</span>
                    <span className={styles.statLabel}>Match Attivi</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>0</span>
                    <span className={styles.statLabel}>Partner Trovate</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>0</span>
                    <span className={styles.statLabel}>Partite Giocate</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{getUserLevel()}</span>
                    <span className={styles.statLabel}>Livello</span>
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className={styles.availabilityToggle}>
                  <span className={styles.toggleLabel}>Disponibile per giocare:</span>
                  <div 
                    className={`${styles.toggle} ${availability ? styles.active : ''}`}
                    onClick={handleAvailabilityToggle}
                  >
                    <div className={styles.toggleSlider}></div>
                  </div>
                  <span style={{ color: availability ? 'var(--primary-green)' : 'var(--gray-500)' }}>
                    {availability ? '✅ Sì' : '❌ No'}
                  </span>
                </div>
              </div>
            </section>

            {/* Dashboard Grid */}
            <section className={styles.dashboardGrid}>
              {/* Profilo */}
              <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>👤</div>
                  <h2 className={styles.cardTitle}>Il Mio Profilo</h2>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.profileInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Email:</span>
                      <span className={styles.infoValue}>{user?.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Comune:</span>
                      <span className={styles.infoValue}>{getUserLocation()}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Livello:</span>
                      <span className={styles.infoValue}>{getUserLevel()}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Membro dal:</span>
                      <span className={styles.infoValue}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <button className="btn btn-primary">
                      ✏️ Modifica Profilo
                    </button>
                  </div>
                </div>
              </div>

              {/* Cerca Partner */}
              <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>🔍</div>
                  <h2 className={styles.cardTitle}>Cerca Partner</h2>
                </div>
                <div className={styles.cardContent}>
                  <p>Trova tenniste nella tua zona con il tuo stesso livello di gioco.</p>
                  <div className={styles.actionButtons}>
                    <button className="btn btn-primary">
                      🎾 Inizia Ricerca
                    </button>
                    <button className="btn btn-secondary">
                      📍 Filtri Avanzati
                    </button>
                  </div>
                </div>
              </div>

              {/* I Miei Match */}
              <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>💬</div>
                  <h2 className={styles.cardTitle}>I Miei Match</h2>
                </div>
                <div className={styles.cardContent}>
                  <p>Gestisci le tue connessioni e organizza partite con le tue partner.</p>
                  <div className={styles.actionButtons}>
                    <button className="btn btn-accent">
                      📋 Vedi Match
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}