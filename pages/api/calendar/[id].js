// pages/api/calendar/[id].js
// API per gestione eventi specifici

import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'

async function handler(req, res) {
  const { id } = req.query
  const eventId = parseInt(id)

  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'ID evento non valido' })
  }

  if (req.method === 'GET') {
    return getEvent(req, res, eventId)
  } else if (req.method === 'PUT') {
    return updateEvent(req, res, eventId)
  } else if (req.method === 'DELETE') {
    return deleteEvent(req, res, eventId)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

// GET /api/calendar/[id] - Ottieni dettagli evento
async function getEvent(req, res, eventId) {
  try {
    // 🔐 userId già validato dal middleware withAuth
    const { userId } = req

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            comune: true,
            sportLevels: {
              select: {
                sport: true,
                livello: true,
              },
            }
          }
        },
        proposals: {
          include: {
            proposer: {
              select: {
                id: true,
                email: true,
                comune: true,
                sportLevels: {
                  select: {
                    sport: true,
                    livello: true,
                  },
                }
              }
            }
          }
        }
      }
    })

    if (!event) {
      return res.status(404).json({ error: 'Evento non trovato' })
    }

    return res.status(200).json({ event })

  } catch (error) {
    console.error('Errore caricamento evento:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}

export default withAuth(handler)

// PUT /api/calendar/[id] - Modifica evento
async function updateEvent(req, res, eventId) {
  try {
    // 🔐 userId già validato dal middleware withAuth
    const { userId } = req

    // Verifica che l'evento appartenga all'utente
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userId
      }
    })

    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento non trovato' })
    }

    // Non permettere modifica se ha proposte pending
    const pendingProposals = await prisma.matchProposal.findMany({
      where: {
        eventId: eventId,
        status: 'PENDING'
      }
    })

    if (pendingProposals.length > 0) {
      return res.status(400).json({ 
        error: 'Non puoi modificare un evento con proposte in attesa' 
      })
    }

    const { title, description, start, end, location, status } = req.body

    // Validazione date se fornite
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)

      if (startDate >= endDate) {
        return res.status(400).json({ error: 'Data fine deve essere dopo data inizio' })
      }

      if (startDate < new Date()) {
        return res.status(400).json({ error: 'Non puoi spostare eventi nel passato' })
      }
    }

    // Aggiorna evento
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(start && { start: new Date(start) }),
        ...(end && { end: new Date(end) }),
        ...(location !== undefined && { location }),
        ...(status && { status })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            comune: true,
            sportLevels: {
              select: {
                sport: true,
                livello: true,
              },
            }
          }
        }
      }
    })

    return res.status(200).json({ 
      event: updatedEvent,
      message: 'Evento aggiornato con successo'
    })

  } catch (error) {
    console.error('Errore aggiornamento evento:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}

// DELETE /api/calendar/[id] - Elimina evento
async function deleteEvent(req, res, eventId) {
  try {
    // 🔐 userId già validato dal middleware withAuth
    const { userId } = req

    // Verifica che l'evento appartenga all'utente
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: userId
      }
    })

    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento non trovato' })
    }

    // Elimina evento (le proposte collegate verranno eliminate automaticamente per CASCADE)
    await prisma.event.delete({
      where: {
        id: eventId
      }
    })

    return res.status(200).json({ 
      message: 'Evento eliminato con successo'
    })

  } catch (error) {
    console.error('Errore eliminazione evento:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
}