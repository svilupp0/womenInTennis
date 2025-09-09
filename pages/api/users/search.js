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

    // Estrai parametri di ricerca
    const { comune, livello, disponibilita } = req.query

    // Costruisci filtri per Prisma
    const whereClause = {
      // Escludi l'utente corrente dai risultati
      id: {
        not: decoded.userId
      }
    }

    // Aggiungi filtri se specificati
    if (comune && comune.trim() !== '') {
      whereClause.comune = comune
    }

    if (livello && livello.trim() !== '') {
      whereClause.livello = livello
    }

    if (disponibilita === 'true') {
      whereClause.disponibilita = true
    }

    // Query Prisma per trovare utenti
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        comune: true,
        livello: true,
        disponibilita: true,
        createdAt: true
        // Non restituiamo mai la password
      },
      orderBy: [
        { disponibilita: 'desc' }, // Prima gli disponibili
        { createdAt: 'desc' }      // Poi i più recenti
      ],
      take: 50 // Limite massimo risultati
    })

    // Risposta di successo
    res.status(200).json({
      success: true,
      users: users,
      count: users.length,
      filters: {
        comune: comune || null,
        livello: livello || null,
        disponibilita: disponibilita === 'true'
      }
    })

  } catch (error) {
    console.error('Errore ricerca utenti:', error)

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  } finally {
    // Disconnetti Prisma
    await prisma.$disconnect()
  }
}