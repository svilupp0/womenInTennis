import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuth } from '../hooks/useAuth'
import { useCalendar } from '../hooks/useCalendar'
import { EVENT_STATUS_COLORS } from '../lib/utils/eventColors'
import CreateEventModal from './calendar/CreateEventModal'
import EventDetailsModal from './calendar/EventDetailsModal'
import styles from '../styles/Calendar.module.css'

/**
 * Componente Calendar
 *
 * Componente container per il calendario eventi.
 * Usa useCalendar hook per la logica e modali separati per UI.
 *
 * Responsabilità:
 * - Rendering FullCalendar
 * - Rendering legenda stati
 * - Coordinamento tra hook e modali
 */
const Calendar = () => {
  const { user, token } = useAuth()

  // Hook calendario - tutta la logica estratta
  const {
    calendarEvents,
    isLoading,
    showCreateModal,
    showDetailsModal,
    selectedEvent,
    selectedDate,
    handleDateClick,
    handleEventClick,
    handleCreateEvent,
    handleDeleteEvent,
    closeCreateModal,
    closeDetailsModal,
  } = useCalendar(token, user)

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
            right: 'today',
          }}
          locale="it"
          buttonText={{
            today: 'Oggi',
            month: 'Mese',
            week: 'Settimana',
            day: 'Giorno',
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          aspectRatio={1.2}
          contentHeight={350}
        />
      </div>

      {/* Legenda Stati - Usa constanti centralizzate */}
      <div className={styles.calendarLegend}>
        <h4>Legenda:</h4>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: EVENT_STATUS_COLORS.AVAILABLE }}
            ></span>
            🔵 Disponibile
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: EVENT_STATUS_COLORS.PROPOSED }}
            ></span>
            🟡 Proposta ricevuta
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: EVENT_STATUS_COLORS.CONFIRMED }}
            ></span>
            🟢 Confermato
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: EVENT_STATUS_COLORS.DENIED }}
            ></span>
            🔴 Rifiutato
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: EVENT_STATUS_COLORS.EXPIRED }}
            ></span>
            ⚪ Scaduto
          </div>
        </div>
      </div>

      {/* Modal Creazione Evento */}
      {showCreateModal && (
        <CreateEventModal
          selectedDate={selectedDate}
          onClose={closeCreateModal}
          onSubmit={handleCreateEvent}
        />
      )}

      {/* Modal Dettagli Evento */}
      {showDetailsModal && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={closeDetailsModal}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}

export default Calendar
