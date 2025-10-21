// pages/api/users/profile.js
// API per aggiornamento profilo utente

import { prisma } from '../../../lib/prisma'
import { withAuth } from '../../../lib/middleware/authMiddleware'

async function handler(req, res) {
  // Solo metodo PUT accettato
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      error: 'Metodo non consentito. Usa PUT.' 
    })
  }

  try {
    // 🔐 userId già validato dal middleware withAuth
    const { userId } = req

    // 2. Valida i dati in input
    const { comune, sportLevels, telefono, disponibilita } = req.body

    // Validazione sportLevels se fornito
    const validLevels = ['Principiante', 'Intermedio', 'Avanzato']
    const validSports = ['TENNIS', 'PADEL']

    if (sportLevels) {
      if (!Array.isArray(sportLevels)) {
        return res.status(400).json({
          success: false,
          error: 'sportLevels deve essere un array'
        })
      }

      for (const sportLevel of sportLevels) {
        if (!sportLevel.sport || !sportLevel.livello) {
          return res.status(400).json({
            success: false,
            error: 'Ogni sportLevel deve avere sport e livello'
          })
        }
        if (!validSports.includes(sportLevel.sport)) {
          return res.status(400).json({
            success: false,
            error: `Sport non valido. Usa: ${validSports.join(', ')}`
          })
        }
        if (!validLevels.includes(sportLevel.livello)) {
          return res.status(400).json({
            success: false,
            error: `Livello non valido. Usa: ${validLevels.join(', ')}`
          })
        }
      }
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
    if (telefono !== undefined) updateData.telefono = telefono.trim() || null
    if (disponibilita !== undefined) updateData.disponibilita = disponibilita

    // Verifica che ci sia almeno un campo da aggiornare
    if (Object.keys(updateData).length === 0 && !sportLevels) {
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
        telefono: true,
        disponibilita: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        sportLevels: {
          select: {
            sport: true,
            livello: true,
          },
        }
        // Escludi password e altri campi sensibili
      }
    })

    // 6. Gestisci sportLevels se fornito
    let updatedSportLevels = []
    if (sportLevels) {
      // Prima elimina tutti i livelli esistenti per l'utente
      await prisma.userSportLevel.deleteMany({
        where: { userId: userId }
      })

      // Poi crea i nuovi livelli
      if (sportLevels.length > 0) {
        const sportLevelData = sportLevels.map(sportLevel => ({
          userId: userId,
          sport: sportLevel.sport,
          livello: sportLevel.livello
        }))

        updatedSportLevels = await prisma.userSportLevel.createMany({
          data: sportLevelData,
          skipDuplicates: true
        })
      }
    }

    // 7. Ottieni i livelli sport aggiornati per la risposta
    const currentSportLevels = await prisma.userSportLevel.findMany({
      where: { userId: userId },
      select: {
        sport: true,
        livello: true
      }
    })

    // 8. Risposta di successo
    return res.status(200).json({
      success: true,
      message: 'Profilo aggiornato con successo',
      user: {
        ...updatedUser,
        sportLevels: currentSportLevels
      }
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
  }
  // Nota: Non disconnettiamo il singleton prisma
}

export default withAuth(handler)