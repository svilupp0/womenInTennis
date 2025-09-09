const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupAdmin() {
  try {
    const adminEmail = 'francescascarpellini327@gmail.com'
    const adminPassword = 'admin123' // Password temporanea - cambiala dopo il primo login
    
    console.log('🔧 Setup Admin Account...')
    
    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingUser) {
      // Utente esiste - aggiorna solo isAdmin
      await prisma.user.update({
        where: { email: adminEmail },
        data: { isAdmin: true }
      })
      console.log('✅ Utente esistente aggiornato come admin')
      console.log(`📧 Email: ${adminEmail}`)
      console.log('🔑 Usa la tua password esistente per il login')
    } else {
      // Utente non esiste - crealo come admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true,
          disponibilita: true
        }
      })
      
      console.log('✅ Nuovo account admin creato!')
      console.log(`📧 Email: ${adminEmail}`)
      console.log(`🔑 Password temporanea: ${adminPassword}`)
      console.log('⚠️  IMPORTANTE: Cambia la password dopo il primo login!')
    }
    
    console.log('\n🚀 Setup completato! Ora puoi:')
    console.log('1. Avviare il server: npm run dev')
    console.log('2. Andare su http://localhost:3000/login')
    console.log(`3. Fare login con: ${adminEmail}`)
    console.log('4. Verrai automaticamente reindirizzata alla dashboard admin!')
    
  } catch (error) {
    console.error('❌ Errore durante il setup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()