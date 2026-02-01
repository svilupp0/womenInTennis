## 📋 FASE 4: Piano Implementazione Dettagliato - Testing & Production Readiness

Perfetto! Ecco il piano completo step-by-step per implementare la **Fase 4** (8 settimane).

---

## 🎯 Obiettivi Fase 4

- ✅ Raggiungere **>80% overall test coverage**
- ✅ **0 vulnerabilità critiche** in produzione
- ✅ Deploy confidence **95%+**
- ✅ Performance: p95 <500ms, 100+ concurrent users
- ✅ Production-ready con monitoring completo

---

## 📅 SETTIMANA 1-2: Foundation & Setup

### **Giorno 1-2: Coverage Thresholds & Configuration**

**File da creare/modificare:**

1. `jest.config.js` - Aggiungere coverage thresholds

```javascript
module.exports = {
  // ... config esistente
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './lib/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './lib/utils/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'hooks/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    'pages/**/*.{js,jsx}',
    '!pages/_app.js',
    '!pages/_document.js',
    '!**/*.test.{js,jsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}
```

2. `package.json` - Aggiungere script testing avanzati

```json
{
  "scripts": {
    "test:unit": "jest --testPathPattern='__tests__/(services|utils|hooks)/'",
    "test:integration": "jest --testPathPattern='__tests__/api/'",
    "test:components": "jest --testPathPattern='__tests__/components/'",
    "test:coverage:ci": "jest --coverage --ci --maxWorkers=2",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e:headless"
  }
}
```

### **Giorno 3-4: Test Utilities & Mocks**

**File da creare:**

1. `__tests__/utils/testHelpers.js` - Utility comuni

```javascript
// Mock user factory
export const mockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  comune: 'Roma',
  emailVerified: true,
  ...overrides,
})

// Mock event factory
export const mockEvent = (overrides = {}) => ({
  id: 1,
  title: 'Test Event',
  start: new Date(),
  end: new Date(Date.now() + 3600000),
  status: 'AVAILABLE',
  sport: 'TENNIS',
  userId: 1,
  ...overrides,
})

// Mock fetch response
export const mockFetchSuccess = (data) => ({
  ok: true,
  json: async () => data,
  status: 200,
})

export const mockFetchError = (status = 500, message = 'Error') => ({
  ok: false,
  json: async () => ({ error: message }),
  status,
})
```

2. `__tests__/utils/mockPrisma.js` - Prisma mock utility

```javascript
export const createMockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  event: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  report: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
})
```

### **Giorno 5: Artillery Setup (Load Testing)**

**File da creare:**

1. `artillery.yml` - Configurazione load test
2. `artillery-functions.js` - Helper functions
3. `package.json` - Aggiungi `artillery` in devDependencies

**Comando:**

```bash
npm install --save-dev artillery @faker-js/faker
```

---

## 📅 SETTIMANA 3-4: Unit Tests (Priority 1)

### **Settimana 3: Utils & Services Foundation**

#### **Giorno 1-2: Test lib/utils/validators.js**

**File da creare:** `__tests__/utils/validators.test.js`

**Test da implementare (100 tests stimati):**

- `validateEmail()` - 15 tests
  - Email valide (standard, con +, subdomain)
  - Email invalide (formato, mancante @, dominio)
  - Disposable domains (tempmail.com, guerrillamail.com)
  - Edge cases (vuota, null, undefined)

- `validatePassword()` - 20 tests
  - Password forti/deboli
  - Opzioni (minLength, uppercase, numbers, special chars)
  - Edge cases

- `validateRequiredString()` - 10 tests
- `validateNumber()` - 8 tests
- `validateEnum()` - 5 tests
- `validateArray()` - 12 tests
- `validateSchema()` - 15 tests
- `validateId()` - 5 tests
- `validateDate()` - 8 tests
- `sanitizeString()` - 10 tests (XSS protection)

**Target:** 95%+ coverage validators.js

#### **Giorno 3: Test lib/utils/apiErrors.js**

**File da creare:** `__tests__/utils/apiErrors.test.js`

**Test da implementare (50 tests stimati):**

- `ApiError class` - 10 tests
- `CommonErrors` - 12 tests (ogni errore predefinito)
- `handleApiError()` - 15 tests
- `withErrorHandler()` - 10 tests
- `handlePrismaError()` - 8 tests

**Target:** 95%+ coverage apiErrors.js

#### **Giorno 4: Test lib/utils/eventColors.js**

**File da creare:** `__tests__/utils/eventColors.test.js`

**Test da implementare (30 tests stimati):**

- `getEventColor()` - 8 tests
- `getEventStatusLabel()` - 6 tests
- `prepareEventsForCalendar()` - 10 tests
- `isEventExpired()` - 6 tests

**Target:** 100% coverage eventColors.js

#### **Giorno 5: Review & Refactor**

- Fix failing tests
- Verify coverage >95% per utils/
- Code review

### **Settimana 4: Services Layer**

#### **Giorno 1-2: Test lib/services/eventService.js**

**File da creare:** `__tests__/services/eventService.test.js`

**Test da implementare (80 tests stimati):**

- `validateEventData()` - 25 tests
  - Validazione titolo, date, sport
  - End before start
  - Eventi nel passato
  - Campi mancanti

- `fetchUserEvents()` - 15 tests
  - Success case con colori applicati
  - Filtri (sport, status)
  - Eventi scaduti
  - Error handling

- `createEvent()` - 20 tests
- `updateEvent()` - 15 tests
- `deleteEvent()` - 5 tests

**Target:** 90%+ coverage eventService.js

#### **Giorno 3: Test lib/services/playerService.js**

**File da creare:** `__tests__/services/playerService.test.js`

**Test da implementare (70 tests stimati):**

- `validateProfileData()` - 20 tests
- `searchPlayers()` - 15 tests
- `updateUserProfile()` - 20 tests
- `updateUserAvailability()` - 10 tests
- `generateWhatsAppUrl()` - 5 tests

**Target:** 90%+ coverage playerService.js

#### **Giorno 4: Test lib/services/reportService.js**

**File da creare:** `__tests__/services/reportService.test.js`

**Test da implementare (70 tests stimati):**

- `validateReportData()` - 15 tests
- `createReport()` - 20 tests
- `fetchMyReports()` - 10 tests
- `getReportReasonLabel()` - 10 tests
- `canEditReport()`, `canDeleteReport()` - 15 tests

**Target:** 90%+ coverage reportService.js

#### **Giorno 5: Checkpoint**

- Verificare coverage services/ >90%
- Fix failing tests
- Refactoring se necessario

**OUTPUT SETTIMANA 3-4:**

- ✅ Utils coverage: **>95%**
- ✅ Services coverage: **>90%**
- ✅ ~300 unit tests implementati

---

## 📅 SETTIMANA 5-6: Integration Tests (API Routes + Hooks)

### **Settimana 5: API Routes**

#### **Giorno 1: Test pages/api/auth/**

**File da creare:**

- `__tests__/api/auth/login.test.js` (20 tests)
- `__tests__/api/auth/register.test.js` (25 tests)
- `__tests__/api/auth/verify-email.test.js` (15 tests)
- `__tests__/api/auth/reset-password.test.js` (20 tests)

**Pattern per ogni test:**

```javascript
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/auth/login'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma')

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'ValidPass123!',
      },
    })

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: '$2a$10$hashedPassword',
      emailVerified: true,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('token')
  })
})
```

#### **Giorno 2-3: Test pages/api/calendar/**

**File da creare:**

- `__tests__/api/calendar/index.test.js` (40 tests)
  - GET /api/calendar - 15 tests
  - POST /api/calendar - 15 tests
  - Authentication - 10 tests

- `__tests__/api/calendar/[id].test.js` (30 tests)
  - GET /api/calendar/[id] - 10 tests
  - PUT /api/calendar/[id] - 10 tests
  - DELETE /api/calendar/[id] - 10 tests

#### **Giorno 4: Test pages/api/users/**

**File da creare:**

- `__tests__/api/users/profile.test.js` (25 tests)
- `__tests__/api/users/search.test.js` (30 tests)
- `__tests__/api/users/availability.test.js` (20 tests)

#### **Giorno 5: Test pages/api/reports/**

**File da creare:**

- `__tests__/api/reports/create.test.js` (25 tests)
- `__tests__/api/reports/my.test.js` (15 tests)
- `__tests__/api/reports/stats.test.js` (10 tests)

### **Settimana 6: Custom Hooks**

#### **Giorno 1: Test hooks/usePlayerSearch.js**

**File da creare:** `__tests__/hooks/usePlayerSearch.test.js` (40 tests)

**Test da implementare:**

- Search con filtri - 10 tests
- Debounce (500ms) - 8 tests
- Fetch comuni disponibili - 8 tests
- Error handling - 8 tests
- Loading states - 6 tests

#### **Giorno 2: Test hooks/useProfileEditor.js**

**File da creare:** `__tests__/hooks/useProfileEditor.test.js` (45 tests)

#### **Giorno 3: Test hooks/useReports.js**

**File da creare:** `__tests__/hooks/useReports.test.js` (35 tests)

#### **Giorno 4: Test hooks/useCalendar.js**

**File da creare:** `__tests__/hooks/useCalendar.test.js` (40 tests)

#### **Giorno 5: Checkpoint Integration**

- Verificare coverage API routes >80%
- Verificare coverage hooks >85%
- Fix failing tests

**OUTPUT SETTIMANA 5-6:**

- ✅ API Routes coverage: **>80%**
- ✅ Hooks coverage: **>85%**
- ✅ ~350 integration tests implementati

---

## 📅 SETTIMANA 7: E2E Tests & Performance

### **Giorno 1-2: E2E Dashboard Flow**

**File da creare:** `cypress/e2e/dashboard.cy.js`

**Scenario da testare (15 tests):**

1. Login → Dashboard display
2. Profile card visualization
3. Toggle availability
4. Edit profile flow (completo)
5. Search players (filtri multiple)
6. Player card actions (WhatsApp, Email)
7. Report modal flow
8. View my reports

**Aggiungere data-testid a:**

- `pages/dashboard.js`
- `components/dashboard/*.js`

### **Giorno 3: E2E Calendar Flow**

**File da creare:** `cypress/e2e/calendar.cy.js`

**Scenario da testare (10 tests):**

1. View calendar events
2. Create event completo
3. Click event → details modal
4. Delete event con conferma
5. Filter events per sport
6. Event expiration handling
7. Validation errors

### **Giorno 4: E2E Report & Admin Flows**

**File da creare:**

- `cypress/e2e/reports.cy.js` (8 tests)
- `cypress/e2e/admin.cy.js` (7 tests)

### **Giorno 5: Load Testing con Artillery**

**Test da eseguire:**

1. Run baseline: 10 users sustained
2. Run medium load: 50 users sustained
3. Run peak load: 100 users sustained
4. Identify bottlenecks
5. Optimize query/caching se necessario

**Target Performance:**

- Response time p95: <500ms ✅
- Response time p99: <1000ms ✅
- Error rate: <1% ✅
- Throughput: 500+ req/sec ✅

---

## 📅 SETTIMANA 8: Coverage Goal & Production Hardening

### **Giorno 1-2: Coverage Gap Analysis**

**Task:**

1. Run `npm run test:coverage`
2. Identificare file sotto 80%
3. Scrivere test mancanti per raggiungere target
4. Focus su branch coverage (if/else non testati)

### **Giorno 3: Codecov Integration**

**Setup:**

1. Creare account su codecov.io
2. Integrare in `.github/workflows/ci.yml`
3. Configurare coverage comments su PR
4. Setup badge README

**File da modificare:** `.github/workflows/ci.yml`

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: true
    flags: unittests
```

### **Giorno 4: Production Hardening**

**Security Audit:**

```bash
npm audit --audit-level=moderate
npm run test:all
npm run build
```

**Checklist:**

- [ ] Zero vulnerabilità high/critical
- [ ] Tutti i test passano
- [ ] Coverage >80%
- [ ] Build production success
- [ ] Environment variables documentate

### **Giorno 5: Deploy Preparation**

**Pre-deployment Checklist:**

1. Database migrations ready
2. Environment variables configurate
3. Monitoring setup (Vercel Analytics)
4. Error tracking (opzionale: Sentry)
5. Backup strategy documentata
6. Rollback procedure pronta

**File da creare/aggiornare:**

1. `DEPLOYMENT.md` - Aggiungere sezione "Go-Live Checklist"
2. `CHANGELOG.md` - Documentare tutti i cambi Fase 4
3. `README.md` - Aggiornare badge coverage

---

## 📊 Metriche di Successo Fase 4

### **Before Fase 4 → After Fase 4**

| Metrica               | Prima  | Dopo         | Status    |
| --------------------- | ------ | ------------ | --------- |
| **Overall Coverage**  | ~35%   | >80%         | 🎯 Target |
| **Services Coverage** | 0%     | >90%         | 🎯 Target |
| **Utils Coverage**    | ~60%   | >95%         | 🎯 Target |
| **API Coverage**      | ~40%   | >80%         | 🎯 Target |
| **Hooks Coverage**    | ~20%   | >85%         | 🎯 Target |
| **E2E Scenarios**     | 3      | 40+          | 🎯 Target |
| **Load Test Pass**    | ❌     | ✅ 100 users | 🎯 Target |
| **Production Ready**  | ⚠️ 60% | ✅ 95%       | 🎯 Target |

### **Test Count Target**

- Unit Tests: **~300** tests
- Integration Tests: **~350** tests
- E2E Tests: **~40** scenarios
- **Total: ~690 tests**

---

## 📦 Deliverables Fase 4

### **Codice:**

- [ ] 15+ file `__tests__/` nuovi
- [ ] Coverage >80% overall
- [ ] Tutti i test passano in CI/CD

### **Documentazione:**

- [ ] `TESTING_STRATEGY.md` aggiornato con risultati
- [ ] `AUDIT_TECNICO.md` aggiornato (Fase 4 completata)
- [ ] `CHANGELOG.md` con tutti i test implementati
- [ ] Coverage badge in README

### **Infra/Tooling:**

- [ ] Artillery configurato
- [ ] Codecov integrato
- [ ] CI/CD con coverage gates
- [ ] Pre-commit hooks includono test

### **Production:**

- [ ] Security audit pulito
- [ ] Performance test passed
- [ ] Deploy preparation completa
- [ ] Monitoring configurato

---

## 💰 Effort Estimate Fase 4

**Team Required:**

- 1 Senior Developer (testing expertise)
- 1 Mid-level Developer (supporto)

**Timeline:** 8 settimane full-time

**Breakdown ore:**

- Settimana 1-2 (Setup): 70 ore
- Settimana 3-4 (Unit tests): 140 ore
- Settimana 5-6 (Integration): 140 ore
- Settimana 7 (E2E + Performance): 70 ore
- Settimana 8 (Coverage + Hardening): 60 ore
- **Totale: ~480 ore (12 settimane-persona)**

---

## 🚦 Go/No-Go Decision Points

### **Fine Settimana 2 (Foundation)**

- ✅ Tutti i test utilities funzionanti
- ✅ Coverage thresholds configurati
- ✅ Artillery setup completo
- ❌ **STOP se** config non funziona

### **Fine Settimana 4 (Unit Tests)**

- ✅ Services coverage >90%
- ✅ Utils coverage >95%
- ✅ 300+ tests passing
- ❌ **STOP se** coverage <85%

### **Fine Settimana 6 (Integration)**

- ✅ API coverage >80%
- ✅ Hooks coverage >85%
- ✅ 650+ tests passing
- ❌ **STOP se** test instabili

### **Fine Settimana 8 (Go-Live)**

- ✅ Overall coverage >80%
- ✅ Load test passed
- ✅ Zero vulnerabilità critical
- ✅ Build production success
- 🚀 **GO** per deploy production

---

## ❓ Prossimi Passi

Ora che hai il piano dettagliato, vuoi:

1. **Approvare il piano** e procedere con l'implementazione?
2. **Modificare priorità** (es. iniziare da E2E invece di unit tests)?
3. **Ridurre scope** (es. target 70% invece di 80%)?
4. **Iniziare subito** - Toggle ad ACT MODE e implementare Settimana 1?

Fammi sapere come procedere! 🚀
