import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    const { currentPassword, newPassword } = req.body

    // Validazione input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password attuale e nuova password sono obbligatorie' })
    }

    // Validazione nuova password
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nuova password deve essere di almeno 6 caratteri' })
    }

    // Verifica token JWT
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token di autenticazione mancante' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    
    let decoded
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch (error) {
      return res.status(401).json({ error: 'Token non valido' })
    }

    // Trova l'utente e verifica che sia admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        password: true,
        isAdmin: true
      }
    })

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Accesso negato. Solo gli admin possono accedere.' })
    }

    // Verifica password attuale
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Password attuale non corretta' })
    }

    // Hash della nuova password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Aggiorna la password nel database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    res.status(200).json({
      success: true,
      message: 'Password cambiata con successo!'
    })

  } catch (error) {
    console.error('Errore cambio password admin:', error)
    res.status(500).json({ 
      error: 'Errore interno del server' 
    })
  } finally {
    await prisma.$disconnect()
  }
}