import styles from '../../styles/Dashboard.module.css'

/**
 * Componente MyReportsList
 *
 * Lista segnalazioni fatte dall'utente con:
 * - Stato segnalazione (pending, reviewed, resolved, dismissed)
 * - Informazioni utente segnalato
 * - Motivo e descrizione
 * - Data segnalazione
 *
 * @param {object} props
 * @param {boolean} props.show - Visibilità sezione
 * @param {array} props.reports - Array segnalazioni
 * @param {boolean} props.isLoading - Loading caricamento
 * @param {function} props.onClose - Callback chiusura
 */
export default function MyReportsList({ show, reports, isLoading, onClose }) {
  if (!show) return null

  return (
    <section className={styles.reportsSection}>
      <div className={styles.reportsCard}>
        <div className={styles.reportsHeader}>
          <h2>📄 Le mie segnalazioni</h2>
          <button className="btn btn-secondary" onClick={onClose}>
            ✕ Chiudi
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>⏳ Caricamento segnalazioni...</div>
        ) : reports.length === 0 ? (
          <div className={styles.noReports}>
            <p>📝 Non hai ancora fatto nessuna segnalazione.</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report) => (
              <div key={report.id} className={styles.reportItem}>
                <div className={styles.reportHeader}>
                  <span className={styles.reportUser}>👤 {report.reported.username}</span>
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
  )
}
