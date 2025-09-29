import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { withAdminAuth } from '../../../lib/middleware/authMiddleware'

async function handler(req, res) {
  // Solo metodo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' })
  }

  try {
    const { currentPassword, newPassword } = req.body

    // Validazione input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password attuale e nuova password sono obbligatorie' })
    }

    // Validazione nuova password
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nuova password deve essere di almeno 6 caratteri' })
    }

    // 👑 Admin già autenticato dal middleware withAdminAuth
    const { userId } = req

    // Trova l'utente admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true
      }
    })

    // Verifica password attuale
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Password attuale non corretta' })
    }

    // Hash della nuova password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Aggiorna la password nel database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    res.status(200).json({
      success: true,
      message: 'Password cambiata con successo!'
    })

  } catch (error) {
    console.error('Errore cambio password admin:', error)
    res.status(500).json({ 
      error: 'Errore interno del server' 
    })
  }
  // Nota: Non disconnettiamo il singleton prisma
}

export default withAdminAuth(handler)