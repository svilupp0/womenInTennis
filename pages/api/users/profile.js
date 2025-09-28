// pages/api/users/profile.js
// API per aggiornamento profilo utente

import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  // Solo metodo PUT accettato
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      error: 'Metodo non consentito. Usa PUT.' 
    })
  }

  try {
    // 1. Verifica autenticazione JWT
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token di autenticazione mancante o malformato' 
      })
    }

    const token = authHeader.substring(7) // Rimuovi "Bearer "
    let decoded
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token non valido o scaduto' 
      })
    }

    const userId = decoded.userId

    // 2. Valida i dati in input
    const { comune, livello, telefono, disponibilita } = req.body

    // Validazione livello se fornito
    const validLevels = ['Principiante', 'Intermedio', 'Avanzato']
    if (livello && !validLevels.includes(livello)) {
      return res.status(400).json({
        success: false,
        error: `Livello non valido. Usa: ${validLevels.join(', ')}`
      })
    }

    // Validazione telefono se fornito (formato base)
    if (telefono && telefono.trim() && telefono.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Numero di telefono troppo corto'
      })
    }

    // Validazione disponibilita se fornita
    if (disponibilita !== undefined && typeof disponibilita !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Il campo disponibilita deve essere true o false'
      })
    }

    // 3. Costruisci oggetto di aggiornamento (solo campi forniti)
    const updateData = {}
    
    if (comune !== undefined) updateData.comune = comune.trim() || null
    if (livello !== undefined) updateData.livello = livello || null
    if (telefono !== undefined) updateData.telefono = telefono.trim() || null
    if (disponibilita !== undefined) updateData.disponibilita = disponibilita

    // Verifica che ci sia almeno un campo da aggiornare
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nessun campo da aggiornare fornito'
      })
    }

    // 4. Verifica che l'utente esista
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato'
      })
    }

    // 5. Aggiorna il profilo nel database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        comune: true,
        livello: true,
        telefono: true,
        disponibilita: true,
        emailVerified: true,
        createdAt: true
        // Escludi password e altri campi sensibili
      }
    })

    // 6. Risposta di successo
    return res.status(200).json({
      success: true,
      message: 'Profilo aggiornato con successo',
      user: updatedUser
    })

  } catch (error) {
    console.error('Errore aggiornamento profilo:', error)
    
    // Gestione errori specifici di Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Violazione di vincolo univoco'
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    })
  } finally {
    await prisma.$disconnect()
  }
}