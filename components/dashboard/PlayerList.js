import { useRef, useState, useEffect, memo } from 'react'
import PlayerCard from './PlayerCard'
import styles from '../../styles/Dashboard.module.css'

/**
 * Componente PlayerList - Memoized per performance
 *
 * Lista scrollabile di giocatrici con:
 * - Rendering PlayerCard per ogni giocatore
 * - Scroll indicator
 * - Empty state
 * - Loading state
 *
 * Ottimizzazioni:
 * - React.memo per evitare re-render quando players non cambia
 * - PlayerCard è già memoized internamente
 *
 * @param {object} props
 * @param {array} props.players - Array giocatori
 * @param {boolean} props.isSearching - Loading ricerca
 * @param {function} props.onWhatsApp - Callback WhatsApp
 * @param {function} props.onCall - Callback chiamata
 * @param {function} props.onEmail - Callback email
 * @param {function} props.onReport - Callback segnalazione
 */
function PlayerList({ players, isSearching, onWhatsApp, onCall, onEmail, onReport }) {
  const playersListRef = useRef(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)

  // Scroll indicator logic
  useEffect(() => {
    const container = playersListRef.current
    if (!container) return

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isScrollable = scrollHeight > clientHeight
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10 // soglia piccola
      setShowScrollIndicator(isScrollable && !isAtBottom)
    }

    container.addEventListener('scroll', checkScroll)
    checkScroll() // controllo iniziale

    return () => container.removeEventListener('scroll', checkScroll)
  }, [players]) // ricontrolla quando cambia la lista

  return (
    <div className={styles.playersCard}>
      <div className={styles.playersHeader}>
        <h2>🎾 Giocatrici Disponibili ({players.length})</h2>
        {isSearching && <span className={styles.searchingIndicator}>🔄 Ricerca...</span>}
      </div>

      <div className={styles.playersListContainer} ref={playersListRef}>
        {players.length === 0 && !isSearching ? (
          <div className={styles.noResults}>
            <p>🎾 Nessuna giocatrice trovata con questi filtri.</p>
            <p>Prova a modificare i criteri di ricerca!</p>
          </div>
        ) : (
          <div className={styles.playersList}>
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onWhatsApp={onWhatsApp}
                onCall={onCall}
                onEmail={onEmail}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className={styles.scrollIndicator}>
          <span aria-hidden="true">⬇️</span> Scorri per vedere altre giocatrici
        </div>
      )}
    </div>
  )
}

/**
 * Custom comparison function per React.memo
 * Evita re-render se players array ha stessa lunghezza e stessi ID
 */
function areEqual(prevProps, nextProps) {
  // Controlla se isSearching è cambiato
  if (prevProps.isSearching !== nextProps.isSearching) {
    return false
  }

  // Controlla se lunghezza array è cambiata
  if (prevProps.players.length !== nextProps.players.length) {
    return false
  }

  // Controlla se gli ID dei players sono cambiati
  // Shallow comparison degli oggetti player
  for (let i = 0; i < prevProps.players.length; i++) {
    if (prevProps.players[i].id !== nextProps.players[i].id) {
      return false
    }
  }

  // Players non è cambiato, evita re-render
  return true
}

export default memo(PlayerList, areEqual)
