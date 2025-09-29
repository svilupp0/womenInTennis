// lib/middleware/authMiddleware.js
// Middleware per autenticazione centralizzata

import { authenticateToken, getUserIdFromToken } from '../auth'

/**
 * Higher-order function per proteggere API routes con autenticazione JWT
 * @param {Function} handler - API route handler
 * @returns {Function} Protected API route handler
 */
export const withAuth = (handler) => {
  return async (req, res) => {
    try {
      // 🔐 Autenticazione JWT
      const user = authenticateToken(req)
      const userId = getUserIdFromToken(user)

      if (!userId) {
        return res.status(401).json({
          error: 'Token non valido: userId mancante',
          code: 'INVALID_TOKEN'
        })
      }

      // 📝 Aggiungi dati utente alla request per l'handler
      req.user = user
      req.userId = userId

      // 🚀 Esegui l'handler originale
      return await handler(req, res)

    } catch (error) {
      console.error('🚫 Errore autenticazione:', error.message)

      // 📤 Risposta standardizzata per errori auth
      return res.status(401).json({
        error: 'Non autorizzato',
        code: 'UNAUTHORIZED',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

/**
 * Middleware per API che richiedono privilegi admin
 * @param {Function} handler - API route handler
 * @returns {Function} Protected admin API route handler
 */
export const withAdminAuth = (handler) => {
  return withAuth(async (req, res) => {
    // 👑 Verifica privilegi admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        error: 'Accesso negato: privilegi admin richiesti',
        code: 'FORBIDDEN'
      })
    }

    return await handler(req, res)
  })
}

/**
 * Middleware per autenticazione opzionale (non blocca se token mancante)
 * @param {Function} handler - API route handler
 * @returns {Function} API route handler with optional auth
 */
export const withOptionalAuth = (handler) => {
  return async (req, res) => {
    try {
      const user = authenticateToken(req)
      const userId = getUserIdFromToken(user)
      
      req.user = user
      req.userId = userId
    } catch (error) {
      // 🔓 Autenticazione opzionale - continua senza user
      req.user = null
      req.userId = null
    }

    return await handler(req, res)
  }
}

export default {
  withAuth,
  withAdminAuth,
  withOptionalAuth
}