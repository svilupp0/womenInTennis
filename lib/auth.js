// 🔐 AUTHENTICATION UTILITIES
// Utilities per gestire autenticazione JWT

import jwt from 'jsonwebtoken'

/**
 * Middleware per autenticazione JWT
 * @param {Request} req - Request object di Next.js
 * @returns {Object} Decoded JWT payload
 * @throws {Error} Se token mancante o non valido
 */
export const authenticateToken = (req) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    throw new Error('Token mancante')
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET non configurato')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token scaduto')
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token non valido')
    }
    throw new Error('Errore verifica token')
  }
}

/**
 * Estrae l'ID utente dal token JWT
 * @param {Object} user - Decoded JWT payload
 * @returns {string|null} User ID
 */
export const getUserIdFromToken = (user) => {
  // Supporta diverse strutture di payload JWT
  return user?.id || user?.sub || user?.userId || null
}

/**
 * Verifica se l'utente è admin
 * @param {Object} user - Decoded JWT payload
 * @returns {boolean} True se admin
 */
export const isAdmin = (user) => {
  return user?.role === 'admin' || user?.isAdmin === true
}

/**
 * Crea un token JWT
 * @param {Object} payload - Dati da includere nel token
 * @param {string} expiresIn - Durata token (default: '7d')
 * @returns {string} JWT token
 */
export const createToken = (payload, expiresIn = '7d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET non configurato')
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}

/**
 * Verifica token senza lanciare errori
 * @param {string} token - Token da verificare
 * @returns {Object|null} Decoded payload o null se non valido
 */
export const verifyTokenSafe = (token) => {
  try {
    if (!token || !process.env.JWT_SECRET) {
      return null
    }
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Estrae token dall'header Authorization
 * @param {Request} req - Request object
 * @returns {string|null} Token o null se non presente
 */
export const extractToken = (req) => {
  const authHeader = req.headers['authorization']
  return authHeader && authHeader.split(' ')[1]
}

// Export default per compatibilità
export default {
  authenticateToken,
  getUserIdFromToken,
  isAdmin,
  createToken,
  verifyTokenSafe,
  extractToken
}