import { prisma } from '../../../lib/prisma'
import { validateEmail } from '../../../lib/security/emailValidator'
import { generateVerificationToken } from '../../../lib/security/tokenUtils'
import { sendVerificationEmail } from '../../../lib/services/emailService'
import { resendEmailLimiter } from '../../../lib/security/rateLimiter'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    await new Promise((resolve, reject) => {
      resendEmailLimiter(req, res, (result) => {
        if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      })
    })
  } catch (error) {
    return res.status(429).json({ error: 'Troppi reinvii email. Riprova tra 1 ora.' })
  }

  try {
    const { email } = req.body

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error })
    }

    const normalizedEmail = emailValidation.email

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        lastVerificationSent: true,
        comune: true
      }
    })

    if (!user) {
      return res.status(404).json({ 
        error: 'Utente non trovato. Verifica di aver inserito l\'email corretta.' 
      })
    }

    if (user.emailVerified) {
      return res.status(400).json({ 
        error: 'Email già verificata! Puoi fare login normalmente.' 
      })
    }

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    
    if (user.lastVerificationSent && user.lastVerificationSent > fiveMinutesAgo) {
      const waitMinutes = Math.ceil((user.lastVerificationSent.getTime() + 5 * 60 * 1000 - now.getTime()) / (1000 * 60))
      return res.status(429).json({ 
        error: `Attendi ${waitMinutes} minuti prima di richiedere un nuovo link.` 
      })
    }

    const { token, expiry } = generateVerificationToken(24)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationTokenExpiry: expiry,
        lastVerificationSent: now
      }
    })

    const emailSent = await sendVerificationEmail(
      normalizedEmail, 
      token, 
      user.comune || ''
    )

    if (!emailSent) {
      return res.status(500).json({ 
        error: 'Errore nell\'invio dell\'email. Riprova più tardi.' 
      })
    }

    res.status(200).json({
      success: true,
      message: 'Email di verifica inviata! Controlla la tua casella di posta.',
      email: normalizedEmail
    })

  } catch (error) {
    console.error('Errore reinvio verifica:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Utente non trovato' 
      })
    }

    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}