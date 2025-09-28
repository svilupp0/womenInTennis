// Script per setup admin in produzione
// Esegui con: node scripts/setup-admin-production.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// URL del database di produzione (da .env)
const DATABASE_URL = "postgresql://postgres:AAvelatQecTGaMVZEgrIGfzvNTjdmnjj@yamanote.proxy.rlwy.net:51394/railway"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function setupAdminProduction() {
  try {
    const adminEmail = 'francescascarpellini327@gmail.com'
    const adminPassword = 'AdminWiT2024!' // Password sicura per produzione
    
    console.log('🔧 Setup Admin in PRODUZIONE...')
    console.log(`📧 Email: ${adminEmail}`)
    
    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingUser) {
      // Utente esiste - aggiorna solo isAdmin
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          isAdmin: true,
          emailVerified: true // Assicurati che sia verificato
        }
      })
      
      console.log('✅ Utente esistente aggiornato come admin')
      console.log(`📧 Email: ${updatedUser.email}`)
      console.log(`👑 Admin: ${updatedUser.isAdmin}`)
      console.log('🔑 Usa la tua password esistente per il login')
      
    } else {
      // Utente non esiste - crealo come admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true,
          emailVerified: true, // Admin non ha bisogno di verifica email
          disponibilita: true,
          comune: 'Milano', // Modifica se necessario
          livello: 'Avanzato'
        }
      })
      
      console.log('✅ Nuovo account admin creato in PRODUZIONE!')
      console.log(`📧 Email: ${newAdmin.email}`)
      console.log(`🔑 Password: ${adminPassword}`)
      console.log(`🆔 ID: ${newAdmin.id}`)
      console.log(`👑 Admin: ${newAdmin.isAdmin}`)
    }
    
    console.log('\n🚀 Setup PRODUZIONE completato!')
    console.log('1. Vai su https://tuo-dominio-vercel.app/login')
    console.log(`2. Login con: ${adminEmail}`)
    console.log('3. Verrai reindirizzata alla dashboard admin!')
    console.log('4. CAMBIA SUBITO LA PASSWORD dal pannello admin!')
    
  } catch (error) {
    console.error('❌ Errore durante il setup PRODUZIONE:', error)
    
    if (error.code === 'P2002') {
      console.log('📧 Email già esistente - prova il metodo di aggiornamento')
    }
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminProduction()