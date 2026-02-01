import { useState } from 'react'
import moment from 'moment'
import { validateEventData } from '../../lib/services/eventService'
import styles from '../../styles/Calendar.module.css'

/**
 * Modal per creazione nuovo evento calendario
 *
 * @param {object} props
 * @param {string} props.selectedDate - Data selezionata (YYYY-MM-DD)
 * @param {function} props.onClose - Callback chiusura modal
 * @param {function} props.onSubmit - Callback submit evento
 */
export default function CreateEventModal({ selectedDate, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: 'Disponibile per partita',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    sport: 'TENNIS',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.startTime || !formData.endTime) {
      setError('Inserisci orario di inizio e fine')
      return
    }

    if (formData.startTime >= formData.endTime) {
      setError("L'orario di fine deve essere dopo quello di inizio")
      return
    }

    // Crea oggetto evento
    const eventData = {
      title: formData.title,
      start: `${selectedDate}T${formData.startTime}:00`,
      end: `${selectedDate}T${formData.endTime}:00`,
      location: formData.location,
      description: formData.description,
      sport: formData.sport,
    }

    // Validazione centralizzata
    const validation = validateEventData(eventData)
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    setIsSubmitting(true)
    const result = await onSubmit(eventData)

    if (!result.success) {
      setError(result.error || 'Errore durante la creazione')
      setIsSubmitting(false)
    }
    // Se success, il componente padre chiuderà il modal
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>🎾 Nuova Disponibilità</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {error && <div className={styles.errorMessage}>⚠️ {error}</div>}

          <div className={styles.formGroup}>
            <label>Data selezionata:</label>
            <input
              type="text"
              value={moment(selectedDate).format('DD/MM/YYYY')}
              readOnly
              className={styles.readonlyInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Titolo:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Es: Disponibile per partita"
              required
              className={styles.formInput}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ora inizio:</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ora fine:</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Luogo:</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Es: Tennis Club Milano"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Sport:</label>
            <select
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              required
              className={styles.formInput}
            >
              <option value="TENNIS">🎾 Tennis</option>
              <option value="PADEL">🏓 Padel</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Note:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informazioni aggiuntive..."
              rows={3}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnSecondary}
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? '⏳ Salvataggio...' : 'Salva 🎾'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
