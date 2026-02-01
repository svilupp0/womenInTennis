import { truncateDisplayName, getTooltipDisplayName } from '../../utils/displayNameUtils'
import styles from '../../styles/Dashboard.module.css'

/**
 * Componente ProfileCard
 *
 * Visualizza card profilo utente con:
 * - Nome e informazioni utente
 * - Toggle disponibilità
 * - Pulsanti azioni (Modifica profilo, Segnalazioni)
 *
 * @param {object} props
 * @param {string} props.displayName - Nome da visualizzare
 * @param {string} props.location - Località utente
 * @param {string} props.sportsDisplay - Sport praticati
 * @param {boolean} props.availability - Stato disponibilità
 * @param {boolean} props.isUpdatingAvailability - Loading toggle disponibilità
 * @param {boolean} props.isSynced - Sincronizzazione disponibilità
 * @param {boolean} props.isMobile - Vista mobile
 * @param {function} props.onToggleAvailability - Callback toggle disponibilità
 * @param {function} props.onEditProfile - Callback apertura modifica profilo
 * @param {function} props.onShowReports - Callback visualizza segnalazioni
 */
export default function ProfileCard({
  displayName,
  location,
  sportsDisplay,
  availability,
  isUpdatingAvailability,
  isSynced,
  isMobile,
  onToggleAvailability,
  onEditProfile,
  onShowReports,
}) {
  return (
    <section className={styles.profileSection}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.profileInfo}>
              <h1
                className={styles.profileName}
                title={getTooltipDisplayName(displayName)}
                aria-label={`Nome utente: ${displayName}`}
              >
                {truncateDisplayName(displayName, isMobile ? 25 : 30, isMobile)}
              </h1>
              <p
                className={styles.profileDetails}
                title={isMobile ? `${location} - ${sportsDisplay}` : undefined}
              >
                📍 {location} • {sportsDisplay}
              </p>
            </div>
          </div>
          <div className={styles.profileActions}>
            <div className={styles.availabilityToggle}>
              <span className={styles.toggleLabel}>
                Disponibile:
                {isUpdatingAvailability && <span className={styles.updating}> ⏳</span>}
                {!isSynced && !isUpdatingAvailability && <span className={styles.error}> ⚠️</span>}
              </span>
              <div
                className={`${styles.toggle} ${availability ? styles.active : ''} ${isUpdatingAvailability ? styles.updating : ''}`}
                onClick={onToggleAvailability}
                role="switch"
                aria-checked={availability}
                aria-label={`Disponibilità: ${availability ? 'attiva' : 'disattiva'}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggleAvailability()
                  }
                }}
              >
                <div className={styles.toggleSlider}></div>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={onEditProfile}>
              ✏️ Modifica Profilo
            </button>
            <button className="btn btn-secondary" onClick={onShowReports}>
              📄 Le mie segnalazioni
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
