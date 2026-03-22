import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '../hooks/useAuth'
import { useAvailability } from '../hooks/useAvailability'
import { usePlayerSearch } from '../hooks/usePlayerSearch'
import { useProfileEditor } from '../hooks/useProfileEditor'
import { useReports } from '../hooks/useReports'
import ProfileCard from '../components/dashboard/ProfileCard'
import SearchFilters from '../components/dashboard/SearchFilters'
import PlayerList from '../components/dashboard/PlayerList'
import { isMobileDevice } from '../utils/displayNameUtils'
import PWAInstallManager from '../lib/pwaInstallManager'
import styles from '../styles/Dashboard.module.css'

// ⚡ PERFORMANCE: Lazy loading componenti pesanti
// Caricati solo quando mostrati (modali, calendario)
const Calendar = dynamic(() => import('../components/Calendar'), {
  loading: () => (
    <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Caricamento calendario...</div>
  ),
  ssr: false, // Calendario non necessario in SSR
})

const ProfileEditForm = dynamic(() => import('../components/dashboard/ProfileEditForm'), {
  loading: () => <div style={{ textAlign: 'center', padding: '1rem' }}>⏳ Caricamento...</div>,
})

const ReportModal = dynamic(() => import('../components/dashboard/ReportModal'), {
  loading: () => <div>⏳ Caricamento...</div>,
})

const MyReportsList = dynamic(() => import('../components/dashboard/MyReportsList'), {
  loading: () => (
    <div style={{ textAlign: 'center', padding: '1rem' }}>⏳ Caricamento segnalazioni...</div>
  ),
})

export default function Dashboard() {
  const {
    user,
    loading,
    isAuthenticated,
    logout,
    getDisplayName,
    getUserLevel,
    getUserLocation,
    getUserSportsDisplay,
    isAdmin,
    updateUser,
  } = useAuth()

  // Hook disponibilità
  const {
    availability,
    toggleAvailability,
    isUpdating: isUpdatingAvailability,
    error: availabilityError,
    isSynced,
  } = useAvailability()

  // Hook ricerca giocatori
  const { searchFilters, handleFilterChange, searchResults, isSearching, comuniDisponibili } =
    usePlayerSearch(user)

  // Hook modifica profilo
  const {
    editProfileForm,
    showEditProfile,
    isUpdatingProfile,
    profileUpdateError,
    handleProfileFormChange,
    addSportLevel,
    removeSportLevel,
    saveProfileChanges,
    cancelProfileEdit,
    setShowEditProfile,
  } = useProfileEditor(user, updateUser)

  // Hook segnalazioni
  const {
    showReportModal,
    reportTarget,
    reportForm,
    isSubmittingReport,
    showMyReports,
    myReports,
    isLoadingReports,
    handleReportUser,
    handleReportFormChange,
    submitReport,
    closeReportModal,
    toggleMyReports,
    closeMyReports,
  } = useReports()

  // Stati UI locali
  const [isMobile, setIsMobile] = useState(false)

  // Redirect se non autenticato o admin
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      window.location.href = '/login'
    } else if (!loading && isAuthenticated() && isAdmin()) {
      window.location.href = '/admin'
    }
  }, [loading, isAuthenticated, isAdmin])

  // Rileva dispositivo mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice())
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Inizializza PWA Install Manager
  useEffect(() => {
    if (isAuthenticated() && !loading) {
      const pwaManager = new PWAInstallManager({
        promptVersion: 'v1.0.4',
        delayBeforeShow: 2000,
      })
      window.pwaManager = pwaManager
    }
  }, [isAuthenticated, loading])

  // Gestione errori disponibilità
  useEffect(() => {
    if (availabilityError) {
      console.error('Errore disponibilità:', availabilityError)
    }
  }, [availabilityError])

  // Logout con conferma
  const handleLogout = () => {
    if (confirm('Sei sicura di voler uscire?')) {
      logout()
      window.location.href = '/'
    }
  }

  // Funzioni contatto giocatori
  const handleWhatsApp = (player) => {
    if (player.telefono) {
      const message = encodeURIComponent(
        `Ciao! Ho visto il tuo profilo su Women in Net e mi piacerebbe giocare insieme. Quando sei disponibile?`
      )
      window.open(
        `https://wa.me/${player.telefono.replace(/[^0-9]/g, '')}?text=${message}`,
        '_blank'
      )
    }
  }

  const handleCall = (player) => {
    if (player.telefono) {
      window.location.href = `tel:${player.telefono}`
    }
  }

  const handleEmail = (player) => {
    const subject = encodeURIComponent('Partner Tennis - Women in Net')
    const body = encodeURIComponent(
      `Ciao ${player.email.split('@')[0]}!\n\nHo visto il tuo profilo su Women in Net e mi piacerebbe giocare insieme.\n\nSono di ${getUserLocation()} e il mio livello è ${getUserLevel()}.\n\nQuando sei disponibile per una partita?\n\nGrazie!`
    )
    window.location.href = `mailto:${player.email}?subject=${subject}&body=${body}`
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.loading}>⏳ Caricamento dashboard...</div>
      </div>
    )
  }

  // Non autenticato
  if (!isAuthenticated()) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.error}>🔒 Accesso non autorizzato. Reindirizzamento...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - Women in Net</title>
        <meta
          name="description"
          content="La tua dashboard personale per trovare partner di tennis"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.dashboardPage}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <div className={styles.headerContent}>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoIcon}>🎾</div>
                <span>Women in Net</span>
              </Link>

              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{getDisplayName()}</span>
                  <span className={styles.userEmail}>{user?.email}</span>
                </div>
                <div className={styles.headerActions}>
                  <Link
                    href="/map"
                    className="btn btn-accent"
                    style={{ padding: 'var(--space-xs) var(--space-md)', fontSize: '0.875rem' }}
                  >
                    🗺️ Mappa
                  </Link>
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
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className="container">
            {/* Profilo utente */}
            <ProfileCard
              displayName={getDisplayName()}
              location={getUserLocation()}
              sportsDisplay={getUserSportsDisplay()}
              availability={availability}
              isUpdatingAvailability={isUpdatingAvailability}
              isSynced={isSynced}
              isMobile={isMobile}
              onToggleAvailability={toggleAvailability}
              onEditProfile={() => setShowEditProfile(true)}
              onShowReports={toggleMyReports}
            />

            {/* Form Modifica Profilo */}
            {showEditProfile && (
              <ProfileEditForm
                formData={editProfileForm}
                isUpdating={isUpdatingProfile}
                error={profileUpdateError}
                onChange={handleProfileFormChange}
                onAddSportLevel={addSportLevel}
                onRemoveSportLevel={removeSportLevel}
                onSave={saveProfileChanges}
                onCancel={cancelProfileEdit}
              />
            )}

            {/* Filtri + Risultati | Calendario */}
            <section className={styles.row2Section}>
              <div className={styles.row2Grid}>
                {/* Colonna 1: Filtri di ricerca + Risultati giocatrici */}
                <div className={styles.filtersColumn}>
                  <SearchFilters
                    filters={searchFilters}
                    comuniDisponibili={comuniDisponibili}
                    onFilterChange={handleFilterChange}
                  />

                  <PlayerList
                    players={searchResults}
                    isSearching={isSearching}
                    onWhatsApp={handleWhatsApp}
                    onCall={handleCall}
                    onEmail={handleEmail}
                    onReport={handleReportUser}
                  />
                </div>

                {/* Colonna 2: Calendario */}
                <div className={styles.calendarColumn}>
                  <div className={styles.calendarCard}>
                    <h2 className={styles.calendarTitle}>📅 Le Mie Disponibilità</h2>
                    <Calendar />
                  </div>
                </div>
              </div>
            </section>

            {/* Lista segnalazioni */}
            <MyReportsList
              show={showMyReports}
              reports={myReports}
              isLoading={isLoadingReports}
              onClose={closeMyReports}
            />
          </div>
        </main>

        {/* Modal Segnalazione */}
        <ReportModal
          show={showReportModal}
          targetUser={reportTarget}
          formData={reportForm}
          isSubmitting={isSubmittingReport}
          onChange={handleReportFormChange}
          onSubmit={submitReport}
          onClose={closeReportModal}
        />
      </div>
    </>
  )
}
