import { prisma } from '../../../lib/prisma'
import { withAdminAuth } from '../../../lib/middleware/authMiddleware'

async function handler(req, res) {
  // Solo metodo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    // 👑 Admin già autenticato dal middleware withAdminAuth

    // Ottieni tutte le segnalazioni con dettagli utenti
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            comune: true,
            livello: true,
            createdAt: true
          }
        },
        reported: {
          select: {
            id: true,
            email: true,
            comune: true,
            livello: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.status(200).json({
      success: true,
      reports: reports
    })

  } catch (error) {
    console.error('Errore API admin reports:', error)
    res.status(500).json({ 
      error: 'Errore interno del server' 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}

export default withAdminAuth(handler)