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
      return res.status(401).json({ error: 'Token di autenticazione richiesto' })
    }

    const token = authHeader.split(' ')[1]
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    
    let decoded
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch (error) {
      return res.status(401).json({ error: 'Token non valido' })
    }

    // Usa groupBy per ottenere comuni con conteggio giocatrici
    const comuniData = await prisma.user.groupBy({
      by: ['comune'],
      where: {
        comune: {
          not: null // Escludi utenti senza comune
        }
      },
      _count: {
        comune: true
      },
      orderBy: {
        _count: {
          comune: 'desc' // Ordina per numero di giocatrici (più popolati prima)
        }
      }
    })

    // Trasforma i dati per il frontend
    const comuni = comuniData.map(item => ({
      nome: item.comune,
      count: item._count.comune
    }))

    // Risposta di successo
    res.status(200).json({
      success: true,
      comuni: comuni,
      total: comuni.length
    })

  } catch (error) {
    console.error('Errore recupero comuni:', error)

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  } finally {
    // Disconnetti Prisma
    await prisma.$disconnect()
  }
}