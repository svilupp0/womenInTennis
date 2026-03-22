/**
 * Report Service
 *
 * Centralizza la logica business per le segnalazioni utenti.
 * Estrae la logica da useReports hook e componenti dashboard.
 */

/**
 * Crea nuova segnalazione
 * @param {Object} reportData - Dati segnalazione (reportedId, reason, description)
 * @returns {Promise<{success: boolean, report?: Object, error?: string}>}
 */
export async function createReport(reportData) {
  // Validazione
  const validation = validateReportData(reportData)
  if (!validation.valid) {
    return { success: false, error: validation.errors[0] }
  }

  try {
    const response = await fetch('/api/reports/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, report: data.report }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore creazione segnalazione' }
    }
  } catch (error) {
    console.error('Errore creazione segnalazione:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Carica le segnalazioni fatte dall'utente
 * @param {string} type - Tipo segnalazioni ('given' o 'received')
 * @returns {Promise<{success: boolean, reports?: Array, error?: string}>}
 */
export async function fetchMyReports(type = 'given') {
  if (!['given', 'received'].includes(type)) {
    return { success: false, error: 'Tipo non valido (given o received)' }
  }

  try {
    const response = await fetch(`/api/reports/my?type=${type}`)

    if (response.ok) {
      const data = await response.json()
      return { success: true, reports: data.reports || [] }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore caricamento segnalazioni' }
    }
  } catch (error) {
    console.error('Errore caricamento segnalazioni:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Carica statistiche segnalazioni (admin)
 * @returns {Promise<{success: boolean, stats?: Object, error?: string}>}
 */
export async function fetchReportStats() {
  try {
    const response = await fetch('/api/reports/stats')

    if (response.ok) {
      const data = await response.json()
      return { success: true, stats: data.stats }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore caricamento statistiche' }
    }
  } catch (error) {
    console.error('Errore caricamento statistiche:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Valida dati segnalazione
 * @param {Object} reportData - Dati segnalazione da validare
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateReportData(reportData) {
  const errors = []

  // ID utente segnalato obbligatorio
  if (!reportData.reportedId) {
    errors.push('Utente da segnalare non specificato')
  }

  // Motivo obbligatorio
  if (!reportData.reason) {
    errors.push('Seleziona un motivo per la segnalazione')
  }

  // Verifica che il motivo sia valido
  const validReasons = [
    'INAPPROPRIATE_BEHAVIOR',
    'FAKE_PROFILE',
    'HARASSMENT',
    'SPAM',
    'NO_SHOW',
    'OTHER',
  ]

  if (reportData.reason && !validReasons.includes(reportData.reason)) {
    errors.push('Motivo non valido')
  }

  // Descrizione opzionale ma se presente, limita lunghezza
  if (reportData.description) {
    if (reportData.description.length > 1000) {
      errors.push('Descrizione troppo lunga (max 1000 caratteri)')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Ottiene label italiana per motivo segnalazione
 * @param {string} reason - Motivo segnalazione
 * @returns {string} Label in italiano
 */
export function getReportReasonLabel(reason) {
  const labels = {
    INAPPROPRIATE_BEHAVIOR: 'Comportamento inappropriato',
    FAKE_PROFILE: 'Profilo falso',
    HARASSMENT: 'Molestie',
    SPAM: 'Spam',
    NO_SHOW: 'Non si è presentata',
    OTHER: 'Altro',
  }

  return labels[reason] || reason
}

/**
 * Ottiene label italiana per stato segnalazione
 * @param {string} status - Stato segnalazione
 * @returns {string} Label con emoji
 */
export function getReportStatusLabel(status) {
  const labels = {
    PENDING: '⏳ In attesa',
    REVIEWED: '👁️ Revisionata',
    RESOLVED: '✅ Risolta',
    DISMISSED: '❌ Respinta',
  }

  return labels[status] || status
}

/**
 * Ottiene classe CSS per stato segnalazione
 * @param {string} status - Stato segnalazione
 * @returns {string} Nome classe CSS
 */
export function getReportStatusClass(status) {
  return status ? status.toLowerCase() : 'pending'
}

/**
 * Formatta data segnalazione
 * @param {string|Date} date - Data da formattare
 * @returns {string} Data formattata
 */
export function formatReportDate(date) {
  if (!date) return ''

  try {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return String(date)
  }
}

/**
 * Verifica se l'utente può modificare una segnalazione
 * @param {Object} report - Oggetto segnalazione
 * @param {number} userId - ID utente corrente
 * @returns {boolean}
 */
export function canEditReport(report, userId) {
  if (!report || !userId) return false

  // Solo l'autore può modificare
  if (report.reporterId !== userId) return false

  // Solo se ancora in stato PENDING
  if (report.status !== 'PENDING') return false

  return true
}

/**
 * Verifica se l'utente può eliminare una segnalazione
 * @param {Object} report - Oggetto segnalazione
 * @param {number} userId - ID utente corrente
 * @returns {boolean}
 */
export function canDeleteReport(report, userId) {
  if (!report || !userId) return false

  // Solo l'autore può eliminare
  if (report.reporterId !== userId) return false

  // Solo se ancora in stato PENDING
  if (report.status !== 'PENDING') return false

  return true
}

/**
 * Conta segnalazioni per stato
 * @param {Array} reports - Array segnalazioni
 * @returns {Object} Conteggi per stato
 */
export function countReportsByStatus(reports) {
  if (!Array.isArray(reports)) return {}

  return reports.reduce((acc, report) => {
    const status = report.status || 'PENDING'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
}

/**
 * Filtra segnalazioni per stato
 * @param {Array} reports - Array segnalazioni
 * @param {string} status - Stato da filtrare
 * @returns {Array} Segnalazioni filtrate
 */
export function filterReportsByStatus(reports, status) {
  if (!Array.isArray(reports)) return []
  if (!status) return reports

  return reports.filter((report) => report.status === status)
}
