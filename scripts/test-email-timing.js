// Script per testare timing email di conferma
// Esegui con: node scripts/test-email-timing.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEmailTiming() {
  try {
    console.log('🔍 Test timing email di conferma...\n')
    
    // Test 1: Verifica utenti con email non verificate
    console.log('📧 Utenti con email non verificate:')
    const unverifiedUsers = await prisma.user.findMany({
      where: { emailVerified: false },
      select: {
        id: true,
        email: true,
        lastVerificationSent: true,
        verificationTokenExpiry: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (unverifiedUsers.length === 0) {
      console.log('✅ Nessun utente con email non verificata')
    } else {
      unverifiedUsers.forEach(user => {
        const now = new Date()
        const lastSent = user.lastVerificationSent
        const expiry = user.verificationTokenExpiry
        
        console.log(`\n👤 ${user.email}`)
        console.log(`   📅 Registrato: ${user.createdAt?.toLocaleString('it-IT')}`)
        console.log(`   📤 Ultimo invio: ${lastSent?.toLocaleString('it-IT') || 'Mai'}`)
        console.log(`   ⏰ Token scade: ${expiry?.toLocaleString('it-IT') || 'N/A'}`)
        
        if (lastSent) {\n          const minutesSinceLastSent = Math.floor((now - lastSent) / (1000 * 60))\n          console.log(`   🕐 Minuti dall'ultimo invio: ${minutesSinceLastSent}`)\n          \n          // Check se può richiedere nuovo invio (2 minuti)\n          if (minutesSinceLastSent >= 2) {\n            console.log(`   ✅ Può richiedere nuovo invio`)\n          } else {\n            const waitTime = 2 - minutesSinceLastSent\n            console.log(`   ⏳ Deve attendere ${waitTime} minuti`)\n          }\n        }\n        \n        if (expiry) {\n          const isExpired = now > expiry\n          console.log(`   ${isExpired ? '❌ Token SCADUTO' : '✅ Token valido'}`)\n        }\n      })\n    }\n    \n    console.log('\\n' + '='.repeat(50))\n    \n    // Test 2: Statistiche timing\n    console.log('\\n📊 Statistiche timing:')\n    \n    const stats = await prisma.user.aggregate({\n      where: { emailVerified: false },\n      _count: { id: true }\n    })\n    \n    const recentUnverified = await prisma.user.count({\n      where: {\n        emailVerified: false,\n        createdAt: {\n          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Ultime 24 ore\n        }\n      }\n    })\n    \n    const expiredTokens = await prisma.user.count({\n      where: {\n        emailVerified: false,\n        verificationTokenExpiry: {\n          lt: new Date()\n        }\n      }\n    })\n    \n    console.log(`📧 Totale email non verificate: ${stats._count.id}`)\n    console.log(`🆕 Registrazioni ultime 24h: ${recentUnverified}`)\n    console.log(`⏰ Token scaduti: ${expiredTokens}`)\n    \n    // Test 3: Configurazione attuale\n    console.log('\\n⚙️ Configurazione timing attuale:')\n    console.log('   📤 Cooldown reinvio: 2 minuti')\n    console.log('   🔄 Max reinvii per ora: 5')\n    console.log('   ⏰ Validità token: 24 ore')\n    console.log('   🚫 Max registrazioni per IP: 3 ogni 15 min')\n    \n    // Test 4: Suggerimenti\n    console.log('\\n💡 Suggerimenti:')\n    \n    if (expiredTokens > 0) {\n      console.log(`   ⚠️  ${expiredTokens} utenti hanno token scaduti - considera cleanup`)\n    }\n    \n    if (recentUnverified > 5) {\n      console.log(`   📈 Molte registrazioni recenti non verificate - controlla deliverability email`)\n    }\n    \n    if (stats._count.id === 0) {\n      console.log(`   ✅ Ottimo! Tutti gli utenti hanno verificato l'email`)\n    }\n    \n  } catch (error) {\n    console.error('❌ Errore durante il test:', error)\n  } finally {\n    await prisma.$disconnect()\n  }\n}\n\n// Funzione per pulire token scaduti\nasync function cleanupExpiredTokens() {\n  try {\n    console.log('\\n🧹 Pulizia token scaduti...')\n    \n    const result = await prisma.user.updateMany({\n      where: {\n        emailVerified: false,\n        verificationTokenExpiry: {\n          lt: new Date()\n        }\n      },\n      data: {\n        verificationToken: null,\n        verificationTokenExpiry: null\n      }\n    })\n    \n    console.log(`✅ Puliti ${result.count} token scaduti`)\n    \n  } catch (error) {\n    console.error('❌ Errore pulizia:', error)\n  }\n}\n\n// Esegui test\nasync function runTests() {\n  await testEmailTiming()\n  \n  // Chiedi se fare cleanup\n  console.log('\\n❓ Vuoi pulire i token scaduti? (modifica lo script per abilitare)')\n  // await cleanupExpiredTokens() // Decommentare per abilitare cleanup\n}\n\nrunTests()