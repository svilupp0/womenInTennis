/**
 * Test per lib/services/reportService.js
 * Target: 90%+ coverage
 */

import {
  createReport,
  fetchMyReports,
  fetchReportStats,
  validateReportData,
  getReportReasonLabel,
  getReportStatusLabel,
  getReportStatusClass,
  formatReportDate,
  canEditReport,
  canDeleteReport,
  countReportsByStatus,
  filterReportsByStatus,
} from '../../lib/services/reportService'

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

// =============================================
// validateReportData
// =============================================
describe('validateReportData', () => {
  it('dovrebbe accettare segnalazione valida', () => {
    const result = validateReportData({
      reportedId: 2,
      reason: 'INAPPROPRIATE_BEHAVIOR',
      description: 'Descrizione valida',
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('dovrebbe restituire errore per reportedId mancante', () => {
    const result = validateReportData({ reason: 'SPAM' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Utente da segnalare non specificato')
  })

  it('dovrebbe restituire errore per reason mancante', () => {
    const result = validateReportData({ reportedId: 2 })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Seleziona un motivo per la segnalazione')
  })

  it('dovrebbe restituire errore per reason non valida', () => {
    const result = validateReportData({ reportedId: 2, reason: 'MOTIVO_FINTO' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Motivo non valido')
  })

  it('dovrebbe accettare tutti i motivi validi', () => {
    const validReasons = [
      'INAPPROPRIATE_BEHAVIOR',
      'FAKE_PROFILE',
      'HARASSMENT',
      'SPAM',
      'NO_SHOW',
      'OTHER',
    ]
    validReasons.forEach((reason) => {
      const result = validateReportData({ reportedId: 2, reason })
      expect(result.valid).toBe(true)
    })
  })

  it('dovrebbe restituire errore per descrizione troppo lunga', () => {
    const result = validateReportData({
      reportedId: 2,
      reason: 'SPAM',
      description: 'A'.repeat(1001),
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Descrizione troppo lunga (max 1000 caratteri)')
  })

  it('dovrebbe accettare descrizione di esattamente 1000 caratteri', () => {
    const result = validateReportData({
      reportedId: 2,
      reason: 'SPAM',
      description: 'A'.repeat(1000),
    })
    expect(result.valid).toBe(true)
  })

  it('dovrebbe accettare senza descrizione (opzionale)', () => {
    const result = validateReportData({ reportedId: 2, reason: 'SPAM' })
    expect(result.valid).toBe(true)
  })
})

// =============================================
// getReportReasonLabel
// =============================================
describe('getReportReasonLabel', () => {
  it('dovrebbe restituire label italiana per INAPPROPRIATE_BEHAVIOR', () => {
    expect(getReportReasonLabel('INAPPROPRIATE_BEHAVIOR')).toBe('Comportamento inappropriato')
  })

  it('dovrebbe restituire label per FAKE_PROFILE', () => {
    expect(getReportReasonLabel('FAKE_PROFILE')).toBe('Profilo falso')
  })

  it('dovrebbe restituire label per HARASSMENT', () => {
    expect(getReportReasonLabel('HARASSMENT')).toBe('Molestie')
  })

  it('dovrebbe restituire label per SPAM', () => {
    expect(getReportReasonLabel('SPAM')).toBe('Spam')
  })

  it('dovrebbe restituire label per NO_SHOW', () => {
    expect(getReportReasonLabel('NO_SHOW')).toBe('Non si è presentata')
  })

  it('dovrebbe restituire label per OTHER', () => {
    expect(getReportReasonLabel('OTHER')).toBe('Altro')
  })

  it('dovrebbe restituire il valore stesso per reason sconosciuta', () => {
    expect(getReportReasonLabel('UNKNOWN')).toBe('UNKNOWN')
  })
})

// =============================================
// getReportStatusLabel
// =============================================
describe('getReportStatusLabel', () => {
  it('dovrebbe restituire label per PENDING', () => {
    expect(getReportStatusLabel('PENDING')).toContain('In attesa')
  })

  it('dovrebbe restituire label per REVIEWED', () => {
    expect(getReportStatusLabel('REVIEWED')).toContain('Revisionata')
  })

  it('dovrebbe restituire label per RESOLVED', () => {
    expect(getReportStatusLabel('RESOLVED')).toContain('Risolta')
  })

  it('dovrebbe restituire label per DISMISSED', () => {
    expect(getReportStatusLabel('DISMISSED')).toContain('Respinta')
  })

  it('dovrebbe restituire il valore stesso per stato sconosciuto', () => {
    expect(getReportStatusLabel('CUSTOM')).toBe('CUSTOM')
  })
})

// =============================================
// getReportStatusClass
// =============================================
describe('getReportStatusClass', () => {
  it('dovrebbe restituire classe minuscola per PENDING', () => {
    expect(getReportStatusClass('PENDING')).toBe('pending')
  })

  it('dovrebbe restituire classe minuscola per RESOLVED', () => {
    expect(getReportStatusClass('RESOLVED')).toBe('resolved')
  })

  it('dovrebbe restituire "pending" per status null', () => {
    expect(getReportStatusClass(null)).toBe('pending')
  })

  it('dovrebbe restituire "pending" per status undefined', () => {
    expect(getReportStatusClass(undefined)).toBe('pending')
  })
})

// =============================================
// formatReportDate
// =============================================
describe('formatReportDate', () => {
  it('dovrebbe formattare una data valida', () => {
    const date = '2024-01-15T10:30:00Z'
    const result = formatReportDate(date)
    expect(result).toContain('2024')
    expect(result.length).toBeGreaterThan(0)
  })

  it('dovrebbe restituire stringa vuota per date null', () => {
    expect(formatReportDate(null)).toBe('')
  })

  it('dovrebbe restituire stringa vuota per date undefined', () => {
    expect(formatReportDate(undefined)).toBe('')
  })

  it('dovrebbe gestire oggetto Date', () => {
    const date = new Date('2024-06-15')
    const result = formatReportDate(date)
    expect(result).toContain('2024')
  })
})

// =============================================
// canEditReport
// =============================================
describe('canEditReport', () => {
  it('dovrebbe restituire true per autore con PENDING', () => {
    const report = { reporterId: 1, status: 'PENDING' }
    expect(canEditReport(report, 1)).toBe(true)
  })

  it('dovrebbe restituire false per altro utente', () => {
    const report = { reporterId: 1, status: 'PENDING' }
    expect(canEditReport(report, 2)).toBe(false)
  })

  it('dovrebbe restituire false per REVIEWED', () => {
    const report = { reporterId: 1, status: 'REVIEWED' }
    expect(canEditReport(report, 1)).toBe(false)
  })

  it('dovrebbe restituire false per RESOLVED', () => {
    const report = { reporterId: 1, status: 'RESOLVED' }
    expect(canEditReport(report, 1)).toBe(false)
  })

  it('dovrebbe restituire false per DISMISSED', () => {
    const report = { reporterId: 1, status: 'DISMISSED' }
    expect(canEditReport(report, 1)).toBe(false)
  })

  it('dovrebbe restituire false per report null', () => {
    expect(canEditReport(null, 1)).toBe(false)
  })

  it('dovrebbe restituire false per userId null', () => {
    const report = { reporterId: 1, status: 'PENDING' }
    expect(canEditReport(report, null)).toBe(false)
  })
})

// =============================================
// canDeleteReport
// =============================================
describe('canDeleteReport', () => {
  it('dovrebbe restituire true per autore con PENDING', () => {
    const report = { reporterId: 5, status: 'PENDING' }
    expect(canDeleteReport(report, 5)).toBe(true)
  })

  it('dovrebbe restituire false per altro utente', () => {
    const report = { reporterId: 5, status: 'PENDING' }
    expect(canDeleteReport(report, 3)).toBe(false)
  })

  it('dovrebbe restituire false per stato non PENDING', () => {
    const report = { reporterId: 5, status: 'RESOLVED' }
    expect(canDeleteReport(report, 5)).toBe(false)
  })

  it('dovrebbe restituire false per report null', () => {
    expect(canDeleteReport(null, 1)).toBe(false)
  })

  it('dovrebbe restituire false per userId undefined', () => {
    const report = { reporterId: 1, status: 'PENDING' }
    expect(canDeleteReport(report, undefined)).toBe(false)
  })
})

// =============================================
// countReportsByStatus
// =============================================
describe('countReportsByStatus', () => {
  it('dovrebbe contare segnalazioni per stato', () => {
    const reports = [{ status: 'PENDING' }, { status: 'PENDING' }, { status: 'RESOLVED' }]
    const result = countReportsByStatus(reports)
    expect(result.PENDING).toBe(2)
    expect(result.RESOLVED).toBe(1)
  })

  it('dovrebbe usare PENDING come default per status mancante', () => {
    const reports = [{ id: 1 }]
    const result = countReportsByStatus(reports)
    expect(result.PENDING).toBe(1)
  })

  it('dovrebbe restituire oggetto vuoto per non-array', () => {
    expect(countReportsByStatus(null)).toEqual({})
    expect(countReportsByStatus(undefined)).toEqual({})
  })

  it('dovrebbe restituire oggetto vuoto per array vuoto', () => {
    expect(countReportsByStatus([])).toEqual({})
  })
})

// =============================================
// filterReportsByStatus
// =============================================
describe('filterReportsByStatus', () => {
  const reports = [
    { id: 1, status: 'PENDING' },
    { id: 2, status: 'RESOLVED' },
    { id: 3, status: 'PENDING' },
  ]

  it('dovrebbe filtrare per stato', () => {
    const result = filterReportsByStatus(reports, 'PENDING')
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.status === 'PENDING')).toBe(true)
  })

  it('dovrebbe restituire tutti se status non specificato', () => {
    const result = filterReportsByStatus(reports, null)
    expect(result).toHaveLength(3)
  })

  it('dovrebbe restituire array vuoto per non-array', () => {
    expect(filterReportsByStatus(null, 'PENDING')).toEqual([])
    expect(filterReportsByStatus(undefined, 'PENDING')).toEqual([])
  })

  it('dovrebbe restituire array vuoto se nessun match', () => {
    const result = filterReportsByStatus(reports, 'DISMISSED')
    expect(result).toHaveLength(0)
  })
})

// =============================================
// createReport
// =============================================
describe('createReport', () => {
  it('dovrebbe restituire errore di validazione', async () => {
    const result = await createReport({})
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('dovrebbe creare segnalazione con successo', async () => {
    const mockReport = { id: 1, reason: 'SPAM', status: 'PENDING' }
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ report: mockReport }),
    })

    const result = await createReport({ reportedId: 2, reason: 'SPAM' }, 'token')
    expect(result.success).toBe(true)
    expect(result.report).toEqual(mockReport)
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Errore server' }),
    })

    const result = await createReport({ reportedId: 2, reason: 'SPAM' }, 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore server')
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network'))

    const result = await createReport({ reportedId: 2, reason: 'SPAM' }, 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// fetchMyReports
// =============================================
describe('fetchMyReports', () => {
  it('dovrebbe restituire errore per tipo non valido', async () => {
    const result = await fetchMyReports('invalid')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Tipo non valido')
  })

  it('dovrebbe caricare segnalazioni di tipo "given"', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ reports: [{ id: 1 }] }),
    })

    const result = await fetchMyReports('given', 'token')
    expect(result.success).toBe(true)
    expect(result.reports).toHaveLength(1)
  })

  it('dovrebbe caricare segnalazioni di tipo "received"', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ reports: [] }),
    })

    const result = await fetchMyReports('received', 'token')
    expect(result.success).toBe(true)
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Errore' }),
    })

    const result = await fetchMyReports('given', 'token')
    expect(result.success).toBe(false)
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network'))

    const result = await fetchMyReports('given', 'token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})

// =============================================
// fetchReportStats
// =============================================
describe('fetchReportStats', () => {
  it('dovrebbe caricare statistiche', async () => {
    const mockStats = { total: 10, pending: 5, resolved: 5 }
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ stats: mockStats }),
    })

    const result = await fetchReportStats('token')
    expect(result.success).toBe(true)
    expect(result.stats).toEqual(mockStats)
  })

  it('dovrebbe gestire errore API', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Non autorizzato' }),
    })

    const result = await fetchReportStats('token')
    expect(result.success).toBe(false)
  })

  it('dovrebbe gestire eccezione di rete', async () => {
    global.fetch.mockRejectedValue(new Error('Network'))

    const result = await fetchReportStats('token')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Errore di connessione')
  })
})
