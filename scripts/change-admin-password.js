const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')
const { promisify } = require('util')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = promisify(rl.question).bind(rl)

async function changeAdminPassword() {
  try {
    const adminEmail = await question('📧 Inserisci email admin: ')
    const newPassword = await question('📝 Inserisci la NUOVA password: ')
    
    if (newPassword.length < 8) {
      console.log('❌ Password troppo corta! Minimo 8 caratteri.')
      return
    }
    
    console.log('🔐 Cambio password in corso...')
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Password cambiata con successo!')
    console.log(`📧 Email: ${adminEmail}`)
    console.log('🔒 Nuova password impostata!')
    
  } catch (error) {
    console.error('❌ Errore:', error.message)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

changeAdminPassword()