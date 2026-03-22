/**
 * Test per lib/services/eventService.js
 * Target: 90%+ coverage
 */

import {
  fetchUserEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  fetchPublicEvents,
  validateEventData,
} from '../../lib/services/eventService'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

// =============================================
// validateEventData
// =============================================
describe('validateEventData', () => {
  const futureStart = new Date(Date.now() + 3600000).toISOString()
  const futureEnd = new Date(Date.now() + 7200000).toISOString()

  it('dovrebbe accettare evento valido', () => {
    const result = validateEventData({
      title: 'Test',
      start: futureStart,
      end: futureEnd,
      sport: 'TENNIS',
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('dovrebbe restituire errore per titolo mancante', () => {
    const result = validateEventData({ start: futureStart, end: futureEnd })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Titolo obbligatorio')
  })

  it('dovrebbe restituire errore per titolo vuoto', () => {
    const result = validateEventData({ title: '   ', start: futureStart, end: futureEnd })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Titolo obbligatorio')
  })

  it('dovrebbe restituire errore per data inizio mancante', () => {
    const result = validateEventData({ title: 'Test', end: futureEnd })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Data/ora inizio obbligatoria')
  })

  it('dovrebbe restituire errore per data fine mancante', () => {
    const result = validateEventData({ title: 'Test', start: futureStart })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Data/ora fine obbligatoria')
  })

  it('dovrebbe restituire errore se fine <= inizio', () => {
    const result = validateEventData({
      title: 'Test',
      start: futureEnd,
      end: futureStart,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('La data/ora di fine deve essere dopo quella di inizio')
  })

  it('dovrebbe restituire errore per evento nel passato', () => {
    const past = new Date(Date.now() - 7200000).toISOString()
    const pastEnd = new Date(Date.now() - 3600000).toISOString()
    const result = validateEventData({ title: 'Test', start: past, end: pastEnd })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Non puoi creare eventi nel passato')
  })

  it('dovrebbe restituire errore per sport non valido', () => {
    const result = validateEventData({
      title: 'Test',
      start: futureStart,
      end: futureEnd,
      sport: 'CALCIO',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Sport non valido')
  })

  it('dovrebbe accettare PADEL come sport valido', () => {
    const result = validateEventData({
      title: 'Test',
      start: futureStart,
      end: futureEnd,
      sport: 'PADEL',
    })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe accettare evento senza sport (sport opzionale)', () => {
    const result = validateEventData({
      title: 'Test',
      start: futureStart,
      end: futureEnd,
    })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe raccogliere errori multipli', () => {
    const result = validateEventData({})
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

// =============================================
// fetchUserEvents
// =============================================
describe('fetchUserEvents', () => {
  it('dovrebbe chiamare /api/calendar', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    })

    await fetchUserEvents()
    expect(global.fetch).toHaveBeenCalledWith('/api/calendar')
  })

  it('dovrebbe restituire eventi preparati per calendario', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    const mockEvents = [{ id: 1, status: 'AVAILABLE', end: futureDate }]
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ events: mockEvents }),
    })

    const result = await fetchUserEvents()
    expect(result.success).toBe(true)
    expect(result.events).toHaveLength(1)
    expect(result.events[0]).toHaveProperty('color')
  })

  it('dovrebbe gestire array eventi vuoto', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    const result = await fetchUserEvents()
    expect(result.success).toBe(true)
    expect(result.events).toEqual([])
  })

  it('dovrebbe restituire errore per risposta non ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Non autorizzato' }),
    })

    const result = await fetchUserEvents()
    expect(result.success).toBe(false)
    expect(result.error).toBe('Non autorizzato')
  })

  it('dovrebbe restituire errore di connessione per eccezione fetch', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    const result = await fetchUserEvents()
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// createEvent
// =============================================
describe('createEvent', () => {
  it('dovrebbe restituire errore per date mancanti', async () => {
    const result = await createEvent({ title: 'Test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Data inizio e fine obbligatorie')
  })

  it('dovrebbe restituire errore se end <= start', async () => {
    const start = new Date(Date.now() + 7200000).toISOString()
    const end = new Date(Date.now() + 3600000).toISOString()
    const result = await createEvent({ start, end })
    expect(result.success).toBe(false)
    expect(result.error).toContain('fine deve essere dopo')
  })

  it('dovrebbe creare evento con successo', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()
    const mockEvent = { id: 1, title: 'Test', start, end }

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ event: mockEvent }),
    })

    const result = await createEvent({ title: 'Test', start, end })
    expect(result.success).toBe(true)
    expect(result.event).toEqual(mockEvent)
  })

  it('dovrebbe chiamare POST /api/calendar', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ event: {} }),
    })

    await createEvent({ title: 'Test', start, end })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/calendar',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('dovrebbe gestire errore API', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()

    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Errore server' }),
    })

    const result = await createEvent({ title: 'Test', start, end })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore server')
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()

    global.fetch.mockRejectedValue(new Error('Network error'))

    const result = await createEvent({ title: 'Test', start, end })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// deleteEvent
// =============================================
describe('deleteEvent', () => {
  it('dovrebbe restituire errore per eventId mancante', async () => {
    const result = await deleteEvent(null)
    expect(result.success).toBe(false)
    expect(result.error).toBe('ID evento mancante')
  })

  it('dovrebbe eliminare evento con successo', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    const result = await deleteEvent(1)
    expect(result.success).toBe(true)
  })

  it('dovrebbe chiamare DELETE /api/calendar/[id]', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({}) })

    await deleteEvent(42)
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/calendar/42',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Non autorizzato' }),
    })

    const result = await deleteEvent(1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Non autorizzato')
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    const result = await deleteEvent(1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// updateEvent
// =============================================
describe('updateEvent', () => {
  it('dovrebbe restituire errore per eventId mancante', async () => {
    const result = await updateEvent(null, {})
    expect(result.success).toBe(false)
    expect(result.error).toBe('ID evento mancante')
  })

  it('dovrebbe aggiornare evento con successo', async () => {
    const updatedEvent = { id: 1, title: 'Aggiornato' }
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ event: updatedEvent }),
    })

    const result = await updateEvent(1, { title: 'Aggiornato' })
    expect(result.success).toBe(true)
    expect(result.event).toEqual(updatedEvent)
  })

  it('dovrebbe chiamare PUT /api/calendar/[id]', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ event: {} }),
    })

    await updateEvent(7, { title: 'Test' })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/calendar/7',
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Errore aggiornamento' }),
    })

    const result = await updateEvent(1, {})
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore aggiornamento')
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    const result = await updateEvent(1, {})
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// fetchPublicEvents
// =============================================
describe('fetchPublicEvents', () => {
  it('dovrebbe costruire query string con filtri', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    })

    await fetchPublicEvents({ comune: 'Roma', sport: 'TENNIS' })
    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('comune=Roma')
    expect(calledUrl).toContain('sport=TENNIS')
  })

  it('dovrebbe restituire eventi con colori applicati', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [{ id: 1, status: 'AVAILABLE', end: futureDate }] }),
    })

    const result = await fetchPublicEvents({})
    expect(result.success).toBe(true)
    expect(result.events[0]).toHaveProperty('color')
  })

  it('dovrebbe gestire filtri startDate e endDate', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    })

    await fetchPublicEvents({ startDate: '2024-01-01', endDate: '2024-12-31' })
    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('startDate=')
    expect(calledUrl).toContain('endDate=')
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Errore' }),
    })

    const result = await fetchPublicEvents({})
    expect(result.success).toBe(false)
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network'))

    const result = await fetchPublicEvents({})
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})
