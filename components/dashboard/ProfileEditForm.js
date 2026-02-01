import styles from '../../styles/Dashboard.module.css'

/**
 * Componente ProfileEditForm
 *
 * Form completo per modifica profilo utente con:
 * - Campi: nome, comune, telefono
 * - Gestione sport-livelli multipli
 * - Validazione e salvataggio
 *
 * @param {object} props
 * @param {object} props.formData - Dati form correnti
 * @param {boolean} props.isUpdating - Loading salvataggio
 * @param {string|null} props.error - Messaggio errore
 * @param {function} props.onChange - Callback modifica campo
 * @param {function} props.onAddSportLevel - Callback aggiungi sport-livello
 * @param {function} props.onRemoveSportLevel - Callback rimuovi sport-livello
 * @param {function} props.onSave - Callback salvataggio
 * @param {function} props.onCancel - Callback annulla
 */
export default function ProfileEditForm({
  formData,
  isUpdating,
  error,
  onChange,
  onAddSportLevel,
  onRemoveSportLevel,
  onSave,
  onCancel,
}) {
  const handleAddSportLevel = () => {
    const result = onAddSportLevel()
    if (result && !result.success) {
      alert(result.error)
    }
  }

  const handleSave = async () => {
    const result = await onSave()
    if (result && result.success) {
      alert(result.message)
    } else if (result && result.error) {
      alert(result.error)
    }
  }

  return (
    <section className={styles.editProfileSection}>
      <div className={styles.editProfileCard}>
        <div className={styles.editProfileHeader}>
          <h2 className={styles.editProfileTitle}>✏️ Modifica Profilo</h2>
          <button className="btn btn-secondary" onClick={onCancel} disabled={isUpdating}>
            ✕ Chiudi
          </button>
        </div>

        {error && <div className={styles.errorMessage}>⚠️ {error}</div>}

        <div className={styles.editProfileForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nome completo:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Es: Maria Rossi"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
                disabled={isUpdating}
              />
              <small className={styles.fieldHint}>👤 Il tuo nome completo (opzionale)</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Comune di residenza:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Es: Milano, Roma, Napoli..."
                value={formData.comune}
                onChange={(e) => onChange('comune', e.target.value)}
                disabled={isUpdating}
              />
              <small className={styles.fieldHint}>
                📍 Inserisci la tua città per trovare partner vicine
              </small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sport e Livelli:</label>
              <div className={styles.sportLevelSelector}>
                <select
                  className="form-input"
                  value={formData.selectedSport}
                  onChange={(e) => onChange('selectedSport', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Seleziona sport</option>
                  <option value="TENNIS">🎾 Tennis</option>
                  <option value="PADEL">🏓 Padel</option>
                </select>

                <select
                  className="form-input"
                  value={formData.selectedLivello}
                  onChange={(e) => onChange('selectedLivello', e.target.value)}
                  disabled={isUpdating || !formData.selectedSport}
                >
                  <option value="">Seleziona livello</option>
                  <option value="Principiante">🌱 Principiante</option>
                  <option value="Intermedio">🌿 Intermedio</option>
                  <option value="Avanzato">🏆 Avanzato</option>
                </select>

                <button
                  className="btn btn-primary"
                  onClick={handleAddSportLevel}
                  disabled={isUpdating || !formData.selectedSport || !formData.selectedLivello}
                >
                  ➕ Aggiungi
                </button>
              </div>

              <small className={styles.fieldHint}>
                🎾 Aggiungi i tuoi sport e livelli per trovare partner adatti
              </small>

              {formData.sportLevels.length > 0 && (
                <div className={styles.sportLevelsList}>
                  <label className={styles.formLabel}>Livelli aggiunti:</label>
                  <ul className={styles.levelsList}>
                    {formData.sportLevels.map((sl, index) => (
                      <li key={index} className={styles.levelItem}>
                        <span>
                          {sl.sport === 'TENNIS' ? '🎾' : '🏓'}
                          {sl.sport}: {sl.livello}
                        </span>
                        <button
                          className={styles.removeLevelBtn}
                          onClick={() => onRemoveSportLevel(index)}
                          disabled={isUpdating}
                          title="Rimuovi"
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Numero di telefono (opzionale):</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Es: +39 123 456 7890"
              value={formData.telefono}
              onChange={(e) => onChange('telefono', e.target.value)}
              disabled={isUpdating}
            />
            <small className={styles.fieldHint}>
              📱 Permette contatti via WhatsApp e chiamate dirette (opzionale)
            </small>
          </div>

          <div className={styles.formActions}>
            <button className="btn btn-secondary" onClick={onCancel} disabled={isUpdating}>
              ❌ Annulla
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? '⏳ Salvataggio...' : '✅ Salva Modifiche'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
