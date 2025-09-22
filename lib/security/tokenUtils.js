// lib/security/tokenUtils.js
import crypto from 'crypto'

/**
 * Genera un token sicuro per verifica email
 * @param {number} length - Lunghezza del token (default: 32)
 * @returns {string} Token esadecimale
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Genera timestamp di scadenza per token
 * @param {number} hours - Ore di validità (default: 24)
 * @returns {Date} Data di scadenza
 */
export function generateTokenExpiry(hours = 24) {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + hours)
  return expiry
}

/**
 * Verifica se un token è scaduto
 * @param {Date} expiry - Data di scadenza
 * @returns {boolean} True se scaduto
 */
export function isTokenExpired(expiry) {
  if (!expiry) return true
  return new Date() > new Date(expiry)
}

/**
 * Genera token di verifica con scadenza
 * @param {number} hours - Ore di validità
 * @returns {object} { token, expiry }
 */
export function generateVerificationToken(hours = 24) {
  return {
    token: generateSecureToken(),
    expiry: generateTokenExpiry(hours)
  }
}

/**
 * Genera token per reset password (più corto, scade prima)
 * @returns {object} { token, expiry }
 */
export function generateResetPasswordToken() {
  return {
    token: generateSecureToken(16), // Token più corto
    expiry: generateTokenExpiry(1)  // Scade in 1 ora
  }
}

/**
 * Confronto sicuro di token (timing attack protection)
 * @param {string} token1 
 * @param {string} token2 
 * @returns {boolean}
 */
export function secureTokenCompare(token1, token2) {
  if (!token1 || !token2) return false
  if (token1.length !== token2.length) return false
  
  return crypto.timingSafeEqual(
    Buffer.from(token1, 'hex'),
    Buffer.from(token2, 'hex')
  )
}