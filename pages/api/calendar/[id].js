// pages/api/calendar/[id].js
// API per gestione eventi specifici

import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'
import {
  withErrorHandler,
  sendSuccess,
  sendError,
  validateHttpMethod,
  ApiError,
  ErrorTypes,
} from '../../../lib/utils/apiErrors'

async function handler(req, res) {
  validateHttpMethod(req, res, ['GET', 'PUT', 'DELETE'])

  const { id } = req.query
  const eventId = parseInt(id)

  if (isNaN(eventId)) {
    return sendError(res, 'ID evento non valido')
  }

  if (req.method === 'GET') {
    return getEvent(req, res, eventId)
  } else if (req.method === 'PUT') {
    return updateEvent(req, res, eventId)
  } else if (req.method === 'DELETE') {
    return deleteEvent(req, res, eventId)
  }
}

// GET /api/calendar/[id] - Ottieni dettagli evento
async function getEvent(req, res, eventId) {
  const { userId } = req

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      userId: userId,
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
          },
        },
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
              },
            },
          },
        },
      },
    },
  })

  if (!event) {
    throw new ApiError('Evento non trovato', 404, ErrorTypes.NOT_FOUND)
  }

  return sendSuccess(res, { event })
}

// PUT /api/calendar/[id] - Modifica evento
async function updateEvent(req, res, eventId) {
  const { userId } = req

  // Verifica che l'evento appartenga all'utente
  const existingEvent = await prisma.event.findFirst({
    where: {
      id: eventId,
      userId: userId,
    },
  })

  if (!existingEvent) {
    throw new ApiError('Evento non trovato', 404, ErrorTypes.NOT_FOUND)
  }

  // Non permettere modifica se ha proposte pending
  const pendingProposals = await prisma.matchProposal.findMany({
    where: {
      eventId: eventId,
      status: 'PENDING',
    },
  })

  if (pendingProposals.length > 0) {
    return sendError(res, 'Non puoi modificare un evento con proposte in attesa')
  }

  const { title, description, start, end, location, status } = req.body

  // Validazione date se fornite
  if (start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    if (startDate >= endDate) {
      return sendError(res, 'Data fine deve essere dopo data inizio')
    }

    if (startDate < new Date()) {
      return sendError(res, 'Non puoi spostare eventi nel passato')
    }
  }

  // Aggiorna evento
  const updatedEvent = await prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(start && { start: new Date(start) }),
      ...(end && { end: new Date(end) }),
      ...(location !== undefined && { location }),
      ...(status && { status }),
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
          },
        },
      },
    },
  })

  return sendSuccess(res, {
    event: updatedEvent,
    message: 'Evento aggiornato con successo',
  })
}

// DELETE /api/calendar/[id] - Elimina evento
async function deleteEvent(req, res, eventId) {
  const { userId } = req

  // Verifica che l'evento appartenga all'utente
  const existingEvent = await prisma.event.findFirst({
    where: {
      id: eventId,
      userId: userId,
    },
  })

  if (!existingEvent) {
    throw new ApiError('Evento non trovato', 404, ErrorTypes.NOT_FOUND)
  }

  // Elimina evento (le proposte collegate verranno eliminate automaticamente per CASCADE)
  await prisma.event.delete({
    where: {
      id: eventId,
    },
  })

  return sendSuccess(res, {
    message: 'Evento eliminato con successo',
  })
}

export default withAuth(withErrorHandler(handler))
