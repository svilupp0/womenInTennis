# 📚 API Routes - Pattern Standardizzati

**Data**: 01/02/2026  
**Obiettivo**: Standardizzare tutte le API routes per consistenza, manutenibilità e sicurezza

---

## 🎯 Obiettivi della Standardizzazione

1. **Consistenza**: Tutte le API routes seguono lo stesso pattern
2. **Error Handling**: Gestione errori centralizzata e uniforme
3. **Validazione**: Input validation riutilizzabile
4. **Security**: Auth middleware applicato correttamente
5. **Manutenibilità**: Codice DRY e facile da modificare

---

## 🏗️ Pattern Base

### **Struttura File API Route Standard**

```javascript
// pages/api/[resource]/index.js

import { withAuth } from '@/lib/middleware/authMiddleware'
import {
  withErrorHandler,
  validateHttpMethod,
  sendSuccess,
  sendError,
  ApiError,
} from '@/lib/utils/apiErrors'
import { validateSchema, validateEmail } from '@/lib/utils/validators'
import prisma from '@/lib/prisma'

/**
 * GET /api/resource - Lista risorse
 * POST /api/resource - Crea risorsa
 */
async function handler(req, res) {
  // 1. Valida metodo HTTP
  validateHttpMethod(req, res, ['GET', 'POST'])

  // 2. Route per metodo
  if (req.method === 'GET') {
    return await getResources(req, res)
  }

  if (req.method === 'POST') {
    return await createResource(req, res)
  }
}

/**
 * GET handler
 */
async function getResources(req, res) {
  const userId = req.userId // Fornito da withAuth

  // Query database
  const resources = await prisma.resource.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  })

  return sendSuccess(res, { resources })
}

/**
 * POST handler
 */
async function createResource(req, res) {
  const userId = req.userId

  // Validazione input con schema
  const validated = validateSchema(req.body, {
    name: {
      required: true,
      validator: (v) => validateRequiredString(v, 'Nome', { minLength: 2, maxLength: 100 }),
    },
    email: {
      required: true,
      validator: validateEmail,
    },
  })

  // Business logic
  const resource = await prisma.resource.create({
    data: {
      ...validated,
      userId,
    },
  })

  return sendSuccess(res, { resource }, 201)
}

// Export con middleware stack
export default withErrorHandler(withAuth(handler))
```

---

## 🔐 Pattern con Autenticazione

### **API Protetta (richiede login)**

```javascript
import { withAuth } from '@/lib/middleware/authMiddleware'
import { withErrorHandler } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  // userId è automaticamente disponibile da withAuth
  const userId = req.userId

  // ... logica API
}

export default withErrorHandler(withAuth(handler))
```

### **API Pubblica (no auth)**

```javascript
import { withErrorHandler } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  // Nessun userId disponibile
  // ... logica API
}

export default withErrorHandler(handler)
```

### **API con Auth Opzionale**

```javascript
import { withOptionalAuth } from '@/lib/middleware/authMiddleware'
import { withErrorHandler } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  // userId può essere undefined
  const userId = req.userId

  if (userId) {
    // Utente loggato
  } else {
    // Utente non loggato
  }
}

export default withErrorHandler(withOptionalAuth(handler))
```

---

## ✅ Pattern Validazione Input

### **Validazione Semplice**

```javascript
import { validateEmail, validatePassword } from '@/lib/utils/validators'
import { ApiError } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  const { email, password } = req.body

  // Valida singoli campi (throw ApiError se non validi)
  const validEmail = validateEmail(email)
  const validPassword = validatePassword(password)

  // ... usa validEmail e validPassword
}
```

### **Validazione con Schema**

```javascript
import { validateSchema, validateEmail, validateEnum } from '@/lib/utils/validators'

async function createUser(req, res) {
  const validated = validateSchema(req.body, {
    email: {
      required: true,
      validator: validateEmail,
    },
    name: {
      required: true,
      validator: (v) => validateRequiredString(v, 'Nome', { minLength: 2 }),
    },
    comune: {
      required: false,
      validator: (v) => validateRequiredString(v, 'Comune', { maxLength: 100 }),
    },
    sport: {
      required: true,
      validator: (v) => validateEnum(v, ['TENNIS', 'PADEL'], 'Sport'),
    },
  })

  // validated contiene solo campi validati
  const user = await prisma.user.create({ data: validated })

  return sendSuccess(res, { user })
}
```

---

## ❌ Pattern Error Handling

### **Errori Predefiniti**

```javascript
import { CommonErrors, ApiError } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  // Usa errori predefiniti
  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) {
    throw CommonErrors.USER_NOT_FOUND
  }

  if (user.locked) {
    throw CommonErrors.ACCOUNT_LOCKED
  }
}
```

### **Errori Custom**

```javascript
import { ApiError, ErrorTypes } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  // Crea errore custom
  if (condition) {
    throw new ApiError('Messaggio errore specifico', 400, ErrorTypes.VALIDATION_ERROR, {
      dettagli: 'opzionali',
    })
  }
}
```

### **Try-Catch Manuale (se necessario)**

```javascript
import { handleApiError } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  try {
    // Logica complessa
    const result = await complexOperation()
    return sendSuccess(res, { result })
  } catch (error) {
    // handleApiError gestisce sia ApiError che errori generici
    return handleApiError(error, res)
  }
}
```

---

## 📝 Pattern Risposte

### **Risposta Successo**

```javascript
import { sendSuccess } from '@/lib/utils/apiErrors'

// GET - Lista
return sendSuccess(res, { users: [...] })

// GET - Singola risorsa
return sendSuccess(res, { user: {...} })

// POST - Creazione (201 Created)
return sendSuccess(res, { user: {...} }, 201)

// PUT - Aggiornamento
return sendSuccess(res, { user: {...} })

// DELETE - Eliminazione (204 No Content)
return res.status(204).end()
```

### **Risposta Errore**

```javascript
import { sendError, ErrorTypes } from '@/lib/utils/apiErrors'

// Errore generico
return sendError(res, 'Messaggio errore')

// Errore con status code specifico
return sendError(res, 'Non trovato', 404, ErrorTypes.NOT_FOUND)
```

---

## 🔍 Pattern Query Parameters

### **Filtri e Paginazione**

```javascript
import { validateNumber, validateEnum } from '@/lib/utils/validators'

async function getUsers(req, res) {
  const { page = '1', limit = '10', sport, comune } = req.query

  // Valida parametri
  const pageNum = validateNumber(page, 'Page', { min: 1, integer: true })
  const limitNum = validateNumber(limit, 'Limit', { min: 1, max: 100, integer: true })

  // Build where clause
  const where = {}
  if (sport) {
    where.sport = validateEnum(sport, ['TENNIS', 'PADEL'], 'Sport')
  }
  if (comune) {
    where.comune = comune
  }

  // Query con paginazione
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ])

  return sendSuccess(res, {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  })
}
```

---

## 🆔 Pattern Route Dinamiche

### **API con ID parametro**

```javascript
// pages/api/users/[id].js

import { validateId } from '@/lib/utils/validators'
import { CommonErrors } from '@/lib/utils/apiErrors'

async function handler(req, res) {
  validateHttpMethod(req, res, ['GET', 'PUT', 'DELETE'])

  // Valida ID
  const userId = validateId(req.query.id, 'User ID')

  // Verifica ownership (se necessario)
  if (userId !== req.userId && !req.user.isAdmin) {
    throw CommonErrors.NOT_AUTHORIZED
  }

  if (req.method === 'GET') return await getUser(userId, req, res)
  if (req.method === 'PUT') return await updateUser(userId, req, res)
  if (req.method === 'DELETE') return await deleteUser(userId, req, res)
}

async function getUser(id, req, res) {
  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) {
    throw CommonErrors.USER_NOT_FOUND
  }

  return sendSuccess(res, { user })
}

export default withErrorHandler(withAuth(handler))
```

---

## 🚦 Checklist per Nuove API Routes

Prima di creare/modificare una API route, verifica:

- [ ] ✅ Usa `withAuth` se richiede autenticazione
- [ ] ✅ Usa `withErrorHandler` per catch automatico errori
- [ ] ✅ Valida metodi HTTP con `validateHttpMethod`
- [ ] ✅ Valida tutti gli input con validators da `lib/utils/validators`
- [ ] ✅ Usa `sendSuccess` per risposte positive
- [ ] ✅ Usa `ApiError` o `CommonErrors` per errori
- [ ] ✅ Non esporre dati sensibili nelle risposte
- [ ] ✅ Usa `select` in Prisma per limitare campi
- [ ] ✅ Aggiungi JSDoc con descrizione endpoint
- [ ] ✅ Testa con casi: success, auth fail, validation fail, not found

---

## 📦 Esempi Completi

### **Esempio 1: CRUD Completo**

```javascript
// pages/api/events/index.js
import { withAuth } from '@/lib/middleware/authMiddleware'
import { withErrorHandler, validateHttpMethod, sendSuccess } from '@/lib/utils/apiErrors'
import { validateSchema, validateDate, validateEnum } from '@/lib/utils/validators'
import prisma from '@/lib/prisma'

async function handler(req, res) {
  validateHttpMethod(req, res, ['GET', 'POST'])

  if (req.method === 'GET') return await getEvents(req, res)
  if (req.method === 'POST') return await createEvent(req, res)
}

async function getEvents(req, res) {
  const events = await prisma.event.findMany({
    where: { userId: req.userId },
    include: { proposals: true },
  })

  return sendSuccess(res, { events })
}

async function createEvent(req, res) {
  const validated = validateSchema(req.body, {
    title: {
      required: true,
      validator: (v) => validateRequiredString(v, 'Titolo', { maxLength: 200 }),
    },
    start: {
      required: true,
      validator: (v) => validateDate(v, 'Data inizio'),
    },
    end: {
      required: true,
      validator: (v) => validateDate(v, 'Data fine'),
    },
    sport: {
      required: true,
      validator: (v) => validateEnum(v, ['TENNIS', 'PADEL'], 'Sport'),
    },
  })

  const event = await prisma.event.create({
    data: {
      ...validated,
      userId: req.userId,
      status: 'AVAILABLE',
    },
  })

  return sendSuccess(res, { event }, 201)
}

export default withErrorHandler(withAuth(handler))
```

---

## 🎓 Best Practices

### ✅ DO

- Usa sempre `withErrorHandler` per catch automatico
- Valida **tutti** gli input utente
- Usa `select` per limitare campi esposti
- Documenta con JSDoc
- Testa edge cases

### ❌ DON'T

- Non fare `res.status().json()` direttamente - usa `sendSuccess`/`sendError`
- Non usare `try-catch` senza `handleApiError`
- Non esporre stack traces in produzione
- Non fidarti di input utente - valida sempre
- Non duplicare logica validazione

---

**Fine Documentazione Pattern API**

_Ultimo aggiornamento: 01/02/2026_
