import { useState, useEffect } from 'react'
import {
  fetchUserEvents,
  createEvent as createEventService,
  deleteEvent as deleteEventService,
} from '../lib/services/eventService'

/**
 * Custom Hook per gestione calendario eventi
 *
 * Responsabilità:
 * - Caricamento eventi utente
 * - Gestione stati modali (creazione/dettagli)
 * - Creazione ed eliminazione eventi
 * - Preparazione dati per FullCalendar
 *
 * @param {object} user - Utente corrente
 * @returns {object} - Stati e funzioni calendario
 */
export function useCalendar(user) {
  // Stati eventi
  const [savedEvents, setSavedEvents] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Stati modali
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState({})
  const [selectedDate, setSelectedDate] = useState('')

  /**
   * Carica eventi dell'utente dal server
   */
  const loadEvents = async () => {
    setIsLoading(true)
    const result = await fetchUserEvents()

    if (result.success) {
      const events = result.events || []

      // Prepara eventi per FullCalendar (ridotto: solo id, title, start, color)
      const calendarEventsList = events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        color: event.color,
      }))

      setSavedEvents(events)
      setCalendarEvents(calendarEventsList)
    } else {
      console.error('Errore caricamento eventi:', result.error)
      setSavedEvents([])
      setCalendarEvents([])
    }

    setIsLoading(false)
  }

  /**
   * Carica eventi al mount del componente
   */
  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  /**
   * Gestisce click su data (apertura modal creazione)
   */
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr)
    setShowCreateModal(true)

    // Salva in localStorage per eventuale recovery
    localStorage.setItem('selectedDate', arg.dateStr)
  }

  /**
   * Gestisce click su evento (apertura modal dettagli)
   */
  const handleEventClick = (arg) => {
    const eventId = arg.event._def.publicId
    const fullEvent = savedEvents.find((event) => event.id === eventId)

    if (fullEvent) {
      setSelectedEvent(fullEvent)
      setShowDetailsModal(true)
    }
  }

  /**
   * Crea nuovo evento
   */
  const handleCreateEvent = async (eventData) => {
    const result = await createEventService(eventData)

    if (result.success) {
      // Ricarica eventi
      await loadEvents()
      // Chiudi modal
      setShowCreateModal(false)
      setSelectedDate('')
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  }

  /**
   * Elimina evento
   */
  const handleDeleteEvent = async () => {
    if (!selectedEvent.id) {
      return { success: false, error: 'Evento non selezionato' }
    }

    const result = await deleteEventService(selectedEvent.id)

    if (result.success) {
      // Ricarica eventi
      await loadEvents()
      // Chiudi modal
      setShowDetailsModal(false)
      setSelectedEvent({})
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  }

  /**
   * Chiude modal creazione
   */
  const closeCreateModal = () => {
    setShowCreateModal(false)
    setSelectedDate('')
  }

  /**
   * Chiude modal dettagli
   */
  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedEvent({})
  }

  return {
    // Dati eventi
    calendarEvents,
    savedEvents,
    isLoading,

    // Stati modali
    showCreateModal,
    showDetailsModal,
    selectedEvent,
    selectedDate,

    // Funzioni gestione eventi
    loadEvents,
    handleDateClick,
    handleEventClick,
    handleCreateEvent,
    handleDeleteEvent,

    // Funzioni chiusura modali
    closeCreateModal,
    closeDetailsModal,
  }
}
