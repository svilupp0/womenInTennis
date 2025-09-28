// 🔄 API ENDPOINT - User Availability Toggle (VERSIONE SENIOR DEVELOPER)
// PUT /api/users/availability - Aggiorna disponibilità utente

import { prisma } from '../../../lib/prisma'
import { authenticateToken, getUserIdFromToken } from '../../../lib/auth'

export default async function handler(req, res) {
  // ✅ Gestisci solo richieste PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      error: 'Metodo non consentito. Usa PUT.' 
    })
  }

  try {
    // 🔐 Autenticazione e estrazione userId
    const user = authenticateToken(req)
    const userId = getUserIdFromToken(user)
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Utente non autenticato - ID mancante nel token' 
      })
    }

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

    // 🔍 Gestione errori specifici con logging dettagliato
    if (error.message === 'Token mancante') {
      return res.status(401).json({ 
        error: 'Token di autenticazione mancante' 
      })
    }

    if (error.message === 'Token scaduto') {
      return res.status(401).json({ 
        error: 'Token scaduto. Effettua nuovamente il login.' 
      })
    }

    if (error.message === 'Token non valido' || error.message === 'Errore verifica token') {
      return res.status(401).json({ 
        error: 'Token non valido. Effettua nuovamente il login.' 
      })
    }

    if (error.message === 'JWT_SECRET non configurato') {
      console.error('🚨 CRITICAL: JWT_SECRET non configurato!')
      return res.status(500).json({ 
        error: 'Errore configurazione server' 
      })
    }

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

// 📋 Configurazione Next.js API
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}