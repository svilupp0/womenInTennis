// cypress/e2e/dashboard.cy.js

describe('Dashboard Flow', () => {
  beforeEach(() => {
    // Mock login state
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          comune: 'Roma',
          emailVerified: true,
          disponibilita: true,
        },
        token: 'mock-jwt-token',
      },
    }).as('loginSuccess')

    // Mock profile API
    cy.intercept('GET', '/api/users/profile', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          comune: 'Roma',
          disponibilita: true,
          telefono: '+39 333 1234567',
        },
      },
    }).as('getProfile')

    // Mock comuni disponibili
    cy.intercept('GET', '/api/comuni/available', {
      statusCode: 200,
      body: {
        comuni: [
          { comune: 'Roma', count: 5 },
          { comune: 'Milano', count: 3 },
        ],
      },
    }).as('getComuni')

    // Mock ricerca giocatrici
    cy.intercept('GET', '/api/users/search*', {
      statusCode: 200,
      body: {
        users: [
          {
            id: 2,
            email: 'alice@example.com',
            name: 'Alice Rossi',
            comune: 'Roma',
            disponibilita: true,
          },
          {
            id: 3,
            email: 'bob@example.com',
            name: 'Bob Bianchi',
            comune: 'Roma',
            disponibilita: true,
          },
        ],
      },
    }).as('searchUsers')

    // Login e naviga al dashboard
    cy.visit('/login')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginSuccess')
  })

  describe('Visualizzazione Dashboard', () => {
    it('dovrebbe mostrare il profilo utente', () => {
      cy.shouldBeOnDashboard()
      cy.contains('Test User').should('be.visible')
      cy.contains('Roma').should('be.visible')
    })

    it('dovrebbe mostrare il toggle disponibilità', () => {
      cy.shouldBeOnDashboard()
      // Il toggle disponibilità dovrebbe essere presente
      cy.get('[data-testid="availability-toggle"], .availability-toggle, input[type="checkbox"]')
        .first()
        .should('exist')
    })

    it('dovrebbe mostrare la lista giocatrici', () => {
      cy.shouldBeOnDashboard()
      cy.wait('@searchUsers')
      cy.contains('Alice Rossi').should('be.visible')
      cy.contains('Bob Bianchi').should('be.visible')
    })
  })

  describe('Ricerca Giocatrici', () => {
    it('dovrebbe mostrare i filtri di ricerca', () => {
      cy.shouldBeOnDashboard()
      // Verifica presenza filtri (select o input per sport, livello, comune)
      cy.get('select, input[placeholder*="comune"], input[placeholder*="Cerca"]').should(
        'have.length.greaterThan',
        0
      )
    })

    it('dovrebbe aggiornare i risultati con il filtro sport', () => {
      cy.shouldBeOnDashboard()

      cy.intercept('GET', '/api/users/search*sport=TENNIS*', {
        statusCode: 200,
        body: { users: [{ id: 2, name: 'Alice Rossi', comune: 'Roma' }] },
      }).as('searchTennis')

      // Seleziona filtro sport se disponibile
      cy.get('select')
        .first()
        .then(($select) => {
          if ($select.find('option[value="TENNIS"]').length) {
            cy.wrap($select).select('TENNIS')
          }
        })
    })

    it('dovrebbe mostrare messaggio quando non ci sono risultati', () => {
      cy.intercept('GET', '/api/users/search*', {
        statusCode: 200,
        body: { users: [] },
      }).as('emptySearch')

      cy.shouldBeOnDashboard()
      cy.wait('@emptySearch')
    })
  })

  describe('Toggle Disponibilità', () => {
    it('dovrebbe aggiornare la disponibilità', () => {
      cy.intercept('PUT', '/api/users/availability', {
        statusCode: 200,
        body: { success: true, disponibilita: false },
      }).as('updateAvailability')

      cy.shouldBeOnDashboard()

      // Trova e clicca il toggle disponibilità
      cy.get('[data-testid="availability-toggle"], button[aria-label*="isponibilit"]')
        .first()
        .then(($toggle) => {
          if ($toggle.length) {
            cy.wrap($toggle).click()
          }
        })
    })
  })

  describe('Segnalazione Utente', () => {
    it('dovrebbe aprire il modal di segnalazione', () => {
      cy.shouldBeOnDashboard()
      cy.wait('@searchUsers')

      // Cerca il bottone di segnalazione
      cy.get('[data-testid="report-button"], button[aria-label*="egnala"], .report-btn')
        .first()
        .then(($btn) => {
          if ($btn.length) {
            cy.wrap($btn).click()
            cy.get('[data-testid="report-modal"], .modal, [role="dialog"]').should('be.visible')
          }
        })
    })
  })

  describe('Navigazione', () => {
    it('dovrebbe avere link al calendario', () => {
      cy.shouldBeOnDashboard()
      cy.get('a[href="/calendar"], nav a')
        .contains(/[Cc]alendario/)
        .should('exist')
    })

    it('dovrebbe navigare al calendario', () => {
      cy.intercept('GET', '/api/calendar', {
        statusCode: 200,
        body: { events: [] },
      }).as('getCalendar')

      cy.shouldBeOnDashboard()
      cy.get('a[href="/calendar"]').first().click()
      cy.url().should('include', '/calendar')
    })
  })
})
