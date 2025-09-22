// __tests__/utils.test.js
import { validateEmail, validatePassword, sanitizeInput } from '../lib/security/emailValidator'
import { generateVerificationToken, secureTokenCompare, isTokenExpired } from '../lib/security/tokenUtils'

// Mock crypto for consistent testing
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mocked-random-string')
  })),
  timingSafeEqual: jest.fn()
}))

describe('Email Validator', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.email).toBe('test@example.com')
    })

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Formato email non valido')
    })

    it('should reject empty email', () => {
      const result = validateEmail('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Email è obbligatoria')
    })

    it('should normalize email to lowercase', () => {
      const result = validateEmail('TEST@EXAMPLE.COM')
      expect(result.isValid).toBe(true)
      expect(result.email).toBe('test@example.com')
    })

    it('should reject disposable email domains', () => {
      const result = validateEmail('test@10minutemail.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Email temporanee non sono consentite')
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.isValid).toBe(true)
    })

    it('should reject short password', () => {
      const result = validatePassword('123')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('almeno 6 caratteri')
    })

    it('should reject common passwords', () => {
      const result = validatePassword('password')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('troppo comune')
    })

    it('should reject long passwords', () => {
      const longPassword = 'a'.repeat(200)
      const result = validatePassword(longPassword)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('troppo lunga')
    })

    it('should validate simple but secure password', () => {
      const result = validatePassword('mypassword123')
      expect(result.isValid).toBe(true)
    })
  })

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const result = sanitizeInput('  test  ')
      expect(result).toBe('test')
    })

    it('should limit length', () => {
      const longString = 'a'.repeat(200)
      const result = sanitizeInput(longString, 50)
      expect(result.length).toBe(50)
    })

    it('should handle null input', () => {
      const result = sanitizeInput(null)
      expect(result).toBe('')
    })

    it('should handle undefined input', () => {
      const result = sanitizeInput(undefined)
      expect(result).toBe('')
    })
  })
})

describe('Token Utils', () => {
  describe('generateVerificationToken', () => {
    it('should generate token with correct expiry', () => {
      const result = generateVerificationToken(24)
      
      expect(result.token).toBe('mocked-random-string')
      expect(result.expiry).toBeInstanceOf(Date)
      
      // Check expiry is approximately 24 hours from now
      const expectedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const timeDiff = Math.abs(result.expiry.getTime() - expectedExpiry.getTime())
      expect(timeDiff).toBeLessThan(1000) // Within 1 second
    })

    it('should generate different tokens', () => {
      const crypto = require('crypto')
      crypto.randomBytes.mockReturnValueOnce({
        toString: () => 'token1'
      }).mockReturnValueOnce({
        toString: () => 'token2'
      })

      const result1 = generateVerificationToken(1)
      const result2 = generateVerificationToken(1)
      
      expect(result1.token).toBe('token1')
      expect(result2.token).toBe('token2')
    })
  })

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredDate = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      const result = isTokenExpired(expiredDate)
      expect(result).toBe(true)
    })

    it('should return false for valid token', () => {
      const validDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      const result = isTokenExpired(validDate)
      expect(result).toBe(false)
    })

    it('should return true for null expiry', () => {
      const result = isTokenExpired(null)
      expect(result).toBe(true)
    })
  })

  describe('secureTokenCompare', () => {
    it('should use timing-safe comparison', () => {
      const crypto = require('crypto')
      crypto.timingSafeEqual.mockReturnValue(true)

      const result = secureTokenCompare('token1', 'token1')
      
      expect(crypto.timingSafeEqual).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle different length tokens', () => {
      const result = secureTokenCompare('short', 'verylongtoken')
      expect(result).toBe(false)
    })

    it('should handle null tokens', () => {
      const result = secureTokenCompare(null, 'token')
      expect(result).toBe(false)
    })
  })
})