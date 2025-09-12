// scripts/create-admin.js
// Script per creare il primo utente admin

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔍 Controllo utenti admin esistenti...')
    
    // Controlla se esiste già un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true }
    })

    if (existingAdmin) {
      console.log('✅ Admin già esistente:', existingAdmin.email)
      console.log('📧 Se vuoi cambiare admin, modifica manualmente il database')
      return
    }

    console.log('📝 Nessun admin trovato. Creazione nuovo admin...')
    
    // Email admin (MODIFICA QUI CON LA TUA EMAIL)
    const adminEmail = 'TUA_EMAIL_QUI@example.com' // 👈 INSERISCI LA TUA EMAIL QUI
    const adminPassword = 'admin123' // Password temporanea - CAMBIALA SUBITO!

    console.log(`📧 Email admin: ${adminEmail}`)
    console.log(`🔑 Password temporanea: ${adminPassword}`)
    console.log('⚠️  IMPORTANTE: Cambia la password dopo il primo login!')

    // Controlla se esiste già un utente con questa email
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      console.log('👤 Utente già esistente. Promozione a admin...')
      
      // Promuovi utente esistente ad admin
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { isAdmin: true }
      })

      console.log('✅ Utente promosso ad admin con successo!')
      console.log('📧 Email:', updatedUser.email)
      console.log('👑 Admin:', updatedUser.isAdmin)
      return
    }

    // Hash della password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds)

    // Crea nuovo utente admin
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        comune: 'Milano', // Modifica se necessario
        livello: 'Avanzato', // Modifica se necessario
        disponibilita: false // Admin di solito non gioca
      }
    })

    console.log('✅ Admin creato con successo!')
    console.log('📧 Email:', newAdmin.email)
    console.log('🆔 ID:', newAdmin.id)
    console.log('👑 Admin:', newAdmin.isAdmin)
    console.log('')
    console.log('🚀 Ora puoi fare login con:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('')
    console.log('⚠️  IMPORTANTE: Cambia la password dopo il primo login!')

  } catch (error) {
    console.error('❌ Errore durante la creazione admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui lo script
createAdmin()