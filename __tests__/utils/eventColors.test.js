/**
 * Test per lib/utils/eventColors.js
 * Target: 100% coverage
 */

import {
  EVENT_STATUS_COLORS,
  EVENT_STATUS_LABELS,
  getEventColor,
  getEventStatusLabel,
  applyEventColors,
  isEventExpired,
  getCorrectEventStatus,
  prepareEventsForCalendar,
} from '../../lib/utils/eventColors'

// =============================================
// getEventColor
// =============================================
describe('getEventColor', () => {
  it('dovrebbe restituire colore blu per AVAILABLE', () => {
    expect(getEventColor('AVAILABLE')).toBe(EVENT_STATUS_COLORS.AVAILABLE)
  })

  it('dovrebbe restituire colore verde per CONFIRMED', () => {
    expect(getEventColor('CONFIRMED')).toBe(EVENT_STATUS_COLORS.CONFIRMED)
  })

  it('dovrebbe restituire colore giallo per PROPOSED', () => {
    expect(getEventColor('PROPOSED')).toBe(EVENT_STATUS_COLORS.PROPOSED)
  })

  it('dovrebbe restituire colore rosso per DENIED', () => {
    expect(getEventColor('DENIED')).toBe(EVENT_STATUS_COLORS.DENIED)
  })

  it('dovrebbe restituire colore grigio chiaro per EXPIRED', () => {
    expect(getEventColor('EXPIRED')).toBe(EVENT_STATUS_COLORS.EXPIRED)
  })

  it('dovrebbe restituire colore grigio per CANCELLED', () => {
    expect(getEventColor('CANCELLED')).toBe(EVENT_STATUS_COLORS.CANCELLED)
  })

  it('dovrebbe restituire colore AVAILABLE per stato sconosciuto', () => {
    expect(getEventColor('UNKNOWN_STATUS')).toBe(EVENT_STATUS_COLORS.AVAILABLE)
  })

  it('dovrebbe restituire colore AVAILABLE per undefined', () => {
    expect(getEventColor(undefined)).toBe(EVENT_STATUS_COLORS.AVAILABLE)
  })
})

// =============================================
// getEventStatusLabel
// =============================================
describe('getEventStatusLabel', () => {
  it('dovrebbe restituire label per AVAILABLE', () => {
    expect(getEventStatusLabel('AVAILABLE')).toBe(EVENT_STATUS_LABELS.AVAILABLE)
    expect(getEventStatusLabel('AVAILABLE')).toContain('Disponibile')
  })

  it('dovrebbe restituire label per CONFIRMED', () => {
    expect(getEventStatusLabel('CONFIRMED')).toContain('Confermato')
  })

  it('dovrebbe restituire label per PROPOSED', () => {
    expect(getEventStatusLabel('PROPOSED')).toContain('Proposta')
  })

  it('dovrebbe restituire label per DENIED', () => {
    expect(getEventStatusLabel('DENIED')).toContain('Rifiutato')
  })

  it('dovrebbe restituire label per EXPIRED', () => {
    expect(getEventStatusLabel('EXPIRED')).toContain('Scaduto')
  })

  it('dovrebbe restituire label per CANCELLED', () => {
    expect(getEventStatusLabel('CANCELLED')).toContain('Cancellato')
  })

  it('dovrebbe restituire lo status stesso per stato sconosciuto', () => {
    expect(getEventStatusLabel('CUSTOM_STATUS')).toBe('CUSTOM_STATUS')
  })
})

// =============================================
// applyEventColors
// =============================================
describe('applyEventColors', () => {
  it('dovrebbe aggiungere campo color a ogni evento', () => {
    const events = [
      { id: 1, status: 'AVAILABLE' },
      { id: 2, status: 'CONFIRMED' },
    ]
    const result = applyEventColors(events)
    expect(result[0].color).toBe(EVENT_STATUS_COLORS.AVAILABLE)
    expect(result[1].color).toBe(EVENT_STATUS_COLORS.CONFIRMED)
  })

  it('dovrebbe mantenere tutti i campi originali', () => {
    const events = [{ id: 1, title: 'Test', status: 'AVAILABLE', userId: 5 }]
    const result = applyEventColors(events)
    expect(result[0].id).toBe(1)
    expect(result[0].title).toBe('Test')
    expect(result[0].userId).toBe(5)
  })

  it('dovrebbe restituire array vuoto per array vuoto', () => {
    expect(applyEventColors([])).toEqual([])
  })

  it('dovrebbe restituire array vuoto per non-array', () => {
    expect(applyEventColors(null)).toEqual([])
    expect(applyEventColors(undefined)).toEqual([])
    expect(applyEventColors('stringa')).toEqual([])
  })
})

// =============================================
// isEventExpired
// =============================================
describe('isEventExpired', () => {
  it('dovrebbe restituire true per data passata', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isEventExpired(yesterday.toISOString())).toBe(true)
  })

  it('dovrebbe restituire false per data futura', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isEventExpired(tomorrow.toISOString())).toBe(false)
  })

  it('dovrebbe restituire false per data null', () => {
    expect(isEventExpired(null)).toBe(false)
  })

  it('dovrebbe restituire false per data undefined', () => {
    expect(isEventExpired(undefined)).toBe(false)
  })

  it('dovrebbe gestire oggetto Date direttamente', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)
    expect(isEventExpired(pastDate)).toBe(true)
  })
})

// =============================================
// getCorrectEventStatus
// =============================================
describe('getCorrectEventStatus', () => {
  it('dovrebbe restituire AVAILABLE per evento null', () => {
    expect(getCorrectEventStatus(null)).toBe('AVAILABLE')
  })

  it('dovrebbe mantenere CANCELLED', () => {
    const event = { status: 'CANCELLED', end: new Date(Date.now() - 86400000) }
    expect(getCorrectEventStatus(event)).toBe('CANCELLED')
  })

  it('dovrebbe mantenere CONFIRMED', () => {
    const event = { status: 'CONFIRMED', end: new Date(Date.now() - 86400000) }
    expect(getCorrectEventStatus(event)).toBe('CONFIRMED')
  })

  it('dovrebbe mantenere DENIED', () => {
    const event = { status: 'DENIED', end: new Date(Date.now() - 86400000) }
    expect(getCorrectEventStatus(event)).toBe('DENIED')
  })

  it('dovrebbe cambiare AVAILABLE in EXPIRED se scaduto', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 2)
    const event = { status: 'AVAILABLE', end: pastDate }
    expect(getCorrectEventStatus(event)).toBe('EXPIRED')
  })

  it('dovrebbe mantenere AVAILABLE se non scaduto', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 2)
    const event = { status: 'AVAILABLE', end: futureDate }
    expect(getCorrectEventStatus(event)).toBe('AVAILABLE')
  })

  it('dovrebbe restituire AVAILABLE per evento senza status', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 2)
    const event = { end: futureDate }
    expect(getCorrectEventStatus(event)).toBe('AVAILABLE')
  })
})

// =============================================
// prepareEventsForCalendar
// =============================================
describe('prepareEventsForCalendar', () => {
  it('dovrebbe applicare colori e aggiornare stati scaduti', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 2)

    const events = [
      { id: 1, status: 'AVAILABLE', end: pastDate },
      { id: 2, status: 'CONFIRMED', end: new Date() },
    ]

    const result = prepareEventsForCalendar(events)

    expect(result[0].status).toBe('EXPIRED')
    expect(result[0].color).toBe(EVENT_STATUS_COLORS.EXPIRED)
    expect(result[1].status).toBe('CONFIRMED')
    expect(result[1].color).toBe(EVENT_STATUS_COLORS.CONFIRMED)
  })

  it('dovrebbe mantenere tutti i campi originali', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const events = [{ id: 5, title: 'Test', status: 'AVAILABLE', end: futureDate }]
    const result = prepareEventsForCalendar(events)
    expect(result[0].id).toBe(5)
    expect(result[0].title).toBe('Test')
  })

  it('dovrebbe restituire array vuoto per non-array', () => {
    expect(prepareEventsForCalendar(null)).toEqual([])
    expect(prepareEventsForCalendar(undefined)).toEqual([])
  })

  it('dovrebbe restituire array vuoto per array vuoto', () => {
    expect(prepareEventsForCalendar([])).toEqual([])
  })

  it('dovrebbe aggiungere campo color a tutti gli eventi', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const events = [
      { id: 1, status: 'AVAILABLE', end: futureDate },
      { id: 2, status: 'PROPOSED', end: futureDate },
    ]
    const result = prepareEventsForCalendar(events)
    result.forEach((event) => {
      expect(event).toHaveProperty('color')
    })
  })
})
