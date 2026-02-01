const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')
const { promisify } = require('util')

console.log('📡 DATABASE_URL:', process.env.DATABASE_URL)

// Inizializza Prisma e readline
const prisma = new PrismaClient()
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = promisify(rl.question).bind(rl)

async function resetAndCreateAdmin() {
  try {
    // 1️⃣ Conferma prima di cancellare tutto
    const confirm = await question('⚠️ Sei sicura di voler cancellare tutti gli utenti? (yes/no): ')
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operazione annullata.')
      return
    }

    // 2️⃣ Cancella tutti gli utenti
    await prisma.user.deleteMany({})
    console.log('🗑️ Tutti gli utenti sono stati cancellati.')

    // 3️⃣ Chiede email e password admin
    const adminEmail = await question('📧 Inserisci email admin: ')
    let newPassword = await question('📝 Inserisci la password admin: ')

    // Controllo minimo sulla lunghezza della password
    while (newPassword.length < 8) {
      console.log('❌ Password troppo corta! Minimo 8 caratteri.')
      newPassword = await question('📝 Inserisci di nuovo la password admin: ')
    }

    // 4️⃣ Hash della password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5️⃣ Crea admin nel db
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        emailVerified: true,
        disponibilita: true,
      },
    })

    console.log('✅ Admin creato con successo!')
  } catch (error) {
    console.error('❌ Errore:', error.message)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

resetAndCreateAdmin()
