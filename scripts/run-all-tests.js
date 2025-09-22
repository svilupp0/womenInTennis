// scripts/run-all-tests.js
// Script per eseguire tutti i test in sequenza

const { execSync } = require('child_process')

console.log('🧪 Running complete test suite for Women in Tennis\n')

const runCommand = (command, description) => {
  console.log(`📋 ${description}`)
  console.log(`🔧 Running: ${command}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('✅ Success!\n')
    return true
  } catch (error) {
    console.log('❌ Failed!')
    console.log(`Error: ${error.message}\n`)
    return false
  }
}

async function runAllTests() {
  const results = []
  
  // 1. Unit Tests
  console.log('🎯 PHASE 1: Unit Tests')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  const unitTestResult = runCommand('npm test', 'Running Jest unit tests')
  results.push({ name: 'Unit Tests', success: unitTestResult })
  
  // 2. Test Coverage
  console.log('📊 PHASE 2: Test Coverage')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  const coverageResult = runCommand('npm run test:coverage', 'Generating test coverage report')
  results.push({ name: 'Test Coverage', success: coverageResult })
  
  // 3. Build Test
  console.log('🏗️  PHASE 3: Build Test')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  const buildResult = runCommand('npm run build', 'Testing production build')
  results.push({ name: 'Build Test', success: buildResult })
  
  // 4. E2E Tests (only if build succeeded)
  if (buildResult) {
    console.log('🌐 PHASE 4: End-to-End Tests')
    console.log('═══════════════════════════════════════════════════════════════\n')
    
    console.log('⚠️  Note: E2E tests require the application to be running.')
    console.log('   Start the app with: npm run dev')
    console.log('   Then run: npm run test:e2e:headless\n')
    
    // Uncomment if you want to run E2E tests automatically
    // const e2eResult = runCommand('npm run test:e2e:headless', 'Running Cypress E2E tests')
    // results.push({ name: 'E2E Tests', success: e2eResult })
  }
  
  // Summary
  console.log('📋 TEST SUMMARY')
  console.log('═══════════════════════════════════════════════════════════════')
  
  let allPassed = true
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
    if (!result.success) allPassed = false
  })
  
  console.log('\n🎯 OVERALL RESULT')
  console.log('═══════════════════════════════════════════════════════════════')
  
  if (allPassed) {
    console.log('🎉 All tests passed! Your application is ready for deployment.')
    console.log('\n🚀 Next steps:')
    console.log('   1. Review test coverage report in coverage/ folder')
    console.log('   2. Run E2E tests manually: npm run test:e2e')
    console.log('   3. Deploy to production with confidence!')
  } else {
    console.log('⚠️  Some tests failed. Please review and fix issues before deployment.')
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Check error messages above')
    console.log('   2. Run individual test suites: npm test')
    console.log('   3. Fix failing tests and run again')
  }
  
  console.log('\n📚 Test Commands Reference:')
  console.log('   npm test              - Run unit tests')
  console.log('   npm run test:watch    - Run tests in watch mode')
  console.log('   npm run test:coverage - Generate coverage report')
  console.log('   npm run test:e2e      - Open Cypress UI')
  console.log('   npm run test:e2e:headless - Run E2E tests headless')
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests }