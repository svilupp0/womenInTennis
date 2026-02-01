/**
 * API Error Handling Utilities
 *
 * Centralizza la gestione degli errori nelle API routes.
 * Fornisce risposte consistenti per tutti i tipi di errori.
 */

/**
 * Tipi di errori API
 */
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
}

/**
 * Classe errore API custom
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, type = ErrorTypes.INTERNAL_ERROR, details = null) {
    super(message)
    this.statusCode = statusCode
    this.type = type
    this.details = details
    this.name = 'ApiError'
  }
}

/**
 * Errori predefiniti comuni
 */
export const CommonErrors = {
  // 400 Bad Request
  INVALID_INPUT: new ApiError('Dati di input non validi', 400, ErrorTypes.BAD_REQUEST),
  MISSING_FIELDS: new ApiError('Campi obbligatori mancanti', 400, ErrorTypes.VALIDATION_ERROR),
  INVALID_FORMAT: new ApiError('Formato dati non valido', 400, ErrorTypes.VALIDATION_ERROR),

  // 401 Unauthorized
  NOT_AUTHENTICATED: new ApiError('Autenticazione richiesta', 401, ErrorTypes.AUTHENTICATION_ERROR),
  INVALID_TOKEN: new ApiError('Token non valido o scaduto', 401, ErrorTypes.AUTHENTICATION_ERROR),
  INVALID_CREDENTIALS: new ApiError('Credenziali non valide', 401, ErrorTypes.AUTHENTICATION_ERROR),

  // 403 Forbidden
  NOT_AUTHORIZED: new ApiError(
    'Non hai i permessi per questa operazione',
    403,
    ErrorTypes.AUTHORIZATION_ERROR
  ),
  ACCOUNT_LOCKED: new ApiError('Account bloccato', 403, ErrorTypes.AUTHORIZATION_ERROR),

  // 404 Not Found
  RESOURCE_NOT_FOUND: new ApiError('Risorsa non trovata', 404, ErrorTypes.NOT_FOUND),
  USER_NOT_FOUND: new ApiError('Utente non trovato', 404, ErrorTypes.NOT_FOUND),
  EVENT_NOT_FOUND: new ApiError('Evento non trovato', 404, ErrorTypes.NOT_FOUND),

  // 409 Conflict
  ALREADY_EXISTS: new ApiError('La risorsa esiste già', 409, ErrorTypes.CONFLICT),
  EMAIL_ALREADY_REGISTERED: new ApiError('Email già registrata', 409, ErrorTypes.CONFLICT),

  // 429 Too Many Requests
  RATE_LIMIT_EXCEEDED: new ApiError(
    'Troppe richieste. Riprova più tardi',
    429,
    ErrorTypes.RATE_LIMIT
  ),

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR: new ApiError('Errore interno del server', 500, ErrorTypes.INTERNAL_ERROR),
  DATABASE_ERROR: new ApiError('Errore database', 500, ErrorTypes.INTERNAL_ERROR),
}

/**
 * Handler centralizzato per errori API
 * Standardizza le risposte di errore
 *
 * @param {Error|ApiError} error - Errore da gestire
 * @param {object} res - Response object Next.js
 * @param {object} options - Opzioni aggiuntive
 */
export function handleApiError(error, res, options = {}) {
  const { includeStack = process.env.NODE_ENV === 'development' } = options

  // Log errore (in produzione usare un logger professionale)
  console.error('API Error:', {
    message: error.message,
    type: error.type,
    stack: error.stack,
  })

  // Se è un ApiError custom, usa i suoi dati
  if (error instanceof ApiError) {
    const response = {
      success: false,
      error: error.message,
      type: error.type,
    }

    if (error.details) {
      response.details = error.details
    }

    if (includeStack && error.stack) {
      response.stack = error.stack
    }

    return res.status(error.statusCode).json(response)
  }

  // Prisma errors
  if (error.code) {
    return handlePrismaError(error, res)
  }

  // Errore generico
  return res.status(500).json({
    success: false,
    error: 'Errore interno del server',
    type: ErrorTypes.INTERNAL_ERROR,
    ...(includeStack && { stack: error.stack }),
  })
}

/**
 * Gestisce errori Prisma specificici
 *
 * @param {Error} error - Errore Prisma
 * @param {object} res - Response object
 */
function handlePrismaError(error, res) {
  const errorMap = {
    P2002: {
      // Unique constraint violation
      statusCode: 409,
      message: 'Risorsa già esistente',
      type: ErrorTypes.CONFLICT,
    },
    P2025: {
      // Record not found
      statusCode: 404,
      message: 'Risorsa non trovata',
      type: ErrorTypes.NOT_FOUND,
    },
    P2003: {
      // Foreign key constraint violation
      statusCode: 400,
      message: 'Riferimento non valido',
      type: ErrorTypes.BAD_REQUEST,
    },
  }

  const mappedError = errorMap[error.code] || {
    statusCode: 500,
    message: 'Errore database',
    type: ErrorTypes.INTERNAL_ERROR,
  }

  return res.status(mappedError.statusCode).json({
    success: false,
    error: mappedError.message,
    type: mappedError.type,
  })
}

/**
 * Middleware per gestione errori API
 * Wrapper per route handlers che cattura automaticamente gli errori
 *
 * @param {function} handler - Route handler
 * @returns {function} Wrapped handler
 */
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res)
    } catch (error) {
      return handleApiError(error, res)
    }
  }
}

/**
 * Valida metodi HTTP permessi
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {array} allowedMethods - Metodi permessi (es: ['GET', 'POST'])
 * @returns {boolean} true se metodo valido
 */
export function validateHttpMethod(req, res, allowedMethods) {
  if (!allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods.join(', '))
    throw new ApiError(`Metodo ${req.method} non permesso`, 405, ErrorTypes.BAD_REQUEST)
  }
  return true
}

/**
 * Crea risposta di successo standardizzata
 *
 * @param {object} res - Response object
 * @param {object} data - Dati da restituire
 * @param {number} statusCode - Status code HTTP (default: 200)
 */
export function sendSuccess(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...data,
  })
}

/**
 * Crea risposta di errore standardizzata
 *
 * @param {object} res - Response object
 * @param {string} message - Messaggio errore
 * @param {number} statusCode - Status code HTTP (default: 400)
 * @param {string} type - Tipo errore
 */
export function sendError(res, message, statusCode = 400, type = ErrorTypes.BAD_REQUEST) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    type,
  })
}
