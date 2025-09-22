// lib/middleware/security.js
import { validateEmail, validatePassword, sanitizeInput } from '../security/emailValidator'

/**
 * Middleware per validazione input registrazione
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export function validateRegistrationInput(req, res, next) {
  const { email, password, comune, livello, telefono } = req.body

  // Validazione email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return res.status(400).json({ error: emailValidation.error })
  }

  // Validazione password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return res.status(400).json({ error: passwordValidation.error })
  }

  // Sanitizza input opzionali
  req.body.email = emailValidation.email
  req.body.comune = sanitizeInput(comune, 100)
  req.body.livello = sanitizeInput(livello, 50)
  req.body.telefono = sanitizeInput(telefono, 20)

  next()
}

/**
 * Middleware per validazione input login
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export function validateLoginInput(req, res, next) {
  const { email, password } = req.body

  // Validazione email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return res.status(400).json({ error: emailValidation.error })
  }

  // Validazione password (solo controllo base per login)
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password è obbligatoria' })
  }

  req.body.email = emailValidation.email

  next()
}

/**
 * Middleware per controllo lockout utente
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export async function checkUserLockout(req, res, next) {
  try {
    const { email } = req.body
    
    // Importa prisma dinamicamente per evitare problemi di import
    const { prisma } = await import('../prisma')
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        loginAttempts: true,
        lockoutUntil: true
      }
    })

    if (user && user.lockoutUntil && new Date() < user.lockoutUntil) {
      const lockoutMinutes = Math.ceil((user.lockoutUntil - new Date()) / (1000 * 60))
      return res.status(423).json({ 
        error: `Account temporaneamente bloccato. Riprova tra ${lockoutMinutes} minuti.` 
      })
    }

    next()
  } catch (error) {
    console.error('Errore controllo lockout:', error)
    next() // Continua anche in caso di errore
  }
}

/**
 * Middleware per logging richieste sospette
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export function logSuspiciousActivity(req, res, next) {
  const suspiciousPatterns = [
    /script/i,
    /<.*>/,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i
  ]

  const requestData = JSON.stringify(req.body)
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.warn('🚨 Attività sospetta rilevata:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        timestamp: new Date().toISOString()
      })
      break
    }
  }

  next()
}

/**
 * Middleware per headers di sicurezza
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
export function securityHeaders(req, res, next) {
  // Previeni clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Previeni MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  next()
}