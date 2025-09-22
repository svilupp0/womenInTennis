// lib/security/rateLimiter.js
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

/**
 * Rate limiter per registrazione
 * Max 3 registrazioni per IP ogni 15 minuti
 */
export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 3, // max 3 tentativi
  message: {
    error: 'Troppi tentativi di registrazione. Riprova tra 15 minuti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usa ipKeyGenerator per gestire correttamente IPv6
  keyGenerator: ipKeyGenerator
})

/**
 * Rate limiter per login
 * Max 5 tentativi per IP ogni 15 minuti
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // max 5 tentativi
  message: {
    error: 'Troppi tentativi di login. Riprova tra 15 minuti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator
})

/**
 * Rate limiter per verifica email
 * Max 5 tentativi per IP ogni ora
 */
export const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // max 5 tentativi
  message: {
    error: 'Troppi tentativi di verifica. Riprova tra 1 ora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator
})

/**
 * Rate limiter per reinvio email
 * Max 3 reinvii per email ogni ora
 */
export const resendEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 3, // max 3 reinvii
  message: {
    error: 'Troppi reinvii email. Riprova tra 1 ora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usa email come chiave, con ipKeyGenerator come fallback per IPv6
  keyGenerator: (req) => req.body?.email || ipKeyGenerator(req)
})

/**
 * Rate limiter generico per API
 * Max 100 richieste per IP ogni 15 minuti
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste
  message: {
    error: 'Troppe richieste. Riprova più tardi.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator
})