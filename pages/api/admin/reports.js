import { prisma } from '../../../lib/prisma'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  // Solo metodo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
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

    // Verifica che l'utente sia admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    })

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Accesso negato. Solo gli admin possono accedere.' })
    }

    // Ottieni tutte le segnalazioni con dettagli utenti
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            comune: true,
            livello: true,
            createdAt: true
          }
        },
        reported: {
          select: {
            id: true,
            email: true,
            comune: true,
            livello: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json({
      success: true,
      reports: reports
    })

  } catch (error) {
    console.error('Errore API admin reports:', error)
    res.status(500).json({ 
      error: 'Errore interno del server' 
    })
  } finally {
    await prisma.$disconnect()
  }
}