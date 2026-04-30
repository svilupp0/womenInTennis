// pages/api/calendar/public.js
// API per eventi pubblici (con autenticazione per filtrare utente corrente)

import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'
import { withErrorHandler, sendSuccess, validateHttpMethod } from '../../../lib/utils/apiErrors'

async function handler(req, res) {
  validateHttpMethod(req, res, ['GET'])

  const { userId } = req

  // Parametri di filtro
  const { comune, livello, date } = req.query

  // Costruisci filtri per utenti
  const userFilters = {
    id: {
      not: userId, // Escludi eventi dell'utente corrente
    },
    disponibilita: true, // Solo utenti disponibili
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
      gte: new Date(), // Solo eventi futuri
    },
  }

  if (date) {
    const selectedDate = new Date(date)
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)

    eventFilters.start = {
      gte: selectedDate,
      lt: nextDay,
    }
  }

  // Ottieni eventi disponibili
  const availableEvents = await prisma.event.findMany({
    where: {
      ...eventFilters,
      user: userFilters,
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
          telefono: true,
        },
      },
    },
    orderBy: [
      {
        start: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  // Aggiungi colore e formatta per il frontend
  const formattedEvents = availableEvents.map((event) => ({
    ...event,
    color: '#3c70f2', // Blu per disponibili
    user: {
      ...event.user,
      displayName: event.user.email.split('@')[0],
    },
  }))

  return sendSuccess(res, {
    events: formattedEvents,
    count: formattedEvents.length,
    filters: {
      comune,
      livello,
      date,
    },
  })
}

export default withAuth(withErrorHandler(handler))
