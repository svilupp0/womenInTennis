// pages/api/auth/forgot-password.js
// API per richiesta reset password

import { prisma } from '../../../lib/prisma'
import { generateResetPasswordToken } from '../../../lib/security/tokenUtils'
import { sendResetPasswordEmail } from '../../../lib/services/emailService'

export default async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Metodo non consentito. Usa POST.',
    })
  }

  try {
    const { email } = req.body

    // Validazione input
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email è obbligatoria',
      })
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Formato email non valido',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Verifica se l'utente esiste
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        resetPasswordToken: true,
        resetPasswordTokenExpiry: true,
      },
    })

    // ⚠️ SICUREZZA: Non rivelare se l'email esiste o no
    // Restituiamo sempre successo per evitare email enumeration
    if (!user) {
      console.log(`🔍 Tentativo reset per email inesistente: ${normalizedEmail}`)
      return res.status(200).json({
        success: true,
        message: "Se l'email esiste nel sistema, riceverai le istruzioni per il reset",
      })
    }

    // Verifica se l'email è verificata
    if (!user.emailVerified) {
      console.log(`⚠️ Tentativo reset per email non verificata: ${normalizedEmail}`)
      return res.status(400).json({
        success: false,
        error: 'Devi prima verificare la tua email prima di poter resettare la password',
      })
    }

    // Rate limiting: verifica se c'è già un token valido recente
    if (user.resetPasswordToken && user.resetPasswordTokenExpiry) {
      const now = new Date()
      const tokenExpiry = new Date(user.resetPasswordTokenExpiry)

      // Se il token è ancora valido (non scaduto), limita le richieste
      if (tokenExpiry > now) {
        const minutesLeft = Math.ceil((tokenExpiry - now) / (1000 * 60))
        console.log(`🚫 Rate limit: Token ancora valido per ${minutesLeft} minuti`)
        return res.status(429).json({
          success: false,
          error: `Hai già richiesto un reset. Riprova tra ${minutesLeft} minuti o controlla la tua email.`,
        })
      }
    }

    // Genera nuovo token di reset
    const { token: resetToken, expiry: tokenExpiry } = generateResetPasswordToken()

    // Aggiorna utente con nuovo token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: tokenExpiry,
      },
    })

    // Invia email di reset
    const emailSent = await sendResetPasswordEmail(normalizedEmail, resetToken)

    if (!emailSent) {
      // Se l'email fallisce, rimuovi il token dal database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordTokenExpiry: null,
        },
      })

      return res.status(500).json({
        success: false,
        error: "Errore durante l'invio dell'email. Riprova più tardi.",
      })
    }

    // Log per audit
    console.log(`✅ Reset password richiesto per: ${normalizedEmail}`)

    // Risposta di successo
    return res.status(200).json({
      success: true,
      message: "Se l'email esiste nel sistema, riceverai le istruzioni per il reset",
    })
  } catch (error) {
    console.error('❌ Errore richiesta reset password:', error)

    // Gestione errori specifici di Prisma
    if (error.code === 'P2002') {
      return res.status(500).json({
        success: false,
        error: 'Errore database. Riprova più tardi.',
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Errore interno del server. Riprova più tardi.',
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}
