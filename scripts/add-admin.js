const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')
const { promisify } = require('util')

console.log("📡 DATABASE_URL:", process.env.DATABASE_URL)

// Inizializza Prisma e readline
const prisma = new PrismaClient()
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = promisify(rl.question).bind(rl)

async function addAdmin() {
  try {
    // 1️⃣ Chiede email e password admin
    const adminEmail = await question('📧 Inserisci email admin: ')
    let newPassword = await question('📝 Inserisci la password admin: ')

    // Controllo minimo sulla lunghezza della password
    while (newPassword.length < 8) {
      console.log('❌ Password troppo corta! Minimo 8 caratteri.')
      newPassword = await question('📝 Inserisci di nuovo la password admin: ')
    }

    // 2️⃣ Verifica se l'admin esiste già
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, isAdmin: true }
    })

    if (existingAdmin) {
      if (existingAdmin.isAdmin) {
        console.log('⚠️ Un admin con questa email esiste già!')
        return
      } else {
        // Rendi admin l'utente esistente
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { isAdmin: true }
        })
        console.log('✅ Utente esistente promosso ad admin!')
        return
      }
    }

    // 3️⃣ Hash della password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 4️⃣ Crea nuovo admin
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        emailVerified: true,
        disponibilita: true
      }
    })

    console.log('✅ Nuovo admin creato con successo!')

  } catch (error) {
    console.error('❌ Errore:', error.message)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

addAdmin()
