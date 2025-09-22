// lib/security/emailValidator.js
import validator from 'validator'
import disposableEmailDomains from 'disposable-email-domains'
import { ERROR_MESSAGES } from '../constants/errorMessages'

/**
 * Validazione email completa
 * @param {string} email 
 * @returns {object} { isValid, error, email? }
 */
export function validateEmail(email) {
  // Controllo base formato
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: ERROR_MESSAGES.EMAIL_REQUIRED }
  }

  // Normalizza email
  const normalizedEmail = email.toLowerCase().trim()

  // Validazione formato
  if (!validator.isEmail(normalizedEmail)) {
    return { isValid: false, error: ERROR_MESSAGES.EMAIL_INVALID_FORMAT }
  }

  // Estrai dominio
  const domain = normalizedEmail.split('@')[1]

  // Controllo domini email temporanee
  if (disposableEmailDomains.includes(domain)) {
    return { isValid: false, error: ERROR_MESSAGES.EMAIL_DISPOSABLE }
  }

  // Controllo domini comuni con typo
  const correctedDomain = suggestDomainCorrection(domain)
  if (correctedDomain && correctedDomain !== domain) {
    return { 
      isValid: false, 
      error: `Forse intendevi: ${normalizedEmail.replace(domain, correctedDomain)}?` 
    }
  }

  // Controllo lunghezza
  if (normalizedEmail.length > 254) {
    return { isValid: false, error: ERROR_MESSAGES.EMAIL_TOO_LONG }
  }

  return { isValid: true, email: normalizedEmail }
}

/**
 * Suggerisce correzioni per domini comuni
 * @param {string} domain 
 * @returns {string|null}
 */
function suggestDomainCorrection(domain) {
  const commonDomains = {
    'gmail.co': 'gmail.com',
    'gmail.co.': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.co.': 'yahoo.com',
    'hotmai.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'outlook.co': 'outlook.com',
    'outlok.com': 'outlook.com'
  }

  return commonDomains[domain] || null
}

/**
 * Validazione password
 * @param {string} password 
 * @returns {object} { isValid, error }
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_REQUIRED }
  }

  if (password.length < 6) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT }
  }

  if (password.length > 128) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_LONG }
  }

  // Controllo password comuni
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', '111111', '123123', 'admin', 'letmein'
  ]

  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_COMMON }
  }

  return { isValid: true }
}

/**
 * Sanitizza input stringa
 * @param {string} input 
 * @param {number} maxLength 
 * @returns {string}
 */
export function sanitizeInput(input, maxLength = 255) {
  if (!input || typeof input !== 'string') return ''
  
  return validator.escape(input.trim()).substring(0, maxLength)
}