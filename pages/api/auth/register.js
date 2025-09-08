import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    const { email, password, comune, livello } = req.body

    // Validazione input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' })
    }

    // Validazione email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato email non valido' })
    }

    // Validazione password lunghezza
    if (password.length < 6) {
      return res.status(400).json({ error: 'La password deve essere di almeno 6 caratteri' })
    }

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Un utente con questa email esiste già' })
    }

    // Hash della password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Crea nuovo utente nel database
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        comune: comune || null,
        livello: livello || null,
        disponibilita: true // Default: disponibile per giocare
      },
      select: {
        id: true,
        email: true,
        comune: true,
        livello: true,
        disponibilita: true,
        createdAt: true
        // Non restituiamo mai la password
      }
    })

    // Genera JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email 
      },
      jwtSecret,
      { 
        expiresIn: '24h' // Token valido per 24 ore
      }
    )

    // Risposta di successo con JWT
    res.status(201).json({
      success: true,
      message: 'Registrazione completata con successo!',
      user: newUser,
      token: token
    })

  } catch (error) {
    console.error('Errore registrazione:', error)

    // Gestione errori specifici Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email già registrata' })
    }

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  } finally {
    // Disconnetti Prisma
    await prisma.$disconnect()
  }
}