import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validateEmail } from '../../../lib/security/emailValidator'
import { loginLimiter } from '../../../lib/security/rateLimiter'
import { ERROR_MESSAGES, ERROR_CODES } from '../../../lib/constants/errorMessages'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED })
  }

  try {
    await new Promise((resolve, reject) => {
      loginLimiter(req, res, (result) => {
        if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      })
    })
  } catch (error) {
    return res.status(429).json({ error: ERROR_MESSAGES.TOO_MANY_LOGIN_ATTEMPTS })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' })
    }

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
        password: true,
        comune: true,
        sportLevels: {
          select: {
            sport: true,
            livello: true,
          },
        },
        disponibilita: true,
        isAdmin: true,
        emailVerified: true,
        loginAttempts: true,
        lockoutUntil: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: ERROR_MESSAGES.CREDENTIALS_INVALID })
    }

    if (user.lockoutUntil && new Date() < user.lockoutUntil) {
      const lockoutMinutes = Math.ceil((user.lockoutUntil - new Date()) / (1000 * 60))
      return res.status(423).json({ 
        error: `Account temporaneamente bloccato. Riprova tra ${lockoutMinutes} minuti.` 
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      const newAttempts = (user.loginAttempts || 0) + 1
      const lockoutUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockoutUntil: lockoutUntil
        }
      })

      if (lockoutUntil) {
        return res.status(423).json({ 
          error: 'Troppi tentativi falliti. Account bloccato per 15 minuti.' 
        })
      }

      return res.status(401).json({ error: ERROR_MESSAGES.CREDENTIALS_INVALID })
    }

    // CONTROLLO CRITICO: Email deve essere verificata
    if (!user.emailVerified) {
      return res.status(403).json({
        error: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
        code: ERROR_CODES.EMAIL_NOT_VERIFIED,
        email: user.email
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockoutUntil: null
      }
    })

    const { password: _, loginAttempts, lockoutUntil, ...userWithoutPassword } = user

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified
      },
      jwtSecret,
      { 
        expiresIn: '24h'
      }
    )

    res.status(200).json({
      success: true,
      message: ERROR_MESSAGES.LOGIN_SUCCESS,
      user: userWithoutPassword,
      token: token
    })

  } catch (error) {
    console.error('Errore login:', error)

    res.status(500).json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}