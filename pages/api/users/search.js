import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'

async function handler(req, res) {
  // Solo metodo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    // 🔐 userId già validato dal middleware withAuth
    const { userId } = req

    // Estrai parametri di ricerca
    const { comune, sport, livello, disponibilita } = req.query

    // Costruisci filtri per Prisma
    const whereClause = {
      // Escludi l'utente corrente dai risultati
      id: {
        not: userId
      },
      // Escludi gli admin dalla ricerca
      isAdmin: false
    }

    // Aggiungi filtri se specificati
    if (comune && comune.trim() !== '') {
      whereClause.comune = comune
    }

    if (disponibilita === 'true') {
      whereClause.disponibilita = true
    }

    // Filtro per sport e livello - usa relazione sportLevels
    if (sport && sport.trim() !== '') {
      whereClause.sportLevels = {
        some: {
          sport: sport
        }
      }

      // Se specificato anche livello, filtra per livello specifico dello sport
      if (livello && livello.trim() !== '') {
        whereClause.sportLevels.some.livello = livello
      }
    } else if (livello && livello.trim() !== '') {
      // Se livello specificato ma sport no, cerca utenti che hanno quel livello in qualsiasi sport
      whereClause.sportLevels = {
        some: {
          livello: livello
        }
      }
    }

    // Query Prisma per trovare utenti
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        comune: true,
        telefono: true,
        disponibilita: true,
        emailVerified: true,
        createdAt: true,
        sportLevels: {
          select: {
            sport: true,
            livello: true
          }
        },
        // 🆕 AGGIUNGI QUESTO BLOCCO - Eventi disponibili
        events: {
          where: {
            status: 'AVAILABLE',
            start: { 
              gte: new Date(),
              // Limita ai prossimi 7 giorni per performance
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          },
          select: {
            id: true,
            title: true,
            start: true,
            end: true,
            location: true
          },
          orderBy: { start: 'asc' },
          take: 5 // Max 5 slot per utente
        }
      },
      // 🆕 AGGIUNGI QUESTO - Ordinamento utenti
      orderBy: [
        { disponibilita: 'desc' }, // Prima i disponibili
        { createdAt: 'desc' }      // Poi i più recenti
      ],
      take: 50 // Limite massimo risultati per performance
    })

    // Risposta di successo
    res.status(200).json({
      success: true,
      users: users,
      count: users.length,
      filters: {
        comune: comune || null,
        sport: sport || null,
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
  }
  // Nota: Non disconnettiamo il singleton prisma
}

export default withAuth(handler)