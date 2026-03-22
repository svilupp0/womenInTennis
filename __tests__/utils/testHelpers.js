/**
 * Test Helpers - Utility comuni per i test
 */

// Mock user factory
export const mockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  comune: 'Roma',
  emailVerified: true,
  disponibilita: true,
  telefono: '+39 333 1234567',
  loginAttempts: 0,
  lockoutUntil: null,
  isAdmin: false,
  createdAt: new Date('2024-01-01'),
  ...overrides,
})

// Mock event factory
export const mockEvent = (overrides = {}) => ({
  id: 1,
  title: 'Test Event',
  start: new Date(Date.now() + 3600000),
  end: new Date(Date.now() + 7200000),
  status: 'AVAILABLE',
  sport: 'TENNIS',
  userId: 1,
  ...overrides,
})

// Mock report factory
export const mockReport = (overrides = {}) => ({
  id: 1,
  reporterId: 1,
  reportedId: 2,
  reason: 'INAPPROPRIATE_BEHAVIOR',
  description: 'Test description',
  status: 'PENDING',
  createdAt: new Date('2024-01-01'),
  ...overrides,
})

// Mock fetch response - successo
export const mockFetchSuccess = (data) => ({
  ok: true,
  json: async () => data,
  status: 200,
})

// Mock fetch response - errore
export const mockFetchError = (status = 500, message = 'Error') => ({
  ok: false,
  json: async () => ({ error: message }),
  status,
})

// Helper per mockare fetch globale
export const setupFetchMock = (responseData, options = {}) => {
  const { ok = true, status = 200 } = options
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => responseData,
  })
}

// Helper per asserire su ApiError
export const expectApiError = (fn, expectedMessage, expectedStatus) => {
  expect(fn).toThrow(expectedMessage)
  try {
    fn()
  } catch (error) {
    if (expectedStatus) {
      expect(error.statusCode).toBe(expectedStatus)
    }
  }
}
