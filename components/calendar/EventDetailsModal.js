import { useState } from 'react'
import moment from 'moment'
import { getEventStatusLabel } from '../../lib/utils/eventColors'
import styles from '../../styles/Calendar.module.css'

/**
 * Modal per visualizzazione dettagli evento
 *
 * @param {object} props
 * @param {object} props.event - Evento da visualizzare
 * @param {function} props.onClose - Callback chiusura modal
 * @param {function} props.onDelete - Callback eliminazione evento
 */
export default function EventDetailsModal({ event, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Sei sicura di voler eliminare questa disponibilità?')) {
      return
    }

    setIsDeleting(true)
    const result = await onDelete()

    if (!result.success) {
      alert(result.error || "Errore durante l'eliminazione")
      setIsDeleting(false)
    }
    // Se success, il componente padre chiuderà il modal
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>📅 Dettagli Disponibilità</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.eventDetails}>
            <h4>{event.title}</h4>

            <div className={styles.detailRow}>
              <strong>📅 Data:</strong>
              <span>{moment(event.start).format('DD/MM/YYYY')}</span>
            </div>

            <div className={styles.detailRow}>
              <strong>🕐 Orario:</strong>
              <span>
                {moment(event.start).format('HH:mm')} -{moment(event.end).format('HH:mm')}
              </span>
            </div>

            {event.location && (
              <div className={styles.detailRow}>
                <strong>📍 Luogo:</strong>
                <span>{event.location}</span>
              </div>
            )}

            <div className={styles.detailRow}>
              <strong>📊 Stato:</strong>
              <span className={styles.statusBadge}>{getEventStatusLabel(event.status)}</span>
            </div>

            {event.description && (
              <div className={styles.detailRow}>
                <strong>📝 Note:</strong>
                <p>{event.description}</p>
              </div>
            )}

            {event.proposals && event.proposals.length > 0 && (
              <div className={styles.detailRow}>
                <strong>💬 Proposte:</strong>
                <div className={styles.proposalsList}>
                  {event.proposals.map((proposal) => (
                    <div key={proposal.id} className={styles.proposalItem}>
                      <span>{proposal.proposer.email.split('@')[0]}</span>
                      <span className={styles.proposalStatus}>
                        {proposal.status === 'PENDING' && '⏳ In attesa'}
                        {proposal.status === 'ACCEPTED' && '✅ Accettata'}
                        {proposal.status === 'REJECTED' && '❌ Rifiutata'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Chiudi
          </button>
          {(event.status === 'AVAILABLE' || event.status === 'EXPIRED') && (
            <button onClick={handleDelete} className={styles.btnDanger} disabled={isDeleting}>
              {isDeleting ? '⏳ Eliminazione...' : '🗑️ Elimina'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
