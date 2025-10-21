
// components/Calendar.js
// Componente calendario basato sul codice open source Scheduler.js

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import moment from 'moment'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Calendar.module.css'

// Utility per creare eventi calendario (come CalendarEvent.js)
class CalendarEvent {
  constructor(id, title, start, color) {
    this.id = id
    this.title = title
    this.start = start
    this.color = color
  }
}

const Calendar = () => {
  const { user, token } = useAuth()
  
  const [savedEvents, setSavedEvents] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState({})
  const [selectedDate, setSelectedDate] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Carica eventi dal server (come getDates nel codice open source)
  const loadEvents = async () => {
    if (!token) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/calendar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const events = data.events || []
        
        // Gestione stati eventi e colori (come nell'open source)
        events.forEach(event => {
          // Controlla se evento è scaduto
          if (moment().format('YYYYMMDD') > moment(event.end).format('YYYYMMDD')) {
            event.status = 'EXPIRED'
          }
          
          // Assegna colori in base allo stato (come nell'open source)
          switch (event.status) {
            case 'AVAILABLE':
              event.color = '#3c70f2' // Blu
              break
            case 'CONFIRMED':
              event.color = '#00ff2a' // Verde
              break
            case 'PROPOSED':
              event.color = '#f7f704' // Giallo
              break
            case 'DENIED':
              event.color = '#f73838' // Rosso
              break
            case 'EXPIRED':
              event.color = '#e0e0e0' // Grigio
              break
            case 'CANCELLED':
              event.color = '#999999' // Grigio scuro
              break
            default:
              event.color = '#3c70f2'
          }
        })
        
        // Crea array di eventi per FullCalendar
        const calendarEventsList = events.map(event => 
          new CalendarEvent(event.id, event.title, event.start, event.color)
        )
        
        setSavedEvents(events)
        setCalendarEvents(calendarEventsList)
      } else {
        console.error('Errore caricamento eventi:', response.statusText)
      }
    } catch (error) {
      console.error('Errore caricamento eventi:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carica eventi al mount
  useEffect(() => {
    if (user && token) {
      loadEvents()
    }
  }, [user, token])

  // Gestione click su data (per creare nuovo evento) - come handleDateClick
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr)
    setShowCreateModal(true)
    
    // Salva data selezionata in localStorage (come nell'open source)
    const selectedDate = moment(arg.dateStr).format('YYYY-MM-DD')
    localStorage.setItem('selectedDate', selectedDate)
  }

  // Gestione click su evento (per visualizzare dettagli) - come handleEventClick
  const handleEventClick = (arg) => {
    setShowDetailsModal(true)
    
    // Trova evento completo dai dati salvati (come nell'open source)
    const eventId = arg.event._def.publicId
    const fullEvent = savedEvents.find(event => event.id == eventId)
    
    if (fullEvent) {
      setSelectedEvent(fullEvent)
    }
  }

  // Elimina evento (come deleteEvent)
  const deleteEvent = async () => {
    if (!selectedEvent.id) return
    
    try {
      const response = await fetch(`/api/calendar/${selectedEvent.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        // Ricarica eventi
        loadEvents()
        setShowDetailsModal(false)
        setSelectedEvent({})
      } else {
        const data = await response.json()
        alert(data.error || 'Errore durante l\'eliminazione')
      }
    } catch (error) {
      console.error('Errore eliminazione evento:', error)
      alert('Errore di connessione')
    }
  }

  // Crea nuovo evento
  const createEvent = async (eventData) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      })
      
      if (response.ok) {
        // Ricarica eventi
        loadEvents()
        setShowCreateModal(false)
        setSelectedDate('')
      } else {
        const data = await response.json()
        alert(data.error || 'Errore durante la creazione')
      }
    } catch (error) {
      console.error('Errore creazione evento:', error)
      alert('Errore di connessione')
    }
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        {isLoading && <span className={styles.loading}>🔄 Caricamento...</span>}
      </div>
      
      {/* Calendario FullCalendar */}
      <div className={styles.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height={400}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }}
          locale="it"
          buttonText={{
            today: 'Oggi',
            month: 'Mese',
            week: 'Settimana',
            day: 'Giorno'
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          aspectRatio={1.2}
          contentHeight={350}
        />
      </div>

      {/* Legenda Stati */}
      <div className={styles.calendarLegend}>
        <h4>Legenda:</h4>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={styles.legendColor} style={{backgroundColor: '#3c70f2'}}></span>
            🔵 Disponibile
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendColor} style={{backgroundColor: '#f7f704'}}></span>
            🟡 Proposta ricevuta
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendColor} style={{backgroundColor: '#00ff2a'}}></span>
            🟢 Confermato
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendColor} style={{backgroundColor: '#f73838'}}></span>
            🔴 Rifiutato
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendColor} style={{backgroundColor: '#e0e0e0'}}></span>
            ⚪ Scaduto
          </div>
        </div>
      </div>

      {/* Modal Creazione Evento */}
      {showCreateModal && (
        <CreateEventModal
          selectedDate={selectedDate}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedDate('')
          }}
          onSubmit={createEvent}
        />
      )}

      {/* Modal Dettagli Evento */}
      {showDetailsModal && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedEvent({})
          }}
          onDelete={deleteEvent}
        />
      )}
    </div>
  )
}

// Modal per creare nuovo evento (basato su SchedulerModal)
const CreateEventModal = ({ selectedDate, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: 'Disponibile per partita',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    sport: 'TENNIS' // Default sport
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.startTime || !formData.endTime) {
      alert('Inserisci orario di inizio e fine')
      return
    }
    
    if (formData.startTime >= formData.endTime) {
      alert('L\'orario di fine deve essere dopo quello di inizio')
      return
    }
    
    setIsSubmitting(true)
    
    // Crea oggetto evento
    const eventData = {
      title: formData.title,
      start: `${selectedDate}T${formData.startTime}:00`,
      end: `${selectedDate}T${formData.endTime}:00`,
      location: formData.location,
      description: formData.description,
      sport: formData.sport
    }
    
    await onSubmit(eventData)
    setIsSubmitting(false)
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>🎾 Nuova Disponibilità</h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalBody}>
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
              onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Ora fine:</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
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
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Es: Tennis Club Milano"
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Sport:</label>
            <select
              value={formData.sport}
              onChange={(e) => setFormData({...formData, sport: e.target.value})}
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
              onChange={(e) => setFormData({...formData, description: e.target.value})}
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
            <button 
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Creazione...' : '🎾 Crea Disponibilità'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal per dettagli evento (basato su EventDetailsModal)
const EventDetailsModal = ({ event, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = async () => {
    if (!confirm('Sei sicura di voler eliminare questa disponibilità?')) {
      return
    }
    
    setIsDeleting(true)
    await onDelete()
    setIsDeleting(false)
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'AVAILABLE': return '🔵 Disponibile'
      case 'PROPOSED': return '🟡 Proposta ricevuta'
      case 'CONFIRMED': return '🟢 Confermato'
      case 'DENIED': return '🔴 Rifiutato'
      case 'EXPIRED': return '⚪ Scaduto'
      case 'CANCELLED': return '⚫ Cancellato'
      default: return status
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>📅 Dettagli Disponibilità</h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.eventDetails}>
            <h4>{event.title}</h4>
            
            <div className={styles.detailRow}>
              <strong>📅 Data:</strong>
              <span>{moment(event.start).format('DD/MM/YYYY')}</span>
            </div>
            
            <div className={styles.detailRow}>
              <strong>🕐 Orario:</strong>
              <span>
                {moment(event.start).format('HH:mm')} - 
                {moment(event.end).format('HH:mm')}
              </span>
            </div>
            
            {event.location && (
              <div className={styles.detailRow}>
                <strong>📍 Luogo:</strong>
                <span>{event.location}</span>
              </div>
            )}
            
            <div className={styles.detailRow}>
              <strong>📊 Stato:</strong>
              <span className={styles.statusBadge}>
                {getStatusText(event.status)}
              </span>
            </div>
            
            {event.description && (
              <div className={styles.detailRow}>
                <strong>📝 Note:</strong>
                <p>{event.description}</p>
              </div>
            )}
            
            {event.proposals && event.proposals.length > 0 && (
              <div className={styles.detailRow}>
                <strong>💬 Proposte:</strong>
                <div className={styles.proposalsList}>
                  {event.proposals.map(proposal => (
                    <div key={proposal.id} className={styles.proposalItem}>
                      <span>{proposal.proposer.email.split('@')[0]}</span>
                      <span className={styles.proposalStatus}>
                        {proposal.status === 'PENDING' && '⏳ In attesa'}
                        {proposal.status === 'ACCEPTED' && '✅ Accettata'}
                        {proposal.status === 'REJECTED' && '❌ Rifiutata'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            onClick={onClose}
            className={styles.btnSecondary}
          >
            Chiudi
          </button>
          {(event.status === 'AVAILABLE' || event.status === 'EXPIRED') && (
            <button 
              onClick={handleDelete} 
              className={styles.btnDanger}
              disabled={isDeleting}
            >
              {isDeleting ? '⏳ Eliminazione...' : '🗑️ Elimina'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calendar