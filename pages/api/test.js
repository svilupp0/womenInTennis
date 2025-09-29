// api/test.js
import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  try {
    // Test della connessione con Prisma
    const userCount = await prisma.user.count()
    
    // Query per ottenere l'orario dal database (equivalente a SELECT NOW())
    const currentTime = await prisma.$queryRaw`SELECT NOW() as current_time`
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connesso con Prisma!',
      userCount: userCount,
      time: currentTime[0]
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
  // Nota: Prisma singleton gestisce automaticamente le connessioni
}