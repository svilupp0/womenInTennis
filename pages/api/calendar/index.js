// pages/api/calendar/index.js
// API per gestire eventi del calendario

import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return getCalendarEvents(req, res)
  } else if (req.method === 'POST') {
    return createEvent(req, res)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

// GET /api/calendar - Ottieni eventi dell'utente
async function getCalendarEvents(req, res) {
  try {
    // Verifica autenticazione
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    // Ottieni eventi dell'utente
    const events = await prisma.event.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            comune: true,
            livello: true
          }
        },
        proposals: {
          include: {
            proposer: {
              select: {
                id: true,
                email: true,
                comune: true,
                livello: true
              }
            }
          }
        }
      },
      orderBy: {
        start: 'asc'
      }
    })

    // Aggiorna stati scaduti
    const now = new Date()
    const eventsToUpdate = events.filter(event => 
      event.end < now && event.status === 'AVAILABLE'
    )

    if (eventsToUpdate.length > 0) {
      await prisma.event.updateMany({
        where: {
          id: {
            in: eventsToUpdate.map(e => e.id)
          }
        },
        data: {
          status: 'EXPIRED'
        }
      })
    }

    // Assegna colori in base allo stato (come nel codice open source)
    const eventsWithColors = events.map(event => {
      let color = '#3c70f2' // Default blu
      
      switch (event.status) {
        case 'AVAILABLE':
          color = '#3c70f2' // Blu
          break
        case 'PROPOSED':
          color = '#f7f704' // Giallo
          break
        case 'CONFIRMED':
          color = '#00ff2a' // Verde
          break
        case 'DENIED':
          color = '#f73838' // Rosso
          break
        case 'EXPIRED':
          color = '#e0e0e0' // Grigio
          break
        case 'CANCELLED':
          color = '#999999' // Grigio scuro
          break
      }

      return {
        ...event,
        color
      }
    })

    return res.status(200).json({ 
      events: eventsWithColors,
      count: eventsWithColors.length
    })

  } catch (error) {
    console.error('Errore caricamento calendario:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}

// POST /api/calendar - Crea nuovo evento
async function createEvent(req, res) {
  try {
    // Verifica autenticazione
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token mancante' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.userId

    const { title, description, start, end, location } = req.body

    // Validazione
    if (!title || !start || !end) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' })
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (startDate >= endDate) {
      return res.status(400).json({ error: 'Data fine deve essere dopo data inizio' })
    }

    if (startDate < new Date()) {
      return res.status(400).json({ error: 'Non puoi creare eventi nel passato' })
    }

    // Controlla sovrapposizioni
    const overlappingEvents = await prisma.event.findMany({
      where: {
        userId: userId,
        status: {
          in: ['AVAILABLE', 'PROPOSED', 'CONFIRMED']
        },
        OR: [
          {
            start: {
              lt: endDate
            },
            end: {
              gt: startDate
            }
          }
        ]
      }
    })

    if (overlappingEvents.length > 0) {
      return res.status(400).json({ error: 'Hai già un evento in questo orario' })
    }

    // Crea evento
    const newEvent = await prisma.event.create({
      data: {
        userId,
        title,
        description,
        start: startDate,
        end: endDate,
        location,
        status: 'AVAILABLE',
        color: '#3c70f2'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            comune: true,
            livello: true
          }
        }
      }
    })

    return res.status(201).json({ 
      event: newEvent,
      message: 'Evento creato con successo'
    })

  } catch (error) {
    console.error('Errore creazione evento:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}