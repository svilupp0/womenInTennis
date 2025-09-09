import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
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
    isAvailable
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
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Filtri di ricerca */}
            <section className={styles.filtersSection}>
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
            </section>

            {/* 3. Lista giocatrici disponibili */}
            <section className={styles.playersSection}>
              <div className={styles.playersHeader}>
                <h2>🎾 Giocatrici Disponibili ({searchResults.length})</h2>
                {isSearching && <span className={styles.searchingIndicator}>🔄 Ricerca...</span>}
              </div>
              
              <div className={styles.playersGrid}>
                {searchResults.length === 0 && !isSearching ? (
                  <div className={styles.noResults}>
                    <p>🎾 Nessuna giocatrice trovata con questi filtri.</p>
                    <p>Prova a modificare i criteri di ricerca!</p>
                  </div>
                ) : (
                  searchResults.map((player) => (
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}