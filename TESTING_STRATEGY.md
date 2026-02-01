# 🧪 Testing Strategy - Women in Net

Strategia di testing completa per raggiungere **>80% coverage** e garantire qualità produzione.

**Data**: 1 Febbraio 2026
**Target**: Coverage >80%, Zero regression, Deploy confidence 95%

---

## 📋 Panoramica Strategia

### Piramide Testing

```
        /\
       /E2E\         10% - Happy paths + Edge cases
      /------\
     /  INT   \      30% - API routes + Integration
    /----------\
   /   UNIT     \    60% - Services, Hooks, Utils
  /--------------\
```

**Obiettivi Coverage:**

- **Services**: >90% (250+ tests)
- **Hooks**: >85% (150+ tests)
- **Utils**: >95% (100+ tests)
- **API Routes**: >80% (200+ tests)
- **Components**: >70% (150+ tests)
- **E2E**: 20+ critical paths

**Total Target**: >80% overall coverage

---

## 🎯 Unit Tests (60% piramide)

### Services Layer

**File da testare:**

- `lib/services/eventService.js` (263 righe)
- `lib/services/playerService.js` (283 righe)
- `lib/services/reportService.js` (307 righe)
- `lib/services/emailService.js`

**Pattern Test Example:**

```javascript
// __tests__/services/eventService.test.js
import { validateEventData, createEvent, fetchUserEvents } from '@/lib/services/eventService'

describe('eventService', () => {
  describe('validateEventData', () => {
    it('should validate correct event data', () => {
      const validData = {
        title: 'Tennis Match',
        start: new Date(),
        end: new Date(Date.now() + 3600000),
        sport: 'TENNIS',
      }

      const result = validateEventData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject event with end before start', () => {
      const invalidData = {
        title: 'Tennis Match',
        start: new Date(),
        end: new Date(Date.now() - 3600000),
        sport: 'TENNIS',
      }

      const result = validateEventData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data fine deve essere dopo data inizio')
    })

    it('should reject event in the past', () => {
      const invalidData = {
        title: 'Tennis Match',
        start: new Date(Date.now() - 86400000),
        end: new Date(Date.now() - 82800000),
        sport: 'TENNIS',
      }

      const result = validateEventData(invalidData)
      expect(result.isValid).toBe(false)
    })
  })
})
```

**Coverage Target**: 90%+ per service
**Tests stimati**: ~80 tests per eventService

### Utils & Validators

**File da testare:**

- `lib/utils/validators.js` (392 righe)
- `lib/utils/apiErrors.js` (238 righe)
- `lib/utils/eventColors.js` (129 righe)

**Pattern Test Example:**

```javascript
// __tests__/utils/validators.test.js
import {
  validateEmail,
  validatePassword,
  validateRequiredString,
  validateSchema,
} from '@/lib/utils/validators'

describe('validators', () => {
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })

    it('should reject disposable email domains', () => {
      expect(validateEmail('test@tempmail.com')).toBe(false)
      expect(validateEmail('test@guerrillamail.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('SecurePass123!', {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      })
      expect(result.isValid).toBe(true)
    })

    it('should reject weak password', () => {
      const result = validatePassword('weak', { minLength: 8 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password troppo corta')
    })
  })
})
```

**Coverage Target**: 95%+
**Tests stimati**: ~50 tests per validators.js

### Custom Hooks

**File da testare:**

- `hooks/usePlayerSearch.js` (156 righe)
- `hooks/useProfileEditor.js` (205 righe)
- `hooks/useReports.js` (176 righe)
- `hooks/useCalendar.js` (179 righe)

**Pattern Test Example:**

```javascript
// __tests__/hooks/usePlayerSearch.test.js
import { renderHook, waitFor } from '@testing-library/react'
import { usePlayerSearch } from '@/hooks/usePlayerSearch'

// Mock fetch
global.fetch = jest.fn()

describe('usePlayerSearch', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('should search players with filters', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        users: [
          { id: 1, email: 'player1@test.com', comune: 'Roma' },
          { id: 2, email: 'player2@test.com', comune: 'Roma' },
        ],
      }),
    })

    const { result } = renderHook(() => usePlayerSearch('fake-token', { id: 1 }))

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(2)
    })
  })

  it('should debounce search calls', async () => {
    jest.useFakeTimers()

    const { result } = renderHook(() => usePlayerSearch('fake-token', { id: 1 }))

    // Trigger multiple filter changes
    result.current.handleFilterChange('comune', 'Roma')
    result.current.handleFilterChange('comune', 'Milano')
    result.current.handleFilterChange('comune', 'Napoli')

    // Fast-forward 400ms (before debounce)
    jest.advanceTimersByTime(400)
    expect(fetch).not.toHaveBeenCalled()

    // Fast-forward remaining time (total 500ms)
    jest.advanceTimersByTime(100)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    jest.useRealTimers()
  })
})
```

**Coverage Target**: 85%+
**Tests stimati**: ~40 tests per hook

---

## 🔗 Integration Tests (30% piramide)

### API Routes

**File da testare:**

- `pages/api/auth/*.js` (login, register, verify, reset)
- `pages/api/calendar/*.js` (index, [id], public)
- `pages/api/users/*.js` (profile, search, availability)
- `pages/api/reports/*.js` (create, my, stats)
- `pages/api/admin/*.js` (reports, change-password)

**Pattern Test Example:**

```javascript
// __tests__/api/calendar/index.test.js
import handler from '@/pages/api/calendar/index'
import { createMocks } from 'node-mocks-http'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('/api/calendar', () => {
  describe('GET /api/calendar', () => {
    it('should return user events', async () => {
      const mockEvents = [
        { id: 1, title: 'Tennis Match', status: 'AVAILABLE' },
        { id: 2, title: 'Training Session', status: 'CONFIRMED' },
      ]

      prisma.event.findMany.mockResolvedValue(mockEvents)

      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer fake-token' },
      })

      req.userId = 1 // Mock auth middleware

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.events).toHaveLength(2)
      expect(data.events[0]).toHaveProperty('color')
    })

    it('should require authentication', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
    })
  })

  describe('POST /api/calendar', () => {
    it('should create new event', async () => {
      const newEvent = {
        title: 'Tennis Match',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        sport: 'TENNIS',
      }

      prisma.event.create.mockResolvedValue({
        id: 1,
        ...newEvent,
        userId: 1,
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: newEvent,
      })

      req.userId = 1

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(prisma.event.create).toHaveBeenCalled()
    })

    it('should validate event data', async () => {
      const invalidEvent = {
        title: '',
        start: new Date().toISOString(),
        end: new Date(Date.now() - 3600000).toISOString(),
      }

      const { req, res } = createMocks({
        method: 'POST',
        body: invalidEvent,
      })

      req.userId = 1

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
    })
  })
})
```

**Coverage Target**: 80%+
**Tests stimati**: ~150 tests API routes

---

## 🌐 E2E Tests (10% piramide)

### Critical User Paths

**Cypress Tests da implementare:**

1. **Authentication Flow** ✅ (Già esistente)
   - Login successful
   - Login with wrong credentials
   - Registration flow
   - Email verification
   - Password reset

2. **Dashboard Flow** (Da implementare)

   ```javascript
   // cypress/e2e/dashboard.cy.js
   describe('Dashboard', () => {
     beforeEach(() => {
       cy.login('test@example.com', 'password')
     })

     it('should display user profile', () => {
       cy.visit('/dashboard')
       cy.get('[data-testid="profile-card"]').should('be.visible')
       cy.get('[data-testid="user-name"]').should('contain', 'Test User')
     })

     it('should toggle availability', () => {
       cy.visit('/dashboard')
       cy.get('[data-testid="toggle-availability"]').click()
       cy.get('[data-testid="availability-status"]').should('contain', 'Disponibile')
     })

     it('should search for players', () => {
       cy.visit('/dashboard')
       cy.get('[data-testid="search-comune"]').select('Roma')
       cy.get('[data-testid="search-sport"]').select('TENNIS')
       cy.get('[data-testid="player-list"]')
         .find('[data-testid="player-card"]')
         .should('have.length.greaterThan', 0)
     })
   })
   ```

3. **Calendar Flow** (Da implementare)

   ```javascript
   // cypress/e2e/calendar.cy.js
   describe('Calendar', () => {
     beforeEach(() => {
       cy.login('test@example.com', 'password')
     })

     it('should create new event', () => {
       cy.visit('/calendar')
       cy.get('[data-testid="create-event-btn"]').click()
       cy.get('[data-testid="event-title"]').type('Tennis Match')
       cy.get('[data-testid="event-submit"]').click()
       cy.contains('Evento creato con successo').should('be.visible')
     })

     it('should display user events', () => {
       cy.visit('/calendar')
       cy.get('.fc-event').should('have.length.greaterThan', 0)
     })

     it('should delete event', () => {
       cy.visit('/calendar')
       cy.get('.fc-event').first().click()
       cy.get('[data-testid="delete-event-btn"]').click()
       cy.get('[data-testid="confirm-delete"]').click()
       cy.contains('Evento eliminato').should('be.visible')
     })
   })
   ```

4. **Report Flow** (Da implementare)
5. **Admin Flow** (Da implementare)

**Coverage Target**: 20+ critical paths
**Tests stimati**: ~25 E2E scenarios

---

## ⚡ Performance & Load Testing

### Load Testing con Artillery

**Setup:**

```bash
npm install --save-dev artillery
```

**Config: `artillery.yml`**

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Sustained load'
    - duration: 60
      arrivalRate: 100
      name: 'Peak load'
  processor: './artillery-functions.js'

scenarios:
  - name: 'User Login and Dashboard'
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password'
          capture:
            - json: '$.token'
              as: 'authToken'
      - get:
          url: '/api/users/search'
          headers:
            Authorization: 'Bearer {{ authToken }}'
      - get:
          url: '/api/calendar'
          headers:
            Authorization: 'Bearer {{ authToken }}'

  - name: 'Search Players'
    flow:
      - get:
          url: '/api/users/search?comune=Roma&sport=TENNIS'
```

**Esecuzione:**

```bash
# Run load test
npx artillery run artillery.yml

# Generate report
npx artillery run --output report.json artillery.yml
npx artillery report report.json
```

**Target Performance:**

- **Response time p95**: <500ms
- **Response time p99**: <1000ms
- **Error rate**: <1%
- **Concurrent users**: 100+
- **Requests/sec**: 500+

---

## 📊 Coverage Goals & Tracking

### Current Coverage (Stimato)

```
Components:  ~30%
API Routes:  ~40%
Hooks:       ~20%
Utils:       ~60%
Services:    ~0% (nuovi file)
Overall:     ~35%
```

### Target Coverage

```
Services:    >90%  ✅ Priority 1
Utils:       >95%  ✅ Priority 1
Hooks:       >85%  🟡 Priority 2
API Routes:  >80%  🟡 Priority 2
Components:  >70%  ⚠️  Priority 3
Overall:     >80%  ✅ Target
```

### Coverage Tracking

**Script package.json:**

```json
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "test:coverage:watch": "jest --coverage --watch",
    "test:coverage:threshold": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'",
    "test:coverage:report": "jest --coverage && open coverage/lcov-report/index.html"
  }
}
```

**CI/CD Integration (.github/workflows/ci.yml):**

```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Settimana 1-2)

- [x] Setup Jest + React Testing Library
- [x] Setup Cypress E2E
- [ ] Configurare coverage thresholds
- [ ] Setup Artillery per load testing
- [ ] Creare test utilities e mocks

### Phase 2: Unit Tests (Settimana 3-4)

- [ ] Test validators.js (100%)
- [ ] Test apiErrors.js (100%)
- [ ] Test eventColors.js (100%)
- [ ] Test eventService.js (90%+)
- [ ] Test playerService.js (90%+)
- [ ] Test reportService.js (90%+)

### Phase 3: Integration Tests (Settimana 5-6)

- [ ] Test API auth routes (80%+)
- [ ] Test API calendar routes (80%+)
- [ ] Test API users routes (80%+)
- [ ] Test API reports routes (80%+)
- [ ] Test hooks (85%+)

### Phase 4: E2E & Performance (Settimana 7-8)

- [ ] E2E dashboard flow
- [ ] E2E calendar flow
- [ ] E2E report flow
- [ ] E2E admin flow
- [ ] Load testing 100 concurrent users
- [ ] Performance profiling

### Phase 5: Coverage & CI/CD (Settimana 8)

- [ ] Raggiungere >80% coverage overall
- [ ] Configurare Codecov
- [ ] Integrare coverage in PR checks
- [ ] Documentare testing best practices

---

## 🛠️ Tools & Libraries

### Test Framework

- **Jest**: Unit + Integration tests
- **React Testing Library**: Component tests
- **Cypress**: E2E tests
- **node-mocks-http**: API route mocking
- **Artillery**: Load testing

### Coverage Tools

- **Istanbul**: Code coverage (built-in Jest)
- **Codecov**: Coverage tracking e reports
- **Lighthouse CI**: Performance testing

### Mocking

- **jest.mock()**: Mock modules
- **MSW** (Mock Service Worker): API mocking
- **faker.js**: Test data generation

---

## 📚 Best Practices

### 1. Test Naming Convention

```javascript
describe('ComponentName/FunctionName', () => {
  describe('specificMethod', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = 'value'

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### 2. AAA Pattern

- **Arrange**: Setup test data
- **Act**: Execute function/component
- **Assert**: Verify expectations

### 3. Test Isolation

- Ogni test deve essere indipendente
- **No shared state** tra tests
- Use `beforeEach` for setup, `afterEach` for cleanup

### 4. Mock External Dependencies

- Database (Prisma)
- API calls (fetch)
- External services (email,maps)

### 5. Test Edge Cases

- Empty inputs
- Invalid data
- Boundary conditions
- Error scenarios

---

## 📞 Resources

### Documentation

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Docs](https://docs.cypress.io)
- [Artillery Docs](https://artillery.io/docs)

### Internal Docs

- `TESTING_E2E.md`: E2E testing guide
- `API_PATTERNS.md`: API testing patterns
- `CONTRIBUTING.md`: PR testing requirements

---

**Ultimo aggiornamento**: 1 Febbraio 2026
**Owner**: CTO AI Technical Auditor
**Status**: 📋 **STRATEGIA DEFINITA** - Ready for Implementation
