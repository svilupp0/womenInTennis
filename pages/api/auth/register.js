import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { validateEmail, validatePassword, sanitizeInput } from '../../../lib/security/emailValidator'
import { generateVerificationToken } from '../../../lib/security/tokenUtils'
import { sendVerificationEmail } from '../../../lib/services/emailService'
import { registrationLimiter } from '../../../lib/security/rateLimiter'
import { ERROR_MESSAGES } from '../../../lib/constants/errorMessages'

export default async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED })
  }

  // Applica rate limiting
  try {
    await new Promise((resolve, reject) => {
      registrationLimiter(req, res, (result) => {
        if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      })
    })
  } catch (error) {
    return res.status(429).json({ error: ERROR_MESSAGES.TOO_MANY_REGISTRATION_ATTEMPTS })
  }

  try {
    const { email, password, comune, sportLevels, telefono } = req.body

    // Validazione email avanzata
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error })
    }

    // Validazione password avanzata
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error })
    }

    // Sanitizza input opzionali
    const normalizedEmail = emailValidation.email
    const sanitizedComune = sanitizeInput(comune, 100)
    const sanitizedTelefono = sanitizeInput(telefono, 20)

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        emailVerified: true
      }
    })

    if (existingUser) {
      if (existingUser.emailVerified) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.EMAIL_EXISTS_VERIFIED 
        })
      } else {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.EMAIL_EXISTS_UNVERIFIED 
        })
      }
    }

    // Hash della password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Genera token di verifica
    const { token, expiry } = generateVerificationToken(24) // 24 ore

    // Crea nuovo utente nel database (NON VERIFICATO)
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        comune: sanitizedComune || null,
        telefono: sanitizedTelefono || null,
        disponibilita: true,
        emailVerified: false, // IMPORTANTE: Non verificato
        verificationToken: token,
        verificationTokenExpiry: expiry,
        lastVerificationSent: new Date(),
        // Creazione annidata dei UserSportLevel
        sportLevels: sportLevels ? {
          create: sportLevels.map(sl => ({
            sport: sl.sport,
            livello: sl.livello,
          })),
        } : undefined
      },
      select: {
        id: true,
        email: true,
        comune: true,
        telefono: true,
        disponibilita: true,
        isAdmin: true,
        emailVerified: true,
        createdAt: true,
        sportLevels: {
          select: {
            sport: true,
            livello: true,
          },
        }
        // Non restituiamo mai la password o il token
      }
    })

    // Invia email di verifica
    const emailSent = await sendVerificationEmail(
      normalizedEmail, 
      token, 
      sanitizedComune || ''
    )

    if (!emailSent) {
      // Se l'email non viene inviata, elimina l'utente creato
      await prisma.user.delete({
        where: { id: newUser.id }
      })
      
      return res.status(500).json({ 
        error: 'Errore nell\'invio dell\'email di verifica. Riprova più tardi.' 
      })
    }

    // Risposta di successo (SENZA JWT - utente deve verificare prima)
    res.status(201).json({
      success: true,
      message: ERROR_MESSAGES.REGISTRATION_SUCCESS,
      user: {
        id: newUser.id,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      },
      nextStep: 'EMAIL_VERIFICATION_REQUIRED'
    })

  } catch (error) {
    console.error('Errore registrazione:', error)

    // Gestione errori specifici Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS })
    }

    // Errore generico
    res.status(500).json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}