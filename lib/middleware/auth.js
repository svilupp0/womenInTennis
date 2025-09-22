// lib/middleware/auth.js
// Middleware per autenticazione JWT

import jwt from 'jsonwebtoken'

/**
 * Middleware per verificare token JWT
 * Estrae e verifica il token dall'header Authorization
 * Aggiunge userId al req object se valido
 */
export const authenticateToken = (req, res, next) => {
  try {
    // Verifica presenza header Authorization
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization token missing or malformed',
        details: 'Header Authorization deve essere nel formato: Bearer <token>'
      })
    }
    
    // Estrai token
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        error: 'Token mancante',
        details: 'Token JWT non trovato nell\'header Authorization'
      })
    }

    // Verifica token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message)
      
      // Gestione errori specifici JWT
      let errorMessage = 'Invalid token'
      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'Token expired'
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'Token malformed'
      } else if (jwtError.name === 'NotBeforeError') {
        errorMessage = 'Token not active'
      }
      
      return res.status(401).json({ 
        error: errorMessage, 
        details: jwtError.message 
      })
    }
    
    // Verifica presenza userId nel payload
    if (!decoded.userId) {
      return res.status(401).json({ 
        error: 'Invalid token payload',
        details: 'Token non contiene userId valido'
      })
    }
    
    // Aggiungi userId al request object
    req.userId = decoded.userId
    req.user = decoded // Aggiungi tutto il payload se serve
    
    next()
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ 
      error: 'Authentication error',
      details: 'Errore interno durante verifica autenticazione'
    })
  }
}

/**
 * Wrapper per API routes che richiedono autenticazione
 * Uso: export default withAuth(handler)
 */
export const withAuth = (handler) => {
  return async (req, res) => {
    return new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve(handler(req, res))
        }
      })
    })
  }
}

/**
 * Funzione helper per estrarre token senza middleware
 * Utile per casi specifici dove serve solo il token
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.split(' ')[1]
}

/**
 * Funzione helper per verificare token senza middleware
 * Ritorna il payload decodificato o null se invalido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return null
  }
}

export default authenticateToken