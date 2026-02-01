/**
 * Event Colors Utility
 *
 * Centralizza la logica dei colori per gli stati degli eventi calendario.
 * Elimina duplicazione presente in Calendar.js e pages/api/calendar/index.js
 *
 * Basato su analisi AUDIT_TECNICO.md - Sezione 2: LOGICA BUSINESS MISTA CON UI
 */

// Costanti colori per stati eventi
export const EVENT_STATUS_COLORS = {
  AVAILABLE: '#3c70f2', // Blu - Disponibile
  CONFIRMED: '#00ff2a', // Verde - Confermato
  PROPOSED: '#f7f704', // Giallo - Proposta ricevuta
  DENIED: '#f73838', // Rosso - Rifiutato
  EXPIRED: '#e0e0e0', // Grigio chiaro - Scaduto
  CANCELLED: '#999999', // Grigio scuro - Cancellato
}

// Labels per stati eventi
export const EVENT_STATUS_LABELS = {
  AVAILABLE: '🔵 Disponibile',
  CONFIRMED: '🟢 Confermato',
  PROPOSED: '🟡 Proposta ricevuta',
  DENIED: '🔴 Rifiutato',
  EXPIRED: '⚪ Scaduto',
  CANCELLED: '⚫ Cancellato',
}

/**
 * Ottiene il colore per uno stato evento
 * @param {string} status - Stato evento
 * @returns {string} Codice colore esadecimale
 */
export function getEventColor(status) {
  return EVENT_STATUS_COLORS[status] || EVENT_STATUS_COLORS.AVAILABLE
}

/**
 * Ottiene la label per uno stato evento
 * @param {string} status - Stato evento
 * @returns {string} Label con emoji
 */
export function getEventStatusLabel(status) {
  return EVENT_STATUS_LABELS[status] || status
}

/**
 * Applica i colori a un array di eventi
 * Funzione helper per aggiungere il campo 'color' agli eventi
 *
 * @param {Array} events - Array di eventi
 * @returns {Array} Eventi con campo 'color' aggiunto
 */
export function applyEventColors(events) {
  if (!Array.isArray(events)) return []

  return events.map((event) => ({
    ...event,
    color: getEventColor(event.status),
  }))
}

/**
 * Verifica se un evento è scaduto
 * @param {string|Date} endDate - Data fine evento
 * @returns {boolean}
 */
export function isEventExpired(endDate) {
  if (!endDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventEnd = new Date(endDate)
  eventEnd.setHours(0, 0, 0, 0)

  return eventEnd < today
}

/**
 * Determina lo stato corretto di un evento
 * Se l'evento è scaduto ma lo status è ancora AVAILABLE, cambialo in EXPIRED
 *
 * @param {Object} event - Oggetto evento
 * @returns {string} Stato corretto
 */
export function getCorrectEventStatus(event) {
  if (!event) return 'AVAILABLE'

  // Se già cancellato/confermato/denied, mantieni stato
  if (['CANCELLED', 'CONFIRMED', 'DENIED'].includes(event.status)) {
    return event.status
  }

  // Se scaduto, cambia in EXPIRED
  if (isEventExpired(event.end)) {
    return 'EXPIRED'
  }

  return event.status || 'AVAILABLE'
}

/**
 * Prepara eventi per FullCalendar
 * Applica colori e aggiorna stati scaduti
 *
 * @param {Array} events - Array eventi dal database
 * @returns {Array} Eventi pronti per FullCalendar
 */
export function prepareEventsForCalendar(events) {
  if (!Array.isArray(events)) return []

  return events.map((event) => {
    // Aggiorna stato se scaduto
    const correctStatus = getCorrectEventStatus(event)

    return {
      ...event,
      status: correctStatus,
      color: getEventColor(correctStatus),
    }
  })
}
