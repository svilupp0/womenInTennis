// pages/api/auth/reset-password.js
// API per conferma reset password

import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Metodo non consentito. Usa POST.' 
    })
  }

  try {
    const { token, email, password, confirmPassword } = req.body

    // Validazione input
    if (!token || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Tutti i campi sono obbligatori'
      })
    }

    // Validazione password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Le password non coincidono'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La password deve essere di almeno 8 caratteri'
      })
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Formato email non valido'
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Trova utente con token valido
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date() // Token non scaduto
        }
      },
      select: {
        id: true,
        email: true,
        resetPasswordToken: true,
        resetPasswordTokenExpiry: true,
        loginAttempts: true
      }
    })

    if (!user) {
      console.log(`🚫 Token reset non valido o scaduto per: ${normalizedEmail}`)
      return res.status(400).json({
        success: false,
        error: 'Token non valido o scaduto. Richiedi un nuovo reset password.'
      })
    }

    // Hash della nuova password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Aggiorna password e pulisci token di reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
        // Reset anche i tentativi di login falliti
        loginAttempts: 0,
        lockoutUntil: null,
        updatedAt: new Date()
      }
    })

    // Log per audit
    console.log(`✅ Password resettata con successo per: ${normalizedEmail}`)

    // Risposta di successo
    return res.status(200).json({
      success: true,
      message: 'Password aggiornata con successo. Ora puoi effettuare il login.'
    })

  } catch (error) {
    console.error('❌ Errore reset password:', error)

    // Gestione errori specifici
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      })
    }

    if (error.code?.startsWith('P')) {
      console.error('🗄️ Errore database Prisma:', error.code, error.message)
      return res.status(500).json({
        success: false,
        error: 'Errore database. Riprova più tardi.'
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Errore interno del server. Riprova più tardi.'
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}