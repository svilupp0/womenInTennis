// cypress/e2e/auth.cy.js

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should display login form', () => {
      cy.contains('Bentornata!').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Accedi')
    })

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click()
      
      // HTML5 validation should prevent submission
      cy.get('input[name="email"]:invalid').should('exist')
      cy.get('input[name="password"]:invalid').should('exist')
    })

    it('should show error for invalid credentials', () => {
      cy.fillLoginForm('wrong@example.com', 'wrongpassword')
      cy.get('button[type="submit"]').click()
      
      cy.contains('Credenziali non valide').should('be.visible')
    })

    it('should show email verification screen for unverified user', () => {
      // Mock unverified user response
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 403,
        body: {
          success: false,
          error: 'Email non verificata',
          code: 'EMAIL_NOT_VERIFIED',
          email: 'unverified@example.com'
        }
      }).as('loginUnverified')

      cy.fillLoginForm('unverified@example.com', 'password123')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@loginUnverified')
      cy.shouldSeeUnverifiedEmailScreen()
      
      // Should have resend verification button
      cy.contains('Reinvia Email di Verifica').should('be.visible')
      cy.contains('Torna al Login').should('be.visible')
    })

    it('should redirect to dashboard on successful login', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: {
            id: 1,
            email: 'test@example.com',
            emailVerified: true,
            comune: 'Milano',
            livello: 'Intermedio'
          },
          token: 'mock-jwt-token'
        }
      }).as('loginSuccess')

      cy.fillLoginForm('test@example.com', 'password123')
      cy.get('button[type="submit"]').click()
      
      cy.wait('@loginSuccess')
      cy.shouldBeOnDashboard()
    })

    it('should allow resending verification email', () => {
      // First, trigger unverified email screen
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 403,
        body: {
          success: false,
          error: 'Email non verificata',
          code: 'EMAIL_NOT_VERIFIED',
          email: 'unverified@example.com'
        }
      }).as('loginUnverified')

      // Mock resend verification
      cy.intercept('POST', '/api/auth/resend', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Email di verifica inviata! Controlla la tua casella di posta.'
        }
      }).as('resendVerification')

      cy.fillLoginForm('unverified@example.com', 'password123')
      cy.get('button[type="submit"]').click()
      cy.wait('@loginUnverified')

      cy.contains('Reinvia Email di Verifica').click()
      cy.wait('@resendVerification')
      
      cy.contains('Email di verifica inviata!').should('be.visible')
    })
  })

  describe('Registration Page', () => {
    beforeEach(() => {
      cy.visit('/register')
    })

    it('should display registration form', () => {
      cy.contains('Unisciti alla community').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="confirmPassword"]').should('be.visible')
      cy.get('input[name="comune"]').should('be.visible')
      cy.get('select[name="livello"]').should('be.visible')
      cy.get('input[name="telefono"]').should('be.visible')
    })

    it('should show validation error for password mismatch', () => {
      cy.fillRegistrationForm({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123'
      })
      
      cy.get('button[type="submit"]').click()
      cy.contains('Le password non coincidono').should('be.visible')
    })

    it('should show validation error for short password', () => {
      cy.fillRegistrationForm({
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123'
      })
      
      cy.get('button[type="submit"]').click()
      cy.contains('La password deve essere di almeno 6 caratteri').should('be.visible')
    })

    it('should show email verification screen after successful registration', () => {
      // Mock successful registration requiring verification
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: 'Registrazione completata! Controlla la tua email per verificare l\'account.',
          user: {
            id: 1,
            email: 'newuser@example.com',
            emailVerified: false
          },
          nextStep: 'EMAIL_VERIFICATION_REQUIRED'
        }
      }).as('registerSuccess')

      cy.fillRegistrationForm({
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
      
      cy.get('button[type="submit"]').click()
      cy.wait('@registerSuccess')
      
      cy.shouldSeeEmailVerification()
      cy.contains('newuser@example.com').should('be.visible')
      cy.contains('Reinvia Email').should('be.visible')
      cy.contains('Vai al Login').should('be.visible')
    })

    it('should show error for existing email', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 400,
        body: {
          success: false,
          error: 'Un utente con questa email esiste già ed è verificato. Prova a fare login.'
        }
      }).as('registerError')

      cy.fillRegistrationForm({
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
      
      cy.get('button[type="submit"]').click()
      cy.wait('@registerError')
      
      cy.contains('Un utente con questa email esiste già').should('be.visible')
    })
  })

  describe('Email Verification', () => {
    it('should verify email successfully', () => {
      // Mock successful verification
      cy.intercept('GET', '/api/auth/verify-email*', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Email verificata con successo! Ora puoi fare login.',
          code: 'VERIFICATION_SUCCESS'
        }
      }).as('verifySuccess')

      cy.visit('/verify-email?token=valid-token&email=test@example.com')
      cy.wait('@verifySuccess')
      
      cy.contains('Verifica completata!').should('be.visible')
      cy.contains('Email verificata con successo!').should('be.visible')
      cy.contains('Vai al Login').should('be.visible')
    })

    it('should show error for expired token', () => {
      cy.intercept('GET', '/api/auth/verify-email*', {
        statusCode: 400,
        body: {
          success: false,
          error: 'Il link di verifica è scaduto. Puoi richiedere un nuovo link qui sotto.',
          code: 'TOKEN_EXPIRED'
        }
      }).as('verifyExpired')

      cy.visit('/verify-email?token=expired-token&email=test@example.com')
      cy.wait('@verifyExpired')
      
      cy.contains('Errore di verifica').should('be.visible')
      cy.contains('Il link di verifica è scaduto').should('be.visible')
      cy.contains('Invia Nuovo Link').should('be.visible')
    })

    it('should show already verified message', () => {
      cy.intercept('GET', '/api/auth/verify-email*', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Email già verificata! Puoi fare login.',
          code: 'ALREADY_VERIFIED'
        }
      }).as('alreadyVerified')

      cy.visit('/verify-email?token=any-token&email=test@example.com')
      cy.wait('@alreadyVerified')
      
      cy.contains('Email già verificata!').should('be.visible')
      cy.contains('Vai al Login').should('be.visible')
    })
  })

  describe('Navigation', () => {
    it('should navigate between login and register pages', () => {
      cy.visit('/login')
      cy.contains('Registrati qui').click()
      cy.url().should('include', '/register')
      
      cy.contains('Accedi qui').click()
      cy.url().should('include', '/login')
    })

    it('should redirect to login when accessing protected pages without auth', () => {
      cy.visit('/dashboard')
      // Assuming you have auth protection, should redirect to login
      // This depends on your auth implementation
    })
  })
})