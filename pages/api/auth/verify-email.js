// pages/api/auth/verify-email.js
import { prisma } from '../../../lib/prisma'
import { secureTokenCompare, isTokenExpired } from '../../../lib/security/tokenUtils'
import { sendWelcomeEmail } from '../../../lib/services/emailService'
import { verificationLimiter } from '../../../lib/security/rateLimiter'

export default async function handler(req, res) {
  // Solo metodo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  // Applica rate limiting
  try {
    await new Promise((resolve, reject) => {
      verificationLimiter(req, res, (result) => {
        if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      })
    })
  } catch (error) {
    return res.status(429).json({ error: 'Troppi tentativi di verifica. Riprova più tardi.' })
  }

  try {
    const { token, email } = req.query

    // Validazione input
    if (!token || !email) {
      return res.status(400).json({ 
        error: 'Token e email sono obbligatori',
        code: 'MISSING_PARAMS'
      })
    }

    // Trova utente nel database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        verificationToken: true,
        verificationTokenExpiry: true,
        comune: true,
        livello: true
      }
    })

    // Verifica se l'utente esiste
    if (!user) {
      return res.status(404).json({ 
        error: 'Utente non trovato',
        code: 'USER_NOT_FOUND'
      })
    }

    // Verifica se l'email è già verificata
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email già verificata! Puoi fare login.',
        code: 'ALREADY_VERIFIED'
      })
    }

    // Verifica se esiste un token
    if (!user.verificationToken) {
      return res.status(400).json({
        error: 'Token di verifica non trovato. Richiedi un nuovo link.',
        code: 'NO_TOKEN'
      })
    }

    // Verifica se il token è scaduto
    if (isTokenExpired(user.verificationTokenExpiry)) {
      // Rimuovi token scaduto
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: null,
          verificationTokenExpiry: null
        }
      })

      return res.status(400).json({
        error: 'Token di verifica scaduto. Richiedi un nuovo link.',
        code: 'TOKEN_EXPIRED'
      })
    }

    // Confronto sicuro del token
    if (!secureTokenCompare(token, user.verificationToken)) {
      return res.status(400).json({
        error: 'Token di verifica non valido',
        code: 'INVALID_TOKEN'
      })
    }

    // Verifica l'email e rimuovi il token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        comune: true,
        livello: true,
        createdAt: true
      }
    })

    // Invia email di benvenuto (non bloccante)
    sendWelcomeEmail(user.email, user.comune || '').catch(error => {
      console.error('Errore invio email benvenuto:', error)
    })

    // Risposta di successo
    res.status(200).json({
      success: true,
      message: 'Email verificata con successo! Ora puoi fare login.',
      user: updatedUser,
      code: 'VERIFICATION_SUCCESS'
    })

  } catch (error) {
    console.error('Errore verifica email:', error)

    // Gestione errori specifici Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Utente non trovato',
        code: 'USER_NOT_FOUND'
      })
    }

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.',
      code: 'INTERNAL_ERROR'
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}