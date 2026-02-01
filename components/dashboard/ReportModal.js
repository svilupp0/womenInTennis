import styles from '../../styles/Dashboard.module.css'

/**
 * Componente ReportModal
 *
 * Modal per segnalazione utente con:
 * - Form segnalazione (motivo + descrizione)
 * - Informazioni utente target
 * - Validazione e submit
 *
 * @param {object} props
 * @param {boolean} props.show - Visibilità modal
 * @param {object} props.targetUser - Utente da segnalare
 * @param {object} props.formData - Dati form (reason, description)
 * @param {boolean} props.isSubmitting - Loading submit
 * @param {function} props.onChange - Callback modifica campo
 * @param {function} props.onSubmit - Callback submit segnalazione
 * @param {function} props.onClose - Callback chiusura modal
 */
export default function ReportModal({
  show,
  targetUser,
  formData,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}) {
  if (!show || !targetUser) return null

  const handleSubmit = async () => {
    const result = await onSubmit()
    if (result && result.success) {
      alert(result.message)
    } else if (result && result.error) {
      alert(result.error)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>🚨 Segnala Utente</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.reportTargetInfo}>
            <div className={styles.targetAvatar}>{targetUser.email.charAt(0).toUpperCase()}</div>
            <div>
              <h4>{targetUser.email.split('@')[0]}</h4>
              <p>
                📍 {targetUser.comune || 'Non specificato'} • 🎾{' '}
                {targetUser.livello || 'Non specificato'}
              </p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Motivo della segnalazione *</label>
            <select
              className="form-input"
              value={formData.reason}
              onChange={(e) => onChange('reason', e.target.value)}
              disabled={isSubmitting}
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
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Annulla
          </button>
          <button
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.reason}
          >
            {isSubmitting ? '⏳ Invio...' : '🚨 Invia Segnalazione'}
          </button>
        </div>
      </div>
    </div>
  )
}
