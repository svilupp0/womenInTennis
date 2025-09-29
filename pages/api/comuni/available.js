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

    // Usa groupBy per ottenere comuni con conteggio giocatrici
    const comuniData = await prisma.user.groupBy({
      by: ['comune'],
      where: {
        comune: {
          not: null // Escludi utenti senza comune
        }
      },
      _count: {
        comune: true
      },
      orderBy: {
        _count: {
          comune: 'desc' // Ordina per numero di giocatrici (più popolati prima)
        }
      }
    })

    // Trasforma i dati per il frontend
    const comuni = comuniData.map(item => ({
      nome: item.comune,
      count: item._count.comune
    }))

    // Risposta di successo
    res.status(200).json({
      success: true,
      comuni: comuni,
      total: comuni.length
    })

  } catch (error) {
    console.error('Errore recupero comuni:', error)

    // Errore generico
    res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}

export default withAuth(handler)