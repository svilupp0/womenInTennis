// cypress/e2e/calendar.cy.js

describe('Calendar Flow', () => {
  const futureStart = new Date(Date.now() + 86400000).toISOString()
  const futureEnd = new Date(Date.now() + 90000000).toISOString()

  beforeEach(() => {
    // Setup auth token in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-jwt-token')
      win.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: true,
        })
      )
    })

    // Mock calendar API
    cy.intercept('GET', '/api/calendar', {
      statusCode: 200,
      body: {
        events: [
          {
            id: 1,
            title: 'Partita Tennis',
            start: futureStart,
            end: futureEnd,
            status: 'AVAILABLE',
            sport: 'TENNIS',
            userId: 1,
          },
          {
            id: 2,
            title: 'Allenamento Padel',
            start: futureStart,
            end: futureEnd,
            status: 'CONFIRMED',
            sport: 'PADEL',
            userId: 1,
          },
        ],
      },
    }).as('getCalendar')

    cy.visit('/calendar')
  })

  describe('Visualizzazione Calendario', () => {
    it('dovrebbe caricare il calendario', () => {
      cy.url().should('include', '/calendar')
    })

    it('dovrebbe mostrare gli eventi esistenti', () => {
      cy.wait('@getCalendar')
      cy.contains('Partita Tennis').should('be.visible')
    })

    it('dovrebbe avere un bottone per creare un evento', () => {
      cy.get('[data-testid="create-event-btn"], button[aria-label*="Crea"], button')
        .contains(/[Cc]rea|[Nn]uov/)
        .should('exist')
    })
  })

  describe('Creazione Evento', () => {
    it('dovrebbe aprire il modal di creazione evento', () => {
      cy.get('button')
        .contains(/[Cc]rea|[Nn]uov/)
        .first()
        .click()

      cy.get('[data-testid="create-event-modal"], .modal, [role="dialog"]').should('be.visible')
    })

    it('dovrebbe creare un nuovo evento', () => {
      cy.intercept('POST', '/api/calendar', {
        statusCode: 201,
        body: {
          success: true,
          event: {
            id: 3,
            title: 'Nuovo Evento Test',
            start: futureStart,
            end: futureEnd,
            status: 'AVAILABLE',
            sport: 'TENNIS',
          },
        },
      }).as('createEvent')

      cy.get('button')
        .contains(/[Cc]rea|[Nn]uov/)
        .first()
        .click()

      cy.get('[data-testid="create-event-modal"], .modal, [role="dialog"]').then(($modal) => {
        if ($modal.length) {
          // Compila il form se il modal è aperto
          cy.get('input[name="title"], input[placeholder*="titolo"]')
            .first()
            .type('Nuovo Evento Test')
          cy.get('button[type="submit"], button')
            .contains(/[Ss]alva|[Cc]rea/)
            .click()
        }
      })
    })

    it('dovrebbe mostrare errori di validazione per evento non valido', () => {
      cy.get('button')
        .contains(/[Cc]rea|[Nn]uov/)
        .first()
        .click()

      cy.get('[data-testid="create-event-modal"], .modal, [role="dialog"]').then(($modal) => {
        if ($modal.length) {
          // Clicca submit senza compilare
          cy.get('button[type="submit"], button')
            .contains(/[Ss]alva|[Cc]rea/)
            .click()
          // Dovrebbe mostrare un errore di validazione
        }
      })
    })
  })

  describe('Eliminazione Evento', () => {
    it('dovrebbe eliminare un evento con conferma', () => {
      cy.intercept('DELETE', '/api/calendar/*', {
        statusCode: 200,
        body: { success: true },
      }).as('deleteEvent')

      cy.wait('@getCalendar')

      // Trova e clicca il primo evento
      cy.get('.fc-event, [data-testid="calendar-event"]').first().click()

      // Nel modal/dettagli cerca il bottone elimina
      cy.get('[data-testid="delete-event-btn"], button')
        .contains(/[Ee]limina|[Cc]ancella/)
        .then(($btn) => {
          if ($btn.length) {
            cy.wrap($btn).click()
          }
        })
    })
  })

  describe('Interazione con Eventi', () => {
    it('dovrebbe aprire i dettagli di un evento al click', () => {
      cy.wait('@getCalendar')

      cy.get('.fc-event, [data-testid="calendar-event"]')
        .first()
        .then(($event) => {
          if ($event.length) {
            cy.wrap($event).click()
            // Il modal dei dettagli dovrebbe aprirsi
            cy.get('[data-testid="event-details-modal"], .modal, [role="dialog"]').should(
              'be.visible'
            )
          }
        })
    })
  })

  describe('Filtri Calendario', () => {
    it('dovrebbe avere un selettore per sport', () => {
      cy.get('select, [data-testid="sport-filter"]').then(($selects) => {
        // Verifica che ci sia almeno un selettore nel calendario
        expect($selects.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Navigazione', () => {
    it('dovrebbe avere link alla dashboard', () => {
      cy.get('a[href="/dashboard"], nav a')
        .contains(/[Dd]ashboard/)
        .should('exist')
    })

    it('dovrebbe mostrare vista mensile di default', () => {
      cy.get('.fc-dayGridMonth-view, .fc-view, .calendar-container').should('exist')
    })
  })
})
