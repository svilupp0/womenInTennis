/**
 * Event Service
 *
 * Centralizza tutta la logica business relativa agli eventi calendario.
 * Separa la business logic dal componente Calendar.js
 */

import { prepareEventsForCalendar } from '../utils/eventColors'

/**
 * Carica eventi dell'utente dal server
 * @returns {Promise<{success: boolean, events?: Array, error?: string}>}
 */
export async function fetchUserEvents() {
  try {
    const response = await fetch('/api/calendar')

    if (response.ok) {
      const data = await response.json()
      const events = data.events || []

      // Applica colori e aggiorna stati scaduti
      const preparedEvents = prepareEventsForCalendar(events)

      return { success: true, events: preparedEvents }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore caricamento eventi' }
    }
  } catch (error) {
    console.error('Errore fetch eventi:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Crea nuovo evento calendario
 * @param {Object} eventData - Dati evento da creare
 * @returns {Promise<{success: boolean, event?: Object, error?: string}>}
 */
export async function createEvent(eventData) {
  // Validazione base
  if (!eventData.start || !eventData.end) {
    return { success: false, error: 'Data inizio e fine obbligatorie' }
  }

  if (new Date(eventData.start) >= new Date(eventData.end)) {
    return { success: false, error: 'La data/ora di fine deve essere dopo quella di inizio' }
  }

  try {
    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, event: data.event }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore creazione evento' }
    }
  } catch (error) {
    console.error('Errore creazione evento:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Elimina evento esistente
 * @param {number} eventId - ID evento da eliminare
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteEvent(eventId) {
  if (!eventId) {
    return { success: false, error: 'ID evento mancante' }
  }

  try {
    const response = await fetch(`/api/calendar/${eventId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      return { success: true }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore eliminazione evento' }
    }
  } catch (error) {
    console.error('Errore eliminazione evento:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Aggiorna evento esistente
 * @param {number} eventId - ID evento da aggiornare
 * @param {Object} eventData - Nuovi dati evento
 * @returns {Promise<{success: boolean, event?: Object, error?: string}>}
 */
export async function updateEvent(eventId, eventData) {
  if (!eventId) {
    return { success: false, error: 'ID evento mancante' }
  }

  try {
    const response = await fetch(`/api/calendar/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, event: data.event }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore aggiornamento evento' }
    }
  } catch (error) {
    console.error('Errore aggiornamento evento:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Carica eventi pubblici (disponibili) per la ricerca
 * @param {Object} filters - Filtri ricerca (comune, sport, etc)
 * @returns {Promise<{success: boolean, events?: Array, error?: string}>}
 */
export async function fetchPublicEvents(filters = {}) {
  try {
    const queryParams = new URLSearchParams()
    if (filters.comune) queryParams.append('comune', filters.comune)
    if (filters.sport) queryParams.append('sport', filters.sport)
    if (filters.startDate) queryParams.append('startDate', filters.startDate)
    if (filters.endDate) queryParams.append('endDate', filters.endDate)

    const response = await fetch(`/api/calendar/public?${queryParams}`)

    if (response.ok) {
      const data = await response.json()
      const events = data.events || []

      // Applica colori
      const preparedEvents = prepareEventsForCalendar(events)

      return { success: true, events: preparedEvents }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore caricamento eventi pubblici' }
    }
  } catch (error) {
    console.error('Errore fetch eventi pubblici:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Valida dati evento prima della creazione/aggiornamento
 * @param {Object} eventData - Dati evento da validare
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateEventData(eventData) {
  const errors = []

  if (!eventData.title || eventData.title.trim() === '') {
    errors.push('Titolo obbligatorio')
  }

  if (!eventData.start) {
    errors.push('Data/ora inizio obbligatoria')
  }

  if (!eventData.end) {
    errors.push('Data/ora fine obbligatoria')
  }

  if (eventData.start && eventData.end) {
    const start = new Date(eventData.start)
    const end = new Date(eventData.end)

    if (start >= end) {
      errors.push('La data/ora di fine deve essere dopo quella di inizio')
    }

    // Verifica che non sia nel passato
    const now = new Date()
    if (start < now) {
      errors.push('Non puoi creare eventi nel passato')
    }
  }

  if (eventData.sport && !['TENNIS', 'PADEL'].includes(eventData.sport)) {
    errors.push('Sport non valido')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
