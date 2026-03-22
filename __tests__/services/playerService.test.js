/**
 * Test per lib/services/playerService.js
 * Target: 90%+ coverage
 */

import {
  searchPlayers,
  fetchAvailableComuni,
  updateUserProfile,
  updateUserAvailability,
  fetchUserProfile,
  validateProfileData,
  generateWhatsAppUrl,
  generateEmailContact,
} from '../../lib/services/playerService'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

// =============================================
// validateProfileData
// =============================================
describe('validateProfileData', () => {
  it('dovrebbe accettare profilo vuoto (tutti opzionali)', () => {
    const result = validateProfileData({})
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('dovrebbe accettare profilo completo valido', () => {
    const result = validateProfileData({
      name: 'Alice Rossi',
      comune: 'Roma',
      telefono: '+39 333 1234567',
      sportLevels: [{ sport: 'TENNIS', livello: 'Intermedio' }],
    })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe restituire errore per nome troppo corto', () => {
    const result = validateProfileData({ name: 'A' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Il nome deve essere di almeno 2 caratteri')
  })

  it('dovrebbe accettare nome di 2 caratteri', () => {
    const result = validateProfileData({ name: 'Al' })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe restituire errore per nome troppo lungo', () => {
    const result = validateProfileData({ name: 'A'.repeat(101) })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Il nome è troppo lungo (max 100 caratteri)')
  })

  it('dovrebbe ignorare nome null', () => {
    const result = validateProfileData({ name: null })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe restituire errore per comune troppo lungo', () => {
    const result = validateProfileData({ comune: 'A'.repeat(101) })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Il nome del comune è troppo lungo (max 100 caratteri)')
  })

  it('dovrebbe restituire errore per telefono non valido', () => {
    const result = validateProfileData({ telefono: 'abc' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Numero di telefono non valido')
  })

  it('dovrebbe accettare telefono valido', () => {
    const result = validateProfileData({ telefono: '+39 333 1234567' })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe restituire errore per sportLevels non array', () => {
    const result = validateProfileData({ sportLevels: 'non-array' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Sport-livelli deve essere un array')
  })

  it('dovrebbe restituire errore per sport non valido in sportLevels', () => {
    const result = validateProfileData({
      sportLevels: [{ sport: 'CALCIO', livello: 'Intermedio' }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Sport non valido')
  })

  it('dovrebbe restituire errore per livello non valido in sportLevels', () => {
    const result = validateProfileData({
      sportLevels: [{ sport: 'TENNIS', livello: 'Expert' }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Livello non valido')
  })

  it('dovrebbe accettare livelli validi (Principiante, Intermedio, Avanzato)', () => {
    const livelli = ['Principiante', 'Intermedio', 'Avanzato']
    livelli.forEach((livello) => {
      const result = validateProfileData({
        sportLevels: [{ sport: 'TENNIS', livello }],
      })
      expect(result.valid).toBe(true)
    })
  })

  it('dovrebbe accettare sia TENNIS che PADEL', () => {
    const result = validateProfileData({
      sportLevels: [
        { sport: 'TENNIS', livello: 'Intermedio' },
        { sport: 'PADEL', livello: 'Principiante' },
      ],
    })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe raccogliere errori multipli', () => {
    const result = validateProfileData({
      name: 'A',
      telefono: 'abc',
    })
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

// =============================================
// generateWhatsAppUrl
// =============================================
describe('generateWhatsAppUrl', () => {
  it('dovrebbe restituire URL WhatsApp valido', () => {
    const player = { telefono: '+39 333 1234567' }
    const url = generateWhatsAppUrl(player)
    expect(url).toContain('https://wa.me/')
    expect(url).toContain('393331234567')
  })

  it('dovrebbe restituire null per giocatrice senza telefono', () => {
    const player = { email: 'test@example.com' }
    expect(generateWhatsAppUrl(player)).toBeNull()
  })

  it('dovrebbe includere messaggio precompilato', () => {
    const player = { telefono: '+39 333 1234567' }
    const url = generateWhatsAppUrl(player)
    expect(url).toContain('text=')
    expect(url).toContain('Women%20in%20Net')
  })

  it('dovrebbe rimuovere caratteri non numerici dal telefono', () => {
    const player = { telefono: '+39 (333) 123-4567' }
    const url = generateWhatsAppUrl(player)
    expect(url).not.toContain('+')
    expect(url).not.toContain(' ')
    expect(url).not.toContain('(')
    expect(url).not.toContain(')')
    expect(url).not.toContain('-')
  })
})

// =============================================
// generateEmailContact
// =============================================
describe('generateEmailContact', () => {
  it('dovrebbe generare contatto email con subject e body', () => {
    const player = { email: 'alice@example.com' }
    const result = generateEmailContact(player)
    expect(result.subject).toBe('Partner Tennis - Women in Net')
    expect(result.body).toContain('alice')
    expect(result.mailto).toContain('mailto:alice@example.com')
  })

  it('dovrebbe includere location utente se disponibile', () => {
    const player = { email: 'alice@example.com' }
    const currentUser = { location: 'Roma' }
    const result = generateEmailContact(player, currentUser)
    expect(result.body).toContain('Roma')
  })

  it('dovrebbe includere livello utente se disponibile', () => {
    const player = { email: 'alice@example.com' }
    const currentUser = { level: 'Intermedio' }
    const result = generateEmailContact(player, currentUser)
    expect(result.body).toContain('Intermedio')
  })

  it('dovrebbe avere URL mailto ben formattato', () => {
    const player = { email: 'alice@example.com' }
    const result = generateEmailContact(player)
    expect(result.mailto).toContain('subject=')
    expect(result.mailto).toContain('body=')
  })
})

// =============================================
// searchPlayers
// =============================================
describe('searchPlayers', () => {
  it('dovrebbe costruire query string con filtri', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [] }),
    })

    await searchPlayers({ comune: 'Milano', sport: 'TENNIS', livello: 'Intermedio' }, 'token')
    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('comune=Milano')
    expect(calledUrl).toContain('sport=TENNIS')
    expect(calledUrl).toContain('livello=Intermedio')
  })

  it('dovrebbe aggiungere disponibilita=true se filtro attivo', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [] }),
    })

    await searchPlayers({ disponibilita: true }, 'token')
    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('disponibilita=true')
  })

  it('dovrebbe restituire utenti trovati', async () => {
    const mockUsers = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: mockUsers }),
    })

    const result = await searchPlayers({}, 'token')
    expect(result.success).toBe(true)
    expect(result.users).toHaveLength(2)
  })

  it('dovrebbe restituire array vuoto se nessun utente trovato', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    const result = await searchPlayers({}, 'token')
    expect(result.success).toBe(true)
    expect(result.users).toEqual([])
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Non autorizzato' }),
    })

    const result = await searchPlayers({}, 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Non autorizzato')
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    const result = await searchPlayers({}, 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// fetchAvailableComuni
// =============================================
describe('fetchAvailableComuni', () => {
  it('dovrebbe chiamare /api/comuni/available', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ comuni: ['Roma', 'Milano'] }),
    })

    await fetchAvailableComuni()
    expect(global.fetch).toHaveBeenCalledWith('/api/comuni/available')
  })

  it('dovrebbe restituire comuni disponibili', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ comuni: ['Roma', 'Milano'] }),
    })

    const result = await fetchAvailableComuni('token')
    expect(result.success).toBe(true)
    expect(result.comuni).toEqual(['Roma', 'Milano'])
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Errore' }),
    })

    const result = await fetchAvailableComuni('token')
    expect(result.success).toBe(false)
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network'))

    const result = await fetchAvailableComuni('token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// updateUserProfile
// =============================================
describe('updateUserProfile', () => {
  it('dovrebbe aggiornare profilo con successo', async () => {
    const updatedUser = { id: 1, name: 'Alice' }
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, user: updatedUser }),
    })

    const result = await updateUserProfile({ name: 'Alice' }, 'token')
    expect(result.success).toBe(true)
    expect(result.user).toEqual(updatedUser)
  })

  it('dovrebbe gestire risposta ok con success: false', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Errore validazione' }),
    })

    const result = await updateUserProfile({}, 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore validazione')
  })

  it('dovrebbe gestire risposta non ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    })

    const result = await updateUserProfile({}, 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Server error')
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network'))

    const result = await updateUserProfile({}, 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// updateUserAvailability
// =============================================
describe('updateUserAvailability', () => {
  it('dovrebbe aggiornare disponibilità a true', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ disponibilita: true }),
    })

    const result = await updateUserAvailability(true, 'token')
    expect(result.success).toBe(true)
    expect(result.disponibilita).toBe(true)
  })

  it('dovrebbe aggiornare disponibilità a false', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ disponibilita: false }),
    })

    const result = await updateUserAvailability(false, 'token')
    expect(result.success).toBe(true)
    expect(result.disponibilita).toBe(false)
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Errore' }),
    })

    const result = await updateUserAvailability(true, 'token')
    expect(result.success).toBe(false)
  })
})

// =============================================
// fetchUserProfile
// =============================================
describe('fetchUserProfile', () => {
  it('dovrebbe restituire profilo utente', async () => {
    const mockUser = { id: 1, email: 'test@example.com' }
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const result = await fetchUserProfile('token')
    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Non trovato' }),
    })

    const result = await fetchUserProfile('token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Non trovato')
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network'))

    const result = await fetchUserProfile('token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})
