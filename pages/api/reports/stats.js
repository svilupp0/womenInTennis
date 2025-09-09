import { prisma } from '../../../lib/prisma'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  // Solo metodo GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    // Verifica token JWT
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token di autenticazione richiesto' })
    }

    const token = authHeader.split(' ')[1]
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    
    let decoded
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch (error) {
      return res.status(401).json({ error: 'Token non valido' })
    }

    // Statistiche generali sui report
    const totalReports = await prisma.report.count()
    
    const reportsByStatus = await prisma.report.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const reportsByReason = await prisma.report.groupBy({
      by: ['reason'],
      _count: {
        reason: true
      },
      orderBy: {
        _count: {
          reason: 'desc'
        }
      }
    })

    // Utenti più segnalati (top 5)
    const mostReportedUsers = await prisma.report.groupBy({
      by: ['reportedId'],
      _count: {
        reportedId: true
      },
      orderBy: {
        _count: {
          reportedId: 'desc'
        }
      },
      take: 5
    })

    // Ottieni dettagli degli utenti più segnalati
    const userIds = mostReportedUsers.map(item => item.reportedId)
    const userDetails = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        email: true,
        comune: true,
        createdAt: true
      }
    })

    // Combina dati
    const mostReportedWithDetails = mostReportedUsers.map(item => {
      const user = userDetails.find(u => u.id === item.reportedId)
      return {
        userId: item.reportedId,
        reportCount: item._count.reportedId,
        username: user ? user.email.split('@')[0] : 'Unknown',
        comune: user ? user.comune : null,
        userCreatedAt: user ? user.createdAt : null
      }
    })

    // Report recenti (ultimi 10)
    const recentReports = await prisma.report.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
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

    const formattedRecentReports = recentReports.map(report => ({
      id: report.id,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt,
      reporter: report.reporter.email.split('@')[0],
      reported: report.reported.email.split('@')[0]
    }))

    // Risposta di successo
    res.status(200).json({
      success: true,
      stats: {
        total: totalReports,
        byStatus: reportsByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        })),
        byReason: reportsByReason.map(item => ({
          reason: item.reason,
          count: item._count.reason
        })),
        mostReported: mostReportedWithDetails,
        recent: formattedRecentReports
      }
    })

  } catch (error) {
    console.error('Errore recupero statistiche report:', error)

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  } finally {
    // Disconnetti Prisma
    await prisma.$disconnect()
  }
}