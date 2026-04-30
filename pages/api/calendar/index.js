// pages/api/calendar/index.js
// API per gestione calendario eventi

import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'
import { applyEventColors } from '../../../lib/utils/eventColors'
import {
  withErrorHandler,
  sendSuccess,
  sendError,
  validateHttpMethod,
} from '../../../lib/utils/apiErrors'

async function handler(req, res) {
  validateHttpMethod(req, res, ['GET', 'POST'])

  if (req.method === 'GET') {
    await getEvents(req, res)
  } else if (req.method === 'POST') {
    await createEvent(req, res)
  }
}

// GET /api/calendar - Ottieni eventi dell'utente
async function getEvents(req, res) {
  const { userId } = req

  // Ottieni solo i campi necessari
  const events = await prisma.event.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      start: true,
      end: true,
      location: true,
      sport: true,
      status: true,
      userId: true,
      createdAt: true,
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
          },
        },
      },
      proposals: {
        select: {
          id: true,
          status: true,
          message: true,
          createdAt: true,
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
              },
            },
          },
        },
      },
    },
    orderBy: {
      start: 'asc',
    },
  })

  // Aggiorna stati scaduti
  const now = new Date()
  const eventsToUpdate = events.filter((event) => event.end < now && event.status === 'AVAILABLE')

  if (eventsToUpdate.length > 0) {
    await prisma.event.updateMany({
      where: {
        id: {
          in: eventsToUpdate.map((e) => e.id),
        },
      },
      data: {
        status: 'EXPIRED',
      },
    })
  }

  // Assegna colori in base allo stato (logica centralizzata in eventColors.js)
  const eventsWithColors = applyEventColors(events)

  return sendSuccess(res, {
    events: eventsWithColors,
    count: eventsWithColors.length,
  })
}

// POST /api/calendar - Crea nuovo evento
async function createEvent(req, res) {
  const { userId } = req
  const { title, description, start, end, location, sport } = req.body

  // Validazione campi obbligatori
  if (!title || !start || !end) {
    return sendError(res, 'Campi obbligatori mancanti')
  }

  // Validazione sport
  const validSports = ['TENNIS', 'PADEL']
  if (sport && !validSports.includes(sport)) {
    return sendError(res, `Sport non valido. Usa: ${validSports.join(', ')}`)
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  if (startDate >= endDate) {
    return sendError(res, 'Data fine deve essere dopo data inizio')
  }

  if (startDate < new Date()) {
    return sendError(res, 'Non puoi creare eventi nel passato')
  }

  // Controlla sovrapposizioni
  const overlappingEvents = await prisma.event.findMany({
    where: {
      userId: userId,
      status: {
        in: ['AVAILABLE', 'PROPOSED', 'CONFIRMED'],
      },
      OR: [
        {
          start: {
            lt: endDate,
          },
          end: {
            gt: startDate,
          },
        },
      ],
    },
  })

  if (overlappingEvents.length > 0) {
    return sendError(res, 'Hai già un evento in questo orario', 409)
  }

  // Crea evento selezionando solo campi necessari
  const newEvent = await prisma.event.create({
    data: {
      userId,
      title,
      description,
      start: startDate,
      end: endDate,
      location,
      sport: sport || 'TENNIS',
      status: 'AVAILABLE',
      color: '#3c70f2',
    },
    select: {
      id: true,
      title: true,
      description: true,
      start: true,
      end: true,
      location: true,
      sport: true,
      status: true,
      color: true,
      userId: true,
      createdAt: true,
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
          },
        },
      },
    },
  })

  return sendSuccess(
    res,
    {
      event: newEvent,
      message: 'Evento creato con successo',
    },
    201
  )
}

export default withAuth(withErrorHandler(handler))
