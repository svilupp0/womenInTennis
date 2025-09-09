import { prisma } from '../../../../../lib/prisma'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    const { id } = req.query
    const { action } = req.body

    // Validazione input
    if (!id || !action) {
      return res.status(400).json({ error: 'ID segnalazione e azione sono obbligatori' })
    }

    const validActions = ['dismiss', 'warn', 'suspend']
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Azione non valida' })
    }

    // Verifica token JWT
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token di autenticazione mancante' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    
    let decoded
    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch (error) {
      return res.status(401).json({ error: 'Token non valido' })
    }

    // Verifica che l'utente sia admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isAdmin: true }
    })

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Accesso negato. Solo gli admin possono accedere.' })
    }

    // Verifica che la segnalazione esista
    const report = await prisma.report.findUnique({
      where: { id: parseInt(id) },
      include: {
        reported: {
          select: { id: true, email: true }
        }
      }
    })

    if (!report) {
      return res.status(404).json({ error: 'Segnalazione non trovata' })
    }

    // Esegui l'azione
    let updateData = {}
    let additionalActions = []

    switch (action) {
      case 'dismiss':
        updateData = { status: 'DISMISSED' }
        break
      
      case 'warn':
        updateData = { status: 'RESOLVED' }
        // TODO: In futuro, potresti voler inviare una email di avviso all'utente
        additionalActions.push(`Avviso inviato a ${report.reported.email}`)
        break
      
      case 'suspend':
        updateData = { status: 'RESOLVED' }
        // TODO: In futuro, potresti voler aggiungere un campo 'suspended' al modello User
        // Per ora, solo segniamo come risolto
        additionalActions.push(`Utente ${report.reported.email} sospeso`)
        break
    }

    // Aggiorna la segnalazione
    const updatedReport = await prisma.report.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    res.status(200).json({
      success: true,
      message: `Azione "${action}" eseguita con successo`,
      report: updatedReport,
      additionalActions: additionalActions
    })

  } catch (error) {
    console.error('Errore API admin action:', error)
    res.status(500).json({ 
      error: 'Errore interno del server' 
    })
  } finally {
    await prisma.$disconnect()
  }
}