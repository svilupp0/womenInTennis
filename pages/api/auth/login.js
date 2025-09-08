import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    const { email, password } = req.body

    // Validazione input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' })
    }

    // Validazione email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato email non valido' })
    }

    // Trova utente nel database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        comune: true,
        livello: true,
        disponibilita: true,
        createdAt: true
      }
    })

    // Verifica se l'utente esiste
    if (!user) {
      // Messaggio generico per sicurezza (non rivelare se email esiste)
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

    // Verifica password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      // Messaggio generico per sicurezza
      return res.status(401).json({ error: 'Credenziali non valide' })
    }

    // Login successful - rimuovi password dalla risposta
    const { password: _, ...userWithoutPassword } = user

    // Genera JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      jwtSecret,
      { 
        expiresIn: '24h' // Token valido per 24 ore
      }
    )

    // Risposta di successo con JWT
    res.status(200).json({
      success: true,
      message: 'Login effettuato con successo!',
      user: userWithoutPassword,
      token: token
    })

  } catch (error) {
    console.error('Errore login:', error)

    // Errore generico per sicurezza
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  } finally {
    // Disconnetti Prisma
    await prisma.$disconnect()
  }
}