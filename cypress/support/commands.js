// cypress/support/commands.js

// Custom commands for Women in Tennis testing

// Command to login programmatically
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    if (response.body.success) {
      // Store token and user in localStorage
      window.localStorage.setItem('token', response.body.token)
      window.localStorage.setItem('user', JSON.stringify(response.body.user))
    }
    return response
  })
})

// Command to register a new user
Cypress.Commands.add('register', (userData) => {
  const defaultUserData = {
    email: 'newuser@example.com',
    password: 'password123',
    comune: 'Milano',
    livello: 'Intermedio'
  }
  
  const user = { ...defaultUserData, ...userData }
  
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: user
  })
})

// Command to logout
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token')
  window.localStorage.removeItem('user')
})

// Command to create a verified test user
Cypress.Commands.add('createVerifiedUser', (email = 'verified@example.com') => {
  // This would typically involve database seeding
  // For now, we'll mock it by directly setting localStorage
  const mockUser = {
    id: 1,
    email,
    emailVerified: true,
    comune: 'Milano',
    livello: 'Intermedio'
  }
  
  const mockToken = 'mock-jwt-token-for-testing'
  
  window.localStorage.setItem('token', mockToken)
  window.localStorage.setItem('user', JSON.stringify(mockUser))
})

// Command to wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.get('[data-testid="loading"]').should('not.exist')
})

// Command to fill login form
Cypress.Commands.add('fillLoginForm', (email, password) => {
  cy.get('input[name="email"]').clear().type(email)
  cy.get('input[name="password"]').clear().type(password)
})

// Command to fill registration form
Cypress.Commands.add('fillRegistrationForm', (userData) => {
  const {
    email = 'test@example.com',
    password = 'password123',
    confirmPassword = 'password123',
    comune = 'Milano',
    livello = 'Intermedio',
    telefono = ''
  } = userData

  cy.get('input[name="email"]').clear().type(email)
  cy.get('input[name="password"]').clear().type(password)
  cy.get('input[name="confirmPassword"]').clear().type(confirmPassword)
  
  if (comune) {
    cy.get('input[name="comune"]').clear().type(comune)
  }
  
  if (livello) {
    cy.get('select[name="livello"]').select(livello)
  }
  
  if (telefono) {
    cy.get('input[name="telefono"]').clear().type(telefono)
  }
})

// Command to check if user is redirected to dashboard
Cypress.Commands.add('shouldBeOnDashboard', () => {
  cy.url().should('include', '/dashboard')
  cy.contains('Dashboard').should('be.visible')
})

// Command to check if user sees email verification screen
Cypress.Commands.add('shouldSeeEmailVerification', () => {
  cy.contains('Controlla la tua email').should('be.visible')
  cy.contains('📧').should('be.visible')
})

// Command to check if user sees unverified email screen
Cypress.Commands.add('shouldSeeUnverifiedEmailScreen', () => {
  cy.contains('Email non verificata').should('be.visible')
  cy.contains('⚠️').should('be.visible')
})