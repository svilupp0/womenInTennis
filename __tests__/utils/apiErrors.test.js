/**
 * Test per lib/utils/apiErrors.js
 * Target: 95%+ coverage
 */

import {
  ApiError,
  ErrorTypes,
  CommonErrors,
  handleApiError,
  withErrorHandler,
  validateHttpMethod,
  sendSuccess,
  sendError,
} from '../../lib/utils/apiErrors'
import { createMocks } from 'node-mocks-http'

// =============================================
// ApiError class
// =============================================
describe('ApiError', () => {
  it('dovrebbe creare errore con messaggio', () => {
    const err = new ApiError('Messaggio errore')
    expect(err.message).toBe('Messaggio errore')
  })

  it('dovrebbe avere statusCode default 500', () => {
    const err = new ApiError('Errore')
    expect(err.statusCode).toBe(500)
  })

  it('dovrebbe avere type default INTERNAL_ERROR', () => {
    const err = new ApiError('Errore')
    expect(err.type).toBe(ErrorTypes.INTERNAL_ERROR)
  })

  it('dovrebbe impostare statusCode personalizzato', () => {
    const err = new ApiError('Not Found', 404, ErrorTypes.NOT_FOUND)
    expect(err.statusCode).toBe(404)
  })

  it('dovrebbe impostare type personalizzato', () => {
    const err = new ApiError('Errore', 400, ErrorTypes.VALIDATION_ERROR)
    expect(err.type).toBe(ErrorTypes.VALIDATION_ERROR)
  })

  it('dovrebbe impostare details', () => {
    const details = ['campo1 richiesto', 'campo2 non valido']
    const err = new ApiError('Errore', 400, ErrorTypes.VALIDATION_ERROR, details)
    expect(err.details).toEqual(details)
  })

  it('dovrebbe avere details null di default', () => {
    const err = new ApiError('Errore')
    expect(err.details).toBeNull()
  })

  it('dovrebbe avere name = "ApiError"', () => {
    const err = new ApiError('Errore')
    expect(err.name).toBe('ApiError')
  })

  it('dovrebbe essere istanza di Error', () => {
    const err = new ApiError('Errore')
    expect(err).toBeInstanceOf(Error)
  })

  it('dovrebbe essere istanza di ApiError', () => {
    const err = new ApiError('Errore')
    expect(err).toBeInstanceOf(ApiError)
  })
})

// =============================================
// ErrorTypes
// =============================================
describe('ErrorTypes', () => {
  it('dovrebbe avere VALIDATION_ERROR', () => {
    expect(ErrorTypes.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
  })

  it('dovrebbe avere AUTHENTICATION_ERROR', () => {
    expect(ErrorTypes.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR')
  })

  it('dovrebbe avere AUTHORIZATION_ERROR', () => {
    expect(ErrorTypes.AUTHORIZATION_ERROR).toBe('AUTHORIZATION_ERROR')
  })

  it('dovrebbe avere NOT_FOUND', () => {
    expect(ErrorTypes.NOT_FOUND).toBe('NOT_FOUND')
  })

  it('dovrebbe avere CONFLICT', () => {
    expect(ErrorTypes.CONFLICT).toBe('CONFLICT')
  })

  it('dovrebbe avere RATE_LIMIT', () => {
    expect(ErrorTypes.RATE_LIMIT).toBe('RATE_LIMIT')
  })

  it('dovrebbe avere INTERNAL_ERROR', () => {
    expect(ErrorTypes.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
  })

  it('dovrebbe avere BAD_REQUEST', () => {
    expect(ErrorTypes.BAD_REQUEST).toBe('BAD_REQUEST')
  })
})

// =============================================
// CommonErrors
// =============================================
describe('CommonErrors', () => {
  it('INVALID_INPUT dovrebbe avere status 400', () => {
    expect(CommonErrors.INVALID_INPUT.statusCode).toBe(400)
  })

  it('MISSING_FIELDS dovrebbe avere status 400', () => {
    expect(CommonErrors.MISSING_FIELDS.statusCode).toBe(400)
  })

  it('INVALID_FORMAT dovrebbe avere status 400', () => {
    expect(CommonErrors.INVALID_FORMAT.statusCode).toBe(400)
  })

  it('NOT_AUTHENTICATED dovrebbe avere status 401', () => {
    expect(CommonErrors.NOT_AUTHENTICATED.statusCode).toBe(401)
  })

  it('INVALID_TOKEN dovrebbe avere status 401', () => {
    expect(CommonErrors.INVALID_TOKEN.statusCode).toBe(401)
  })

  it('INVALID_CREDENTIALS dovrebbe avere status 401', () => {
    expect(CommonErrors.INVALID_CREDENTIALS.statusCode).toBe(401)
  })

  it('NOT_AUTHORIZED dovrebbe avere status 403', () => {
    expect(CommonErrors.NOT_AUTHORIZED.statusCode).toBe(403)
  })

  it('ACCOUNT_LOCKED dovrebbe avere status 403', () => {
    expect(CommonErrors.ACCOUNT_LOCKED.statusCode).toBe(403)
  })

  it('RESOURCE_NOT_FOUND dovrebbe avere status 404', () => {
    expect(CommonErrors.RESOURCE_NOT_FOUND.statusCode).toBe(404)
  })

  it('USER_NOT_FOUND dovrebbe avere status 404', () => {
    expect(CommonErrors.USER_NOT_FOUND.statusCode).toBe(404)
  })

  it('EVENT_NOT_FOUND dovrebbe avere status 404', () => {
    expect(CommonErrors.EVENT_NOT_FOUND.statusCode).toBe(404)
  })

  it('ALREADY_EXISTS dovrebbe avere status 409', () => {
    expect(CommonErrors.ALREADY_EXISTS.statusCode).toBe(409)
  })

  it('EMAIL_ALREADY_REGISTERED dovrebbe avere status 409', () => {
    expect(CommonErrors.EMAIL_ALREADY_REGISTERED.statusCode).toBe(409)
  })

  it('RATE_LIMIT_EXCEEDED dovrebbe avere status 429', () => {
    expect(CommonErrors.RATE_LIMIT_EXCEEDED.statusCode).toBe(429)
  })

  it('INTERNAL_SERVER_ERROR dovrebbe avere status 500', () => {
    expect(CommonErrors.INTERNAL_SERVER_ERROR.statusCode).toBe(500)
  })

  it('DATABASE_ERROR dovrebbe avere status 500', () => {
    expect(CommonErrors.DATABASE_ERROR.statusCode).toBe(500)
  })
})

// =============================================
// handleApiError
// =============================================
describe('handleApiError', () => {
  it('dovrebbe gestire ApiError e rispondere con statusCode corretto', () => {
    const { req, res } = createMocks()
    const err = new ApiError('Test error', 400, ErrorTypes.VALIDATION_ERROR)
    handleApiError(err, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toBe('Test error')
    expect(data.type).toBe(ErrorTypes.VALIDATION_ERROR)
  })

  it('dovrebbe includere details se presenti', () => {
    const { req, res } = createMocks()
    const err = new ApiError('Validazione', 400, ErrorTypes.VALIDATION_ERROR, ['campo mancante'])
    handleApiError(err, res)

    const data = JSON.parse(res._getData())
    expect(data.details).toEqual(['campo mancante'])
  })

  it('dovrebbe non includere details se null', () => {
    const { req, res } = createMocks()
    const err = new ApiError('Errore', 400, ErrorTypes.BAD_REQUEST)
    handleApiError(err, res)

    const data = JSON.parse(res._getData())
    expect(data).not.toHaveProperty('details')
  })

  it('dovrebbe gestire errori generici con status 500', () => {
    const { req, res } = createMocks()
    const err = new Error('Generic error')
    handleApiError(err, res)

    expect(res._getStatusCode()).toBe(500)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
  })

  it('dovrebbe gestire errori Prisma P2002 (conflict)', () => {
    const { req, res } = createMocks()
    const err = { code: 'P2002', message: 'Unique constraint' }
    handleApiError(err, res)

    expect(res._getStatusCode()).toBe(409)
    const data = JSON.parse(res._getData())
    expect(data.type).toBe(ErrorTypes.CONFLICT)
  })

  it('dovrebbe gestire errori Prisma P2025 (not found)', () => {
    const { req, res } = createMocks()
    const err = { code: 'P2025', message: 'Record not found' }
    handleApiError(err, res)

    expect(res._getStatusCode()).toBe(404)
    const data = JSON.parse(res._getData())
    expect(data.type).toBe(ErrorTypes.NOT_FOUND)
  })

  it('dovrebbe gestire errori Prisma P2003 (FK violation)', () => {
    const { req, res } = createMocks()
    const err = { code: 'P2003', message: 'FK constraint' }
    handleApiError(err, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.type).toBe(ErrorTypes.BAD_REQUEST)
  })

  it('dovrebbe gestire errori Prisma sconosciuti con status 500', () => {
    const { req, res } = createMocks()
    const err = { code: 'P9999', message: 'Unknown Prisma error' }
    handleApiError(err, res)

    expect(res._getStatusCode()).toBe(500)
  })
})

// =============================================
// withErrorHandler
// =============================================
describe('withErrorHandler', () => {
  it("dovrebbe chiamare l'handler e restituire il risultato", async () => {
    const { req, res } = createMocks({ method: 'GET' })
    const handler = jest.fn().mockResolvedValue('ok')
    const wrapped = withErrorHandler(handler)

    await wrapped(req, res)

    expect(handler).toHaveBeenCalledWith(req, res)
  })

  it('dovrebbe catturare ApiError e rispondere con status corretto', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    const handler = jest.fn().mockRejectedValue(new ApiError('Unauthorized', 401))
    const wrapped = withErrorHandler(handler)

    await wrapped(req, res)

    expect(res._getStatusCode()).toBe(401)
  })

  it('dovrebbe catturare errori generici e rispondere 500', async () => {
    const { req, res } = createMocks({ method: 'GET' })
    const handler = jest.fn().mockRejectedValue(new Error('Unexpected error'))
    const wrapped = withErrorHandler(handler)

    await wrapped(req, res)

    expect(res._getStatusCode()).toBe(500)
  })
})

// =============================================
// validateHttpMethod
// =============================================
describe('validateHttpMethod', () => {
  it('dovrebbe accettare metodo permesso', () => {
    const { req, res } = createMocks({ method: 'GET' })
    expect(() => validateHttpMethod(req, res, ['GET', 'POST'])).not.toThrow()
  })

  it('dovrebbe lanciare ApiError per metodo non permesso', () => {
    const { req, res } = createMocks({ method: 'DELETE' })
    expect(() => validateHttpMethod(req, res, ['GET', 'POST'])).toThrow(ApiError)
  })

  it('dovrebbe impostare header Allow nella risposta', () => {
    const { req, res } = createMocks({ method: 'DELETE' })
    try {
      validateHttpMethod(req, res, ['GET', 'POST'])
    } catch {
      // expected
    }
    expect(res.getHeader('Allow')).toBe('GET, POST')
  })

  it('dovrebbe restituire true per metodo valido', () => {
    const { req, res } = createMocks({ method: 'POST' })
    expect(validateHttpMethod(req, res, ['POST'])).toBe(true)
  })
})

// =============================================
// sendSuccess / sendError
// =============================================
describe('sendSuccess', () => {
  it('dovrebbe rispondere con status 200 di default', () => {
    const { req, res } = createMocks()
    sendSuccess(res, { data: 'test' })
    expect(res._getStatusCode()).toBe(200)
  })

  it('dovrebbe includere success: true', () => {
    const { req, res } = createMocks()
    sendSuccess(res, { message: 'ok' })
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
  })

  it('dovrebbe includere i dati passati', () => {
    const { req, res } = createMocks()
    sendSuccess(res, { message: 'creato' }, 201)
    const data = JSON.parse(res._getData())
    expect(data.message).toBe('creato')
    expect(res._getStatusCode()).toBe(201)
  })
})

describe('sendError', () => {
  it('dovrebbe rispondere con status 400 di default', () => {
    const { req, res } = createMocks()
    sendError(res, 'Errore test')
    expect(res._getStatusCode()).toBe(400)
  })

  it('dovrebbe includere success: false', () => {
    const { req, res } = createMocks()
    sendError(res, 'Errore')
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
  })

  it('dovrebbe includere il messaggio di errore', () => {
    const { req, res } = createMocks()
    sendError(res, 'Messaggio errore')
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Messaggio errore')
  })

  it('dovrebbe accettare status code personalizzato', () => {
    const { req, res } = createMocks()
    sendError(res, 'Non trovato', 404, ErrorTypes.NOT_FOUND)
    expect(res._getStatusCode()).toBe(404)
    const data = JSON.parse(res._getData())
    expect(data.type).toBe(ErrorTypes.NOT_FOUND)
  })
})
