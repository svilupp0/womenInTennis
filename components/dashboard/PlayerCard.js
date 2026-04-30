import { useState, useEffect, memo } from 'react'
import styles from '../../styles/Dashboard.module.css'

/**
 * Componente PlayerCard - Memoized per performance
 *
 * Card singolo giocatore con:
 * - Informazioni base (nome, comune, livello, sport)
 * - Stato disponibilità
 * - Slot disponibili
 * - Menu contatti (WhatsApp, Chiamata, Email)
 * - Pulsante segnalazione
 *
 * Ottimizzazioni:
 * - React.memo per evitare re-render quando player non cambia
 *
 * @param {object} props
 * @param {object} props.player - Dati giocatore
 * @param {function} props.onWhatsApp - Callback contatto WhatsApp
 * @param {function} props.onCall - Callback chiamata
 * @param {function} props.onEmail - Callback email
 * @param {function} props.onReport - Callback segnalazione
 */
function PlayerCard({ player, onWhatsApp, onCall, onEmail, onReport }) {
  const [openContactMenu, setOpenContactMenu] = useState(false)

  const toggleContactMenu = (e) => {
    e.stopPropagation()
    setOpenContactMenu(!openContactMenu)
  }

  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenContactMenu(false)
    }

    if (openContactMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openContactMenu])

  return (
    <div className={styles.playerCard}>
      <div className={styles.playerHeader}>
        <div className={styles.playerInfo}>
          <h3 className={styles.playerName}>{player.email.split('@')[0]}</h3>
          <p className={styles.playerDetails}>
            📍 {player.comune || 'Non specificato'} •{' '}
            {player.sportLevels && player.sportLevels.length > 0
              ? player.sportLevels
                  .map((sl) => `${sl.sport === 'TENNIS' ? '🎾' : '🏓'} ${sl.sport}: ${sl.livello}`)
                  .join(', ')
              : 'Sport non specificato'}
          </p>
          <div className={styles.playerStatus}>
            {player.disponibilita ? (
              <span className={styles.available}>✅ Disponibile</span>
            ) : (
              <span className={styles.unavailable}>❌ Non disponibile</span>
            )}
          </div>

          {/* Visualizzazione slot disponibili */}
          {player.events && player.events.length > 0 && (
            <div className={styles.availableSlots}>
              <p className={styles.slotsTitle}>📅 Prossimi slot disponibili:</p>
              <div className={styles.slotsList}>
                {player.events.slice(0, 3).map((event) => {
                  const startDate = new Date(event.start)
                  const endDate = new Date(event.end)

                  return (
                    <div key={event.id} className={styles.slotItem}>
                      <span className={styles.slotDay}>
                        {startDate.toLocaleDateString('it-IT', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className={styles.slotTime}>
                        {startDate.toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {endDate.toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {event.location && (
                        <span className={styles.slotLocation}>📍 {event.location}</span>
                      )}
                    </div>
                  )
                })}
                {player.events.length > 3 && (
                  <p className={styles.moreSlots}>
                    +{player.events.length - 3}{' '}
                    {player.events.length - 3 === 1 ? 'altro slot' : 'altri slot'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.playerActions}>
        <div className={styles.contactDropdown}>
          <button
            className="btn btn-primary"
            onClick={toggleContactMenu}
            aria-expanded={openContactMenu}
            aria-haspopup="true"
          >
            💬 Contatta
          </button>
          {openContactMenu && (
            <div className={styles.contactMenu} role="menu">
              {player.telefono && (
                <>
                  <button
                    className={styles.contactOption}
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation()
                      onWhatsApp(player)
                      setOpenContactMenu(false)
                    }}
                  >
                    📱 WhatsApp
                  </button>
                  <button
                    className={styles.contactOption}
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCall(player)
                      setOpenContactMenu(false)
                    }}
                  >
                    📞 Chiamata
                  </button>
                </>
              )}
              <button
                className={styles.contactOption}
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation()
                  onEmail(player)
                  setOpenContactMenu(false)
                }}
              >
                ✉️ Email
              </button>
            </div>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => onReport(player)}>
          🚨 Segnala
        </button>
      </div>
    </div>
  )
}

/**
 * Custom comparison function per React.memo
 * Confronta solo player.id per determinare se rifare il render
 */
function areEqual(prevProps, nextProps) {
  // Re-render solo se player.id cambia
  // Le callback sono stabili (vengono da useCallback nel parent)
  return prevProps.player.id === nextProps.player.id
}

export default memo(PlayerCard, areEqual)
