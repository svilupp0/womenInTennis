// pages/api/calendar/public.js
// API per vedere eventi disponibili di altre utenti

import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verifica autenticazione
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    // Parametri di filtro
    const { comune, livello, date } = req.query

    // Costruisci filtri per utenti
    const userFilters = {
      id: {
        not: userId // Escludi eventi dell'utente corrente
      },
      disponibilita: true // Solo utenti disponibili
    }

    if (comune) {
      userFilters.comune = comune
    }

    if (livello) {
      userFilters.livello = livello
    }

    // Costruisci filtri per eventi
    const eventFilters = {
      status: 'AVAILABLE', // Solo eventi disponibili
      start: {
        gte: new Date() // Solo eventi futuri
      }
    }

    if (date) {
      const selectedDate = new Date(date)
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      eventFilters.start = {
        gte: selectedDate,
        lt: nextDay
      }
    }

    // Ottieni eventi disponibili
    const availableEvents = await prisma.event.findMany({
      where: {
        ...eventFilters,
        user: userFilters
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            comune: true,
            livello: true,
            telefono: true
          }
        }
      },
      orderBy: [
        {
          start: 'asc'
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    // Aggiungi colore e formatta per il frontend
    const formattedEvents = availableEvents.map(event => ({
      ...event,
      color: '#3c70f2', // Blu per disponibili
      // Nascondi informazioni sensibili se necessario
      user: {
        ...event.user,
        // Mostra solo prime lettere dell'email per privacy
        displayName: event.user.email.split('@')[0]
      }
    }))

    return res.status(200).json({ 
      events: formattedEvents,
      count: formattedEvents.length,
      filters: {
        comune,
        livello,
        date
      }
    })

  } catch (error) {
    console.error('Errore caricamento eventi pubblici:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}