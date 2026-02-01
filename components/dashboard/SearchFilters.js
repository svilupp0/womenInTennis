import styles from '../../styles/Dashboard.module.css'

/**
 * Componente SearchFilters
 *
 * Filtri di ricerca giocatrici con:
 * - Comune
 * - Sport
 * - Livello
 * - Solo disponibili (checkbox)
 *
 * @param {object} props
 * @param {object} props.filters - Oggetto filtri correnti
 * @param {array} props.comuniDisponibili - Lista comuni con conteggio
 * @param {function} props.onFilterChange - Callback modifica filtro
 */
export default function SearchFilters({ filters, comuniDisponibili, onFilterChange }) {
  return (
    <div className={styles.filtersCard}>
      <h2 className={styles.filtersTitle}>🔍 Trova Partner di Tennis</h2>
      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Comune:</label>
          <select
            className="form-input"
            value={filters.comune}
            onChange={(e) => onFilterChange('comune', e.target.value)}
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
          <label className={styles.filterLabel}>Sport:</label>
          <select
            className="form-input"
            value={filters.sport}
            onChange={(e) => onFilterChange('sport', e.target.value)}
          >
            <option value="">Tutti gli sport</option>
            <option value="TENNIS">🎾 Tennis</option>
            <option value="PADEL">🏓 Padel</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Livello:</label>
          <select
            className="form-input"
            value={filters.livello}
            onChange={(e) => onFilterChange('livello', e.target.value)}
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
              checked={filters.disponibilita}
              onChange={(e) => onFilterChange('disponibilita', e.target.checked)}
              className={styles.checkbox}
            />
            <span>Mostra solo giocatrici disponibili</span>
          </div>
        </div>
      </div>
    </div>
  )
}
