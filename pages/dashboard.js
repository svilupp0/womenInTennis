import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Calendar from '../components/Calendar'
import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const { 
    user, 
    token,
    loading, 
    isAuthenticated, 
    logout,
    getDisplayName,
    getUserLevel,
    getUserLocation,
    isAvailable,
    isAdmin
  } = useAuth()

  const [availability, setAvailability] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    comune: '',
    livello: '',
    disponibilita: true
  })
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [openContactMenu, setOpenContactMenu] = useState(null)
  const [comuniDisponibili, setComuniDisponibili] = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)
  const [reportForm, setReportForm] = useState({ reason: '', description: '' })
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [showMyReports, setShowMyReports] = useState(false)
  const [myReports, setMyReports] = useState([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)

  // Redirect se non autenticato o se admin
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      window.location.href = '/login'
    } else if (!loading && isAuthenticated() && isAdmin()) {
      // Redirect admin alla dashboard admin
      window.location.href = '/admin'
    }
  }, [loading, isAuthenticated, isAdmin])

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

  // Gestione filtri ricerca
  const handleFilterChange = (filterName, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  // Carica comuni disponibili
  const loadComuniDisponibili = async () => {
    try {
      const response = await fetch('/api/comuni/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setComuniDisponibili(data.comuni || [])
      } else {
        console.error('Errore caricamento comuni:', response.statusText)
        setComuniDisponibili([])
      }
    } catch (error) {
      console.error('Errore caricamento comuni:', error)
      setComuniDisponibili([])
    }
  }

  // Ricerca giocatrici
  const searchPlayers = async () => {
    setIsSearching(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchFilters.comune) queryParams.append('comune', searchFilters.comune)
      if (searchFilters.livello) queryParams.append('livello', searchFilters.livello)
      if (searchFilters.disponibilita) queryParams.append('disponibilita', 'true')

      const response = await fetch(`/api/users/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      } else {
        console.error('Errore ricerca:', response.statusText)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Errore ricerca:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Carica comuni disponibili quando il componente si monta
  useEffect(() => {
    if (user && token) {
      loadComuniDisponibili()
    }
  }, [user, token])

  // Ricerca automatica quando cambiano i filtri
  useEffect(() => {
    if (user && token) {
      searchPlayers()
    }
  }, [searchFilters, user, token])

  // Gestione menu contatti
  const toggleContactMenu = (playerId) => {
    setOpenContactMenu(openContactMenu === playerId ? null : playerId)
  }

  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenContactMenu(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Funzioni di contatto
  const handleWhatsApp = (player) => {
    if (player.telefono) {
      const message = encodeURIComponent(`Ciao! Ho visto il tuo profilo su Women in Tennis e mi piacerebbe giocare insieme. Quando sei disponibile?`)
      window.open(`https://wa.me/${player.telefono.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
    }
    setOpenContactMenu(null)
  }

  const handleCall = (player) => {
    if (player.telefono) {
      window.location.href = `tel:${player.telefono}`
    }
    setOpenContactMenu(null)
  }

  const handleEmail = (player) => {
    const subject = encodeURIComponent('Partner Tennis - Women in Tennis')
    const body = encodeURIComponent(`Ciao ${player.email.split('@')[0]}!\n\nHo visto il tuo profilo su Women in Tennis e mi piacerebbe giocare insieme.\n\nSono di ${getUserLocation()} e il mio livello è ${getUserLevel()}.\n\nQuando sei disponibile per una partita?\n\nGrazie!`)
    window.location.href = `mailto:${player.email}?subject=${subject}&body=${body}`
    setOpenContactMenu(null)
  }

  // Gestione segnalazioni
  const handleReportUser = (player) => {
    setReportTarget(player)
    setReportForm({ reason: '', description: '' })
    setShowReportModal(true)
    setOpenContactMenu(null)
  }

  const handleReportFormChange = (field, value) => {
    setReportForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const submitReport = async () => {
    if (!reportForm.reason) {
      alert('Seleziona un motivo per la segnalazione')
      return
    }

    setIsSubmittingReport(true)
    try {
      const response = await fetch('/api/reports/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportedId: reportTarget.id,
          reason: reportForm.reason,
          description: reportForm.description
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Segnalazione inviata con successo')
        setShowReportModal(false)
        setReportTarget(null)
        setReportForm({ reason: '', description: '' })
      } else {
        alert(data.error || 'Errore durante l\'invio della segnalazione')
      }
    } catch (error) {
      console.error('Errore invio segnalazione:', error)
      alert('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const loadMyReports = async () => {
    setIsLoadingReports(true)
    try {
      const response = await fetch('/api/reports/my?type=given', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMyReports(data.reports || [])
      } else {
        console.error('Errore caricamento segnalazioni:', response.statusText)
        setMyReports([])
      }
    } catch (error) {
      console.error('Errore caricamento segnalazioni:', error)
      setMyReports([])
    } finally {
      setIsLoadingReports(false)
    }
  }

  const toggleMyReports = () => {
    if (!showMyReports) {
      loadMyReports()
    }
    setShowMyReports(!showMyReports)
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
            {/* 1. Header / Profilo utente */}
            <section className={styles.profileSection}>
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                      {getDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.profileInfo}>
                      <h1 className={styles.profileName}>{getDisplayName()}</h1>
                      <p className={styles.profileDetails}>
                        📍 {getUserLocation()} • 🎾 {getUserLevel()}
                      </p>
                    </div>
                  </div>
                  <div className={styles.profileActions}>
                    <div className={styles.availabilityToggle}>
                      <span className={styles.toggleLabel}>Disponibile:</span>
                      <div 
                        className={`${styles.toggle} ${availability ? styles.active : ''}`}
                        onClick={handleAvailabilityToggle}
                      >
                        <div className={styles.toggleSlider}></div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowEditProfile(!showEditProfile)}
                    >
                      ✏️ Modifica Profilo
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={toggleMyReports}
                    >
                      📄 Le mie segnalazioni
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGA 2: Filtri + Risultati | Calendario */}
            <section className={styles.row2Section}>
              <div className={styles.row2Grid}>
                {/* Colonna 1: Filtri di ricerca + Risultati giocatrici */}
                <div className={styles.filtersColumn}>
                  {/* Filtri di ricerca */}
                  <div className={styles.filtersCard}>
                    <h2 className={styles.filtersTitle}>🔍 Trova Partner di Tennis</h2>
                    <div className={styles.filtersGrid}>
                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Comune:</label>
                        <select 
                          className="form-input"
                          value={searchFilters.comune}
                          onChange={(e) => handleFilterChange('comune', e.target.value)}
                        >
                          <option value="">Tutti i comuni</option>
                          {comuniDisponibili.map((comune) => (
                            <option key={comune.nome} value={comune.nome}>
                              {comune.nome} ({comune.count} giocatrici)
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Livello:</label>
                        <select 
                          className="form-input"
                          value={searchFilters.livello}
                          onChange={(e) => handleFilterChange('livello', e.target.value)}
                        >
                          <option value="">Tutti i livelli</option>
                          <option value="Principiante">Principiante</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzato">Avanzato</option>
                        </select>
                      </div>
                      
                      <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Solo disponibili:</label>
                        <div className={styles.checkboxWrapper}>
                          <input 
                            type="checkbox"
                            checked={searchFilters.disponibilita}
                            onChange={(e) => handleFilterChange('disponibilita', e.target.checked)}
                            className={styles.checkbox}
                          />
                          <span>Mostra solo giocatrici disponibili</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risultati giocatrici */}
                  <div className={styles.playersCard}>
                    <div className={styles.playersHeader}>
                      <h2>🎾 Giocatrici Disponibili ({searchResults.length})</h2>
                      {isSearching && <span className={styles.searchingIndicator}>🔄 Ricerca...</span>}
                    </div>
                    
                    <div className={styles.playersListContainer}>
                      {searchResults.length === 0 && !isSearching ? (
                        <div className={styles.noResults}>
                          <p>🎾 Nessuna giocatrice trovata con questi filtri.</p>
                          <p>Prova a modificare i criteri di ricerca!</p>
                        </div>
                      ) : (
                        <div className={styles.playersList}>
                          {searchResults.map((player) => (
                            <div key={player.id} className={styles.playerCard}>
                              <div className={styles.playerHeader}>
                                <div className={styles.playerAvatar}>
                                  {player.email.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.playerInfo}>
                                  <h3 className={styles.playerName}>
                                    {player.email.split('@')[0]}
                                  </h3>
                                  <p className={styles.playerDetails}>
                                    📍 {player.comune || 'Non specificato'} • 🎾 {player.livello || 'Non specificato'}
                                  </p>
                                  <div className={styles.playerStatus}>
                                    {player.disponibilita ? (
                                      <span className={styles.available}>✅ Disponibile</span>
                                    ) : (
                                      <span className={styles.unavailable}>❌ Non disponibile</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className={styles.playerActions}>
                                <div className={styles.contactDropdown}>
                                  <button 
                                    className="btn btn-primary"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleContactMenu(player.id)
                                    }}
                                  >
                                    💬 Contatta
                                  </button>
                                  {openContactMenu === player.id && (
                                    <div className={styles.contactMenu}>
                                      {player.telefono && (
                                        <>
                                          <button 
                                            className={styles.contactOption}
                                            onClick={() => handleWhatsApp(player)}
                                          >
                                            📱 WhatsApp
                                          </button>
                                          <button 
                                            className={styles.contactOption}
                                            onClick={() => handleCall(player)}
                                          >
                                            📞 Chiamata
                                          </button>
                                        </>
                                      )}
                                      <button 
                                        className={styles.contactOption}
                                        onClick={() => handleEmail(player)}
                                      >
                                        ✉️ Email
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <button 
                                  className="btn btn-warning"
                                  onClick={() => handleReportUser(player)}
                                >
                                  🚨 Segnala
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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

            {/* 4. Lista delle mie segnalazioni */}
            {showMyReports && (
              <section className={styles.reportsSection}>
                <div className={styles.reportsCard}>
                  <div className={styles.reportsHeader}>
                    <h2>📄 Le mie segnalazioni</h2>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowMyReports(false)}
                    >
                      ✕ Chiudi
                    </button>
                  </div>
                  
                  {isLoadingReports ? (
                    <div className={styles.loading}>⏳ Caricamento segnalazioni...</div>
                  ) : myReports.length === 0 ? (
                    <div className={styles.noReports}>
                      <p>📝 Non hai ancora fatto nessuna segnalazione.</p>
                    </div>
                  ) : (
                    <div className={styles.reportsList}>
                      {myReports.map((report) => (
                        <div key={report.id} className={styles.reportItem}>
                          <div className={styles.reportHeader}>
                            <span className={styles.reportUser}>
                              👤 {report.reported.username}
                            </span>
                            <span className={`${styles.reportStatus} ${styles[report.status.toLowerCase()]}`}>
                              {report.status === 'PENDING' && '⏳ In attesa'}
                              {report.status === 'REVIEWED' && '👁️ Revisionata'}
                              {report.status === 'RESOLVED' && '✅ Risolta'}
                              {report.status === 'DISMISSED' && '❌ Respinta'}
                            </span>
                          </div>
                          <div className={styles.reportDetails}>
                            <p className={styles.reportReason}>
                              <strong>Motivo:</strong> {report.reason.replace(/_/g, ' ').toLowerCase()}
                            </p>
                            {report.description && (
                              <p className={styles.reportDescription}>
                                <strong>Descrizione:</strong> {report.description}
                              </p>
                            )}
                            <p className={styles.reportDate}>
                              <strong>Data:</strong> {new Date(report.createdAt).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Modal Segnalazione */}
        {showReportModal && (
          <div className={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>🚨 Segnala Utente</h3>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowReportModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.reportTargetInfo}>
                  <div className={styles.targetAvatar}>
                    {reportTarget?.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{reportTarget?.email.split('@')[0]}</h4>
                    <p>📍 {reportTarget?.comune || 'Non specificato'} • 🎾 {reportTarget?.livello || 'Non specificato'}</p>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Motivo della segnalazione *</label>
                  <select 
                    className="form-input"
                    value={reportForm.reason}
                    onChange={(e) => handleReportFormChange('reason', e.target.value)}
                  >
                    <option value="">Seleziona un motivo</option>
                    <option value="INAPPROPRIATE_BEHAVIOR">Comportamento inappropriato</option>
                    <option value="FAKE_PROFILE">Profilo falso</option>
                    <option value="HARASSMENT">Molestie</option>
                    <option value="SPAM">Spam</option>
                    <option value="NO_SHOW">Non si è presentata</option>
                    <option value="OTHER">Altro</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Descrizione (opzionale)</label>
                  <textarea 
                    className="form-input"
                    rows={4}
                    placeholder="Descrivi brevemente il problema..."
                    value={reportForm.description}
                    onChange={(e) => handleReportFormChange('description', e.target.value)}
                  />
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                  disabled={isSubmittingReport}
                >
                  Annulla
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={submitReport}
                  disabled={isSubmittingReport || !reportForm.reason}
                >
                  {isSubmittingReport ? '⏳ Invio...' : '🚨 Invia Segnalazione'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}