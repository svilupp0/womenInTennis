import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'

async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    // 🔐 userId già validato dal middleware withAuth
    const { userId } = req

    const { reportedId, reason, description } = req.body

    // Validazione input
    if (!reportedId || !reason) {
      return res.status(400).json({ error: 'reportedId e reason sono obbligatori' })
    }

    // Verifica che l'utente non stia segnalando se stesso
    if (userId === parseInt(reportedId)) {
      return res.status(400).json({ error: 'Non puoi segnalare te stesso' })
    }

    // Verifica che l'utente segnalato esista
    const reportedUser = await prisma.user.findUnique({
      where: { id: parseInt(reportedId) }
    })

    if (!reportedUser) {
      return res.status(404).json({ error: 'Utente da segnalare non trovato' })
    }

    // Verifica che non esista già una segnalazione da questo utente verso l'utente target
    const existingReport = await prisma.report.findUnique({
      where: {
        reporterId_reportedId: {
          reporterId: userId,
          reportedId: parseInt(reportedId)
        }
      }
    })

    if (existingReport) {
      return res.status(400).json({ error: 'Hai già segnalato questo utente' })
    }

    // Validazione reason (deve essere uno dei valori enum)
    const validReasons = [
      'INAPPROPRIATE_BEHAVIOR',
      'FAKE_PROFILE', 
      'HARASSMENT',
      'SPAM',
      'NO_SHOW',
      'OTHER'
    ]

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Motivo di segnalazione non valido' })
    }

    // Crea la segnalazione
    const newReport = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedId: parseInt(reportedId),
        reason: reason,
        description: description || null,
        status: 'PENDING'
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true
          }
        },
        reported: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    // Risposta di successo
    res.status(201).json({
      success: true,
      message: 'Segnalazione inviata con successo',
      report: {
        id: newReport.id,
        reason: newReport.reason,
        description: newReport.description,
        status: newReport.status,
        createdAt: newReport.createdAt,
        reported: {
          id: newReport.reported.id,
          email: newReport.reported.email.split('@')[0] // Solo username per privacy
        }
      }
    })

  } catch (error) {
    console.error('Errore creazione segnalazione:', error)

    // Gestione errori specifici Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Segnalazione già esistente' })
    }

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}

export default withAuth(handler)