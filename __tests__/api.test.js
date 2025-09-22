// __tests__/api.test.js
import { createMocks } from 'node-mocks-http'
import loginHandler from '../pages/api/auth/login'
import registerHandler from '../pages/api/auth/register'
import verifyEmailHandler from '../pages/api/auth/verify-email'

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock email service
jest.mock('../lib/services/emailService', () => ({
  sendVerificationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}))

// Mock security functions
jest.mock('../lib/security/emailValidator', () => ({
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  sanitizeInput: jest.fn(),
}))

jest.mock('../lib/security/tokenUtils', () => ({
  generateVerificationToken: jest.fn(),
  secureTokenCompare: jest.fn(),
  isTokenExpired: jest.fn(),
}))

jest.mock('../lib/security/rateLimiter', () => ({
  loginLimiter: jest.fn((req, res, next) => next()),
  registrationLimiter: jest.fn((req, res, next) => next()),
  verificationLimiter: jest.fn((req, res, next) => next()),
}))

const { prisma } = require('../lib/prisma')
const bcrypt = require('bcryptjs')
const { sendVerificationEmail } = require('../lib/services/emailService')
const { validateEmail, validatePassword, sanitizeInput } = require('../lib/security/emailValidator')
const { generateVerificationToken, secureTokenCompare, isTokenExpired } = require('../lib/security/tokenUtils')

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await loginHandler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Metodo non consentito'
    })
  })

  it('should login successfully with verified email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      },
    })

    // Mock validations
    validateEmail.mockReturnValue({ isValid: true, email: 'test@example.com' })
    
    // Mock user found and verified
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      emailVerified: true,
      loginAttempts: 0,
      lockoutUntil: null,
    })

    // Mock password comparison
    bcrypt.compare.mockResolvedValue(true)

    // Mock user update (reset login attempts)
    prisma.user.update.mockResolvedValue({})

    await loginHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.user.email).toBe('test@example.com')
    expect(data.token).toBeDefined()
  })

  it('should return EMAIL_NOT_VERIFIED for unverified email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'unverified@example.com',
        password: 'password123'
      },
    })

    validateEmail.mockReturnValue({ isValid: true, email: 'unverified@example.com' })
    
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'unverified@example.com',
      password: 'hashed-password',
      emailVerified: false,
      loginAttempts: 0,
      lockoutUntil: null,
    })

    bcrypt.compare.mockResolvedValue(true)

    await loginHandler(req, res)

    expect(res._getStatusCode()).toBe(403)
    const data = JSON.parse(res._getData())
    expect(data.code).toBe('EMAIL_NOT_VERIFIED')
    expect(data.email).toBe('unverified@example.com')
  })

  it('should return error for wrong password', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      },
    })

    validateEmail.mockReturnValue({ isValid: true, email: 'test@example.com' })
    
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      emailVerified: true,
      loginAttempts: 0,
      lockoutUntil: null,
    })

    bcrypt.compare.mockResolvedValue(false)

    await loginHandler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Credenziali non valide')
  })
})

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register user and send verification email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'new@example.com',
        password: 'password123',
        comune: 'Milano',
        livello: 'Intermedio'
      },
    })

    // Mock validations
    validateEmail.mockReturnValue({ isValid: true, email: 'new@example.com' })
    validatePassword.mockReturnValue({ isValid: true })
    sanitizeInput.mockImplementation((input) => input)

    // Mock user doesn't exist
    prisma.user.findUnique.mockResolvedValue(null)

    // Mock token generation
    generateVerificationToken.mockReturnValue({
      token: 'verification-token',
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })

    // Mock user creation
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'new@example.com',
      emailVerified: false,
      comune: 'Milano',
      livello: 'Intermedio'
    })

    // Mock email sending
    sendVerificationEmail.mockResolvedValue(true)

    await registerHandler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.nextStep).toBe('EMAIL_VERIFICATION_REQUIRED')
    expect(sendVerificationEmail).toHaveBeenCalledWith('new@example.com', 'verification-token', 'Milano')
  })

  it('should return error if user already exists', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'existing@example.com',
        password: 'password123'
      },
    })

    validateEmail.mockReturnValue({ isValid: true, email: 'existing@example.com' })
    validatePassword.mockReturnValue({ isValid: true })

    // Mock user exists and is verified
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'existing@example.com',
      emailVerified: true
    })

    await registerHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toContain('Un utente con questa email esiste già ed è verificato')
  })
})

describe('/api/auth/verify-email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should verify email successfully', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        token: 'valid-token',
        email: 'test@example.com'
      },
    })

    // Mock user found with valid token
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: false,
      verificationToken: 'valid-token',
      verificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    })

    // Mock token validation
    isTokenExpired.mockReturnValue(false)
    secureTokenCompare.mockReturnValue(true)

    // Mock user update
    prisma.user.update.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: true,
    })

    await verifyEmailHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.code).toBe('VERIFICATION_SUCCESS')
  })

  it('should return error for expired token', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        token: 'expired-token',
        email: 'test@example.com'
      },
    })

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: false,
      verificationToken: 'expired-token',
      verificationTokenExpiry: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    })

    isTokenExpired.mockReturnValue(true)

    await verifyEmailHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.code).toBe('TOKEN_EXPIRED')
  })
})