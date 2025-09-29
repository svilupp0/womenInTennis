// 🔄 API ENDPOINT - User Availability Toggle (VERSIONE SENIOR DEVELOPER)
// PUT /api/users/availability - Aggiorna disponibilità utente

import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'

async function handler(req, res) {
  // ✅ Gestisci solo richieste PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      error: 'Metodo non consentito. Usa PUT.' 
    })
  }

  try {
    // 🔐 userId già validato dal middleware withAuth
    const { userId } = req

    // 📝 Validazione input
    const { available } = req.body
    
    if (typeof available !== 'boolean') {
      return res.status(400).json({ 
        error: 'Parametro "available" deve essere un boolean' 
      })
    }

    // 🗄️ Aggiornamento database (Prisma gestisce updatedAt automaticamente)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        disponibilita: available
      },
      select: {
        id: true,
        email: true,
        disponibilita: true,
        updatedAt: true
      }
    })

    // 📊 Log per debug e analytics
    console.log(`✅ User ${userId} changed availability to: ${available}`)

    // ✅ Risposta successo (formato pulito come suggerito)
    return res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      disponibilita: updatedUser.disponibilita,
      updatedAt: updatedUser.updatedAt
    })

  } catch (error) {
    console.error('❌ Errore aggiornamento disponibilità:', error)

    // 🔍 Gestione errori specifici (auth errors già gestiti dal middleware)

    // Errori Prisma specifici
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Utente non trovato' 
      })
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Conflitto dati utente' 
      })
    }

    if (error.code?.startsWith('P')) {
      console.error('🗄️ Errore database Prisma:', error.code, error.message)
      return res.status(500).json({ 
        error: 'Errore database. Riprova più tardi.' 
      })
    }

    // Errore generico
    return res.status(500).json({ 
      error: 'Errore interno del server. Riprova più tardi.' 
    })
  }
}

export default withAuth(handler)

// 📋 Configurazione Next.js API
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}