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

    const { type = 'given' } = req.query // 'given' o 'received'

    let reports
    
    if (type === 'received') {
      // Segnalazioni ricevute da questo utente
      reports = await prisma.report.findMany({
        where: {
          reportedId: userId
        },
        include: {
          reporter: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Segnalazioni fatte da questo utente (default)
      reports = await prisma.report.findMany({
        where: {
          reporterId: userId
        },
        include: {
          reported: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    // Trasforma i dati per il frontend (privacy-friendly)
    const formattedReports = reports.map(report => ({
      id: report.id,
      reason: report.reason,
      description: report.description,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      ...(type === 'received' ? {
        reporter: {
          id: report.reporter.id,
          username: report.reporter.email.split('@')[0]
        }
      } : {
        reported: {
          id: report.reported.id,
          username: report.reported.email.split('@')[0]
        }
      })
    }))

    // Risposta di successo
    res.status(200).json({
      success: true,
      reports: formattedReports,
      count: formattedReports.length,
      type: type
    })

  } catch (error) {
    console.error('Errore recupero segnalazioni:', error)

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}

export default withAuth(handler)