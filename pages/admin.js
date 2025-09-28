import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Admin.module.css'

export default function AdminDashboard() {
  const { 
    user, 
    token,
    loading, 
    isAuthenticated, 
    logout,
    getDisplayName,
    isAdmin
  } = useAuth()

  const [reports, setReports] = useState([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportDetail, setShowReportDetail] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Redirect se non autenticato o non admin
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      window.location.href = '/login'
    } else if (!loading && isAuthenticated() && !isAdmin()) {
      // Redirect utenti normali alla dashboard normale
      window.location.href = '/dashboard'
    }
  }, [loading, isAuthenticated, isAdmin])

  // Carica segnalazioni
  const loadReports = async () => {
    setIsLoadingReports(true)
    try {
      const response = await fetch('/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else {
        console.error('Errore caricamento segnalazioni:', response.statusText)
        setReports([])
      }
    } catch (error) {
      console.error('Errore caricamento segnalazioni:', error)
      setReports([])
    } finally {
      setIsLoadingReports(false)
    }
  }

  // Carica segnalazioni quando il componente si monta
  useEffect(() => {
    if (user && token && user?.isAdmin) {
      loadReports()
    }
  }, [user, token])

  // Logout con conferma
  const handleLogout = () => {
    if (confirm('Sei sicura di voler uscire?')) {
      logout()
      window.location.href = '/'
    }
  }

  // Gestione form cambio password
  const handlePasswordFormChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Cambio password
  const handleChangePassword = async () => {
    // Validazioni
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Tutti i campi sono obbligatori')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('La nuova password e la conferma non coincidono')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      alert('La nuova password deve essere di almeno 6 caratteri')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Password cambiata con successo!')
        setShowChangePassword(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        alert(data.error || 'Errore durante il cambio password')
      }
    } catch (error) {
      console.error('Errore cambio password:', error)
      alert('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Visualizza dettaglio segnalazione
  const viewReportDetail = (report) => {
    setSelectedReport(report)
    setShowReportDetail(true)
  }

  // Gestisci azione su segnalazione
  const handleReportAction = async (reportId, action) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        alert(`Azione "${action}" eseguita con successo`)
        loadReports() // Ricarica la lista
        setShowReportDetail(false)
      } else {
        const data = await response.json()
        alert(data.error || 'Errore durante l\'azione')
      }
    } catch (error) {
      console.error('Errore azione segnalazione:', error)
      alert('Errore di connessione. Riprova più tardi.')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.loading}>
          ⏳ Caricamento dashboard admin...
        </div>
      </div>
    )
  }

  // Non autenticato o non admin
  if (!isAuthenticated() || !isAdmin()) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.error}>
          🔒 Accesso non autorizzato. Reindirizzamento...
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Women in Net</title>
        <meta name="description" content="Dashboard amministrativa per la moderazione" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.adminPage}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <div className={styles.headerContent}>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoIcon}>🎾</div>
                <span>Women in Net - Admin</span>
              </Link>
              
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>👑 {getDisplayName()}</span>
                  <span className={styles.userRole}>Amministratrice</span>
                </div>
                <div className={styles.userActions}>
                  <button 
                    onClick={() => setShowChangePassword(true)}
                    className="btn btn-outline"
                    style={{ padding: 'var(--space-xs) var(--space-md)', fontSize: '0.875rem' }}
                  >
                    🔑 Cambia Password
                  </button>
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
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className="container">
            {/* Dashboard Header */}
            <section className={styles.dashboardHeader}>
              <h1>🛡️ Dashboard Amministrativa</h1>
              <p>Gestisci le segnalazioni e modera la community</p>
            </section>

            {/* Stats Cards */}
            <section className={styles.statsSection}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📊</div>
                  <div className={styles.statInfo}>
                    <h3>Segnalazioni Totali</h3>
                    <p className={styles.statNumber}>{reports.length}</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⏳</div>
                  <div className={styles.statInfo}>
                    <h3>In Attesa</h3>
                    <p className={styles.statNumber}>
                      {reports.filter(r => r.status === 'PENDING').length}
                    </p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>✅</div>
                  <div className={styles.statInfo}>
                    <h3>Risolte</h3>
                    <p className={styles.statNumber}>
                      {reports.filter(r => r.status === 'RESOLVED').length}
                    </p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>❌</div>
                  <div className={styles.statInfo}>
                    <h3>Respinte</h3>
                    <p className={styles.statNumber}>
                      {reports.filter(r => r.status === 'DISMISSED').length}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reports List */}
            <section className={styles.reportsSection}>
              <div className={styles.reportsHeader}>
                <h2>📋 Segnalazioni</h2>
                <button 
                  className="btn btn-primary"
                  onClick={loadReports}
                  disabled={isLoadingReports}
                >
                  {isLoadingReports ? '⏳ Caricamento...' : '🔄 Aggiorna'}
                </button>
              </div>

              {isLoadingReports ? (
                <div className={styles.loading}>⏳ Caricamento segnalazioni...</div>
              ) : reports.length === 0 ? (
                <div className={styles.noReports}>
                  <p>📝 Nessuna segnalazione presente.</p>
                </div>
              ) : (
                <div className={styles.reportsTable}>
                  <div className={styles.tableHeader}>
                    <div>ID</div>
                    <div>Reporter</div>
                    <div>Segnalato</div>
                    <div>Motivo</div>
                    <div>Data</div>
                    <div>Stato</div>
                    <div>Azioni</div>
                  </div>
                  {reports.map((report) => (
                    <div key={report.id} className={styles.tableRow}>
                      <div className={styles.reportId}>#{report.id}</div>
                      <div className={styles.reportUser}>
                        {report.reporter.email.split('@')[0]}
                      </div>
                      <div className={styles.reportUser}>
                        {report.reported.email.split('@')[0]}
                      </div>
                      <div className={styles.reportReason}>
                        {report.reason.replace(/_/g, ' ').toLowerCase()}
                      </div>
                      <div className={styles.reportDate}>
                        {new Date(report.createdAt).toLocaleDateString('it-IT')}
                      </div>
                      <div className={styles.reportStatus}>
                        <span className={`${styles.statusBadge} ${styles[report.status.toLowerCase()]}`}>
                          {report.status === 'PENDING' && '⏳ In attesa'}
                          {report.status === 'REVIEWED' && '👁️ Revisionata'}
                          {report.status === 'RESOLVED' && '✅ Risolta'}
                          {report.status === 'DISMISSED' && '❌ Respinta'}
                        </span>
                      </div>
                      <div className={styles.reportActions}>
                        <button 
                          className="btn btn-outline"
                          onClick={() => viewReportDetail(report)}
                        >
                          👁️ Dettagli
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        {/* Modal Cambio Password */}
        {showChangePassword && (
          <div className={styles.modalOverlay} onClick={() => setShowChangePassword(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>🔑 Cambia Password</h3>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowChangePassword(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password Attuale *</label>
                  <input 
                    type="password"
                    className="form-input"
                    placeholder="Inserisci la password attuale"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nuova Password *</label>
                  <input 
                    type="password"
                    className="form-input"
                    placeholder="Inserisci la nuova password (min 6 caratteri)"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Conferma Nuova Password *</label>
                  <input 
                    type="password"
                    className="form-input"
                    placeholder="Conferma la nuova password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                  />
                </div>

                <div className={styles.passwordHint}>
                  📝 <strong>Suggerimento:</strong> Usa una password sicura con almeno 6 caratteri
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowChangePassword(false)}
                  disabled={isChangingPassword}
                >
                  Annulla
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  {isChangingPassword ? '⏳ Aggiornamento...' : '🔑 Cambia Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dettaglio Segnalazione */}
        {showReportDetail && selectedReport && (
          <div className={styles.modalOverlay} onClick={() => setShowReportDetail(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>🔍 Dettaglio Segnalazione #{selectedReport.id}</h3>
                <button 
                  className={styles.modalClose}
                  onClick={() => setShowReportDetail(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.reportDetailGrid}>
                  <div className={styles.reportDetailSection}>
                    <h4>👤 Reporter</h4>
                    <div className={styles.userDetail}>
                      <div className={styles.userAvatar}>
                        {selectedReport.reporter.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p><strong>Email:</strong> {selectedReport.reporter.email}</p>
                        <p><strong>Comune:</strong> {selectedReport.reporter.comune || 'Non specificato'}</p>
                        <p><strong>Livello:</strong> {selectedReport.reporter.livello || 'Non specificato'}</p>
                        <p><strong>Membro dal:</strong> {new Date(selectedReport.reporter.createdAt).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportDetailSection}>
                    <h4>🎯 Utente Segnalato</h4>
                    <div className={styles.userDetail}>
                      <div className={styles.userAvatar}>
                        {selectedReport.reported.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p><strong>Email:</strong> {selectedReport.reported.email}</p>
                        <p><strong>Comune:</strong> {selectedReport.reported.comune || 'Non specificato'}</p>
                        <p><strong>Livello:</strong> {selectedReport.reported.livello || 'Non specificato'}</p>
                        <p><strong>Membro dal:</strong> {new Date(selectedReport.reported.createdAt).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.reportDetailSection}>
                  <h4>📋 Dettagli Segnalazione</h4>
                  <div className={styles.reportInfo}>
                    <p><strong>Motivo:</strong> {selectedReport.reason.replace(/_/g, ' ').toLowerCase()}</p>
                    <p><strong>Data:</strong> {new Date(selectedReport.createdAt).toLocaleDateString('it-IT')} alle {new Date(selectedReport.createdAt).toLocaleTimeString('it-IT')}</p>
                    <p><strong>Stato:</strong> {selectedReport.status}</p>
                    {selectedReport.description && (
                      <div>
                        <strong>Descrizione:</strong>
                        <div className={styles.description}>
                          {selectedReport.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                {selectedReport.status === 'PENDING' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleReportAction(selectedReport.id, 'warn')}
                    >
                      ⚠️ Avvisa Utente
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleReportAction(selectedReport.id, 'suspend')}
                    >
                      🚫 Sospendi Utente
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                    >
                      ❌ Respingi Segnalazione
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowReportDetail(false)}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}