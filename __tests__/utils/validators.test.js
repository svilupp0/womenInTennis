/**
 * Test per lib/utils/validators.js
 * Target: 95%+ coverage
 */

import {
  validateEmail,
  validatePassword,
  validateRequiredString,
  validateNumber,
  validateEnum,
  validateArray,
  validateSchema,
  validateId,
  validateDate,
  validatePhone,
  sanitizeString,
} from '../../lib/utils/validators'
import { ApiError } from '../../lib/utils/apiErrors'

// =============================================
// validateEmail
// =============================================
describe('validateEmail', () => {
  it('dovrebbe accettare email valida', () => {
    expect(() => validateEmail('test@example.com')).not.toThrow()
    expect(validateEmail('test@example.com')).toBe('test@example.com')
  })

  it('dovrebbe normalizzare email in minuscolo', () => {
    expect(validateEmail('TEST@EXAMPLE.COM')).toBe('test@example.com')
  })

  it('dovrebbe accettare email con sottodominio', () => {
    expect(() => validateEmail('user@mail.example.com')).not.toThrow()
  })

  it('dovrebbe accettare email con +', () => {
    expect(() => validateEmail('user+tag@example.com')).not.toThrow()
  })

  it('dovrebbe lanciare errore per email vuota', () => {
    expect(() => validateEmail('')).toThrow(ApiError)
    expect(() => validateEmail('')).toThrow('Email obbligatoria')
  })

  it('dovrebbe lanciare errore per null', () => {
    expect(() => validateEmail(null)).toThrow(ApiError)
    expect(() => validateEmail(null)).toThrow('Email obbligatoria')
  })

  it('dovrebbe lanciare errore per undefined', () => {
    expect(() => validateEmail(undefined)).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per numero', () => {
    expect(() => validateEmail(123)).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per formato non valido (manca @)', () => {
    expect(() => validateEmail('invalidemail')).toThrow(ApiError)
    expect(() => validateEmail('invalidemail')).toThrow('Formato email non valido')
  })

  it('dovrebbe lanciare errore per formato non valido (manca dominio)', () => {
    expect(() => validateEmail('test@')).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per formato non valido (manca TLD)', () => {
    expect(() => validateEmail('test@domain')).toThrow(ApiError)
  })

  it('dovrebbe avere statusCode 400', () => {
    try {
      validateEmail('')
    } catch (e) {
      expect(e.statusCode).toBe(400)
    }
  })
})

// =============================================
// validatePassword
// =============================================
describe('validatePassword', () => {
  it('dovrebbe accettare password valida (default: 8+ chars, upper, lower, number)', () => {
    expect(() => validatePassword('StrongPass1')).not.toThrow()
    expect(validatePassword('StrongPass1')).toBe('StrongPass1')
  })

  it('dovrebbe lanciare errore per password null', () => {
    expect(() => validatePassword(null)).toThrow(ApiError)
    expect(() => validatePassword(null)).toThrow('Password obbligatoria')
  })

  it('dovrebbe lanciare errore per password undefined', () => {
    expect(() => validatePassword(undefined)).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per password non stringa', () => {
    expect(() => validatePassword(12345678)).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per password troppo corta', () => {
    expect(() => validatePassword('Abc1')).toThrow(ApiError)
    expect(() => validatePassword('Abc1')).toThrow('almeno 8 caratteri')
  })

  it('dovrebbe accettare password con minLength personalizzato', () => {
    expect(() => validatePassword('Abc1', { minLength: 4 })).not.toThrow()
  })

  it('dovrebbe lanciare errore se manca maiuscola (requireUppercase: true)', () => {
    expect(() => validatePassword('lowercase1')).toThrow(ApiError)
    expect(() => validatePassword('lowercase1')).toThrow('maiuscola')
  })

  it('dovrebbe ignorare maiuscola se requireUppercase: false', () => {
    expect(() => validatePassword('lowercase1', { requireUppercase: false })).not.toThrow()
  })

  it('dovrebbe lanciare errore se manca minuscola (requireLowercase: true)', () => {
    expect(() => validatePassword('UPPERCASE1')).toThrow(ApiError)
    expect(() => validatePassword('UPPERCASE1')).toThrow('minuscola')
  })

  it('dovrebbe ignorare minuscola se requireLowercase: false', () => {
    expect(() => validatePassword('UPPERCASE1', { requireLowercase: false })).not.toThrow()
  })

  it('dovrebbe lanciare errore se manca numero (requireNumbers: true)', () => {
    expect(() => validatePassword('NoNumbers!')).toThrow(ApiError)
    expect(() => validatePassword('NoNumbers!')).toThrow('numero')
  })

  it('dovrebbe ignorare numero se requireNumbers: false', () => {
    expect(() =>
      validatePassword('NoNumbers', { requireNumbers: false, requireUppercase: false })
    ).not.toThrow()
  })

  it('dovrebbe lanciare errore se manca carattere speciale (requireSpecialChars: true)', () => {
    expect(() => validatePassword('NoSpecial1', { requireSpecialChars: true })).toThrow(ApiError)
    expect(() => validatePassword('NoSpecial1', { requireSpecialChars: true })).toThrow('speciale')
  })

  it('dovrebbe accettare password con carattere speciale', () => {
    expect(() => validatePassword('Special1!', { requireSpecialChars: true })).not.toThrow()
  })
})

// =============================================
// validateRequiredString
// =============================================
describe('validateRequiredString', () => {
  it('dovrebbe accettare stringa valida', () => {
    expect(validateRequiredString('hello', 'Campo')).toBe('hello')
  })

  it('dovrebbe fare trim della stringa', () => {
    expect(validateRequiredString('  hello  ', 'Campo')).toBe('hello')
  })

  it('dovrebbe lanciare errore per null', () => {
    expect(() => validateRequiredString(null, 'Campo')).toThrow(ApiError)
    expect(() => validateRequiredString(null, 'Campo')).toThrow('Campo obbligatorio')
  })

  it('dovrebbe lanciare errore per undefined', () => {
    expect(() => validateRequiredString(undefined, 'Campo')).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per non-stringa', () => {
    expect(() => validateRequiredString(123, 'Campo')).toThrow(ApiError)
    expect(() => validateRequiredString(123, 'Campo')).toThrow('stringa')
  })

  it('dovrebbe lanciare errore se lunghezza < minLength', () => {
    expect(() => validateRequiredString('a', 'Campo', { minLength: 5 })).toThrow(ApiError)
    expect(() => validateRequiredString('a', 'Campo', { minLength: 5 })).toThrow('almeno 5')
  })

  it('dovrebbe lanciare errore se lunghezza > maxLength', () => {
    expect(() => validateRequiredString('toolong', 'Campo', { maxLength: 3 })).toThrow(ApiError)
    expect(() => validateRequiredString('toolong', 'Campo', { maxLength: 3 })).toThrow('superare 3')
  })

  it('dovrebbe accettare senza trim se trim: false', () => {
    const result = validateRequiredString('  hello  ', 'Campo', { trim: false })
    expect(result).toBe('  hello  ')
  })

  it('dovrebbe usare il fieldName nel messaggio di errore', () => {
    expect(() => validateRequiredString(null, 'Nome')).toThrow('Nome obbligatorio')
  })
})

// =============================================
// validateNumber
// =============================================
describe('validateNumber', () => {
  it('dovrebbe accettare numero valido', () => {
    expect(validateNumber(42, 'Campo')).toBe(42)
  })

  it('dovrebbe convertire stringa numerica', () => {
    expect(validateNumber('42', 'Campo')).toBe(42)
  })

  it('dovrebbe lanciare errore per NaN', () => {
    expect(() => validateNumber('abc', 'Campo')).toThrow(ApiError)
    expect(() => validateNumber('abc', 'Campo')).toThrow('numero')
  })

  it('dovrebbe lanciare errore per valore sotto min', () => {
    expect(() => validateNumber(5, 'Campo', { min: 10 })).toThrow(ApiError)
    expect(() => validateNumber(5, 'Campo', { min: 10 })).toThrow('almeno 10')
  })

  it('dovrebbe lanciare errore per valore sopra max', () => {
    expect(() => validateNumber(15, 'Campo', { max: 10 })).toThrow(ApiError)
    expect(() => validateNumber(15, 'Campo', { max: 10 })).toThrow('superare 10')
  })

  it('dovrebbe accettare valore al limite min', () => {
    expect(validateNumber(10, 'Campo', { min: 10 })).toBe(10)
  })

  it('dovrebbe accettare valore al limite max', () => {
    expect(validateNumber(10, 'Campo', { max: 10 })).toBe(10)
  })

  it('dovrebbe lanciare errore per numero decimale con integer: true', () => {
    expect(() => validateNumber(3.5, 'Campo', { integer: true })).toThrow(ApiError)
    expect(() => validateNumber(3.5, 'Campo', { integer: true })).toThrow('intero')
  })

  it('dovrebbe accettare numero intero con integer: true', () => {
    expect(validateNumber(3, 'Campo', { integer: true })).toBe(3)
  })
})

// =============================================
// validateEnum
// =============================================
describe('validateEnum', () => {
  it('dovrebbe accettare valore valido', () => {
    expect(validateEnum('TENNIS', ['TENNIS', 'PADEL'], 'Sport')).toBe('TENNIS')
  })

  it('dovrebbe lanciare errore per valore non nella lista', () => {
    expect(() => validateEnum('CALCIO', ['TENNIS', 'PADEL'], 'Sport')).toThrow(ApiError)
    expect(() => validateEnum('CALCIO', ['TENNIS', 'PADEL'], 'Sport')).toThrow('TENNIS, PADEL')
  })

  it('dovrebbe lanciare errore per valore undefined', () => {
    expect(() => validateEnum(undefined, ['TENNIS', 'PADEL'], 'Sport')).toThrow(ApiError)
  })

  it('dovrebbe includere il fieldName nel messaggio', () => {
    expect(() => validateEnum('CALCIO', ['TENNIS', 'PADEL'], 'Sport')).toThrow('Sport')
  })

  it('dovrebbe accettare enum numerico', () => {
    expect(validateEnum(1, [1, 2, 3], 'Livello')).toBe(1)
  })
})

// =============================================
// validateArray
// =============================================
describe('validateArray', () => {
  it('dovrebbe accettare array valido', () => {
    expect(validateArray([1, 2, 3], 'Lista')).toEqual([1, 2, 3])
  })

  it('dovrebbe accettare array vuoto (minLength default 0)', () => {
    expect(validateArray([], 'Lista')).toEqual([])
  })

  it('dovrebbe lanciare errore per non-array', () => {
    expect(() => validateArray('stringa', 'Lista')).toThrow(ApiError)
    expect(() => validateArray('stringa', 'Lista')).toThrow('array')
  })

  it('dovrebbe lanciare errore per null', () => {
    expect(() => validateArray(null, 'Lista')).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore se lunghezza < minLength', () => {
    expect(() => validateArray([], 'Lista', { minLength: 1 })).toThrow(ApiError)
    expect(() => validateArray([], 'Lista', { minLength: 1 })).toThrow('almeno 1')
  })

  it('dovrebbe lanciare errore se lunghezza > maxLength', () => {
    expect(() => validateArray([1, 2, 3, 4], 'Lista', { maxLength: 3 })).toThrow(ApiError)
    expect(() => validateArray([1, 2, 3, 4], 'Lista', { maxLength: 3 })).toThrow('più di 3')
  })

  it('dovrebbe usare itemValidator per ogni elemento', () => {
    const itemValidator = jest.fn()
    validateArray([1, 2, 3], 'Lista', { itemValidator })
    expect(itemValidator).toHaveBeenCalledTimes(3)
  })

  it('dovrebbe lanciare errore se itemValidator fallisce', () => {
    const itemValidator = jest.fn().mockImplementation(() => {
      throw new Error('Elemento non valido')
    })
    expect(() => validateArray([1], 'Lista', { itemValidator })).toThrow(ApiError)
    expect(() => validateArray([1], 'Lista', { itemValidator })).toThrow('Lista[0]')
  })

  it('dovrebbe accettare array senza maxLength', () => {
    expect(() => validateArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'Lista')).not.toThrow()
  })
})

// =============================================
// validateSchema
// =============================================
describe('validateSchema', () => {
  it('dovrebbe validare schema semplice', () => {
    const schema = {
      name: { required: true },
      sport: { required: false },
    }
    const result = validateSchema({ name: 'Alice', sport: 'TENNIS' }, schema)
    expect(result.name).toBe('Alice')
    expect(result.sport).toBe('TENNIS')
  })

  it('dovrebbe lanciare errore per campo required mancante', () => {
    const schema = { name: { required: true } }
    expect(() => validateSchema({}, schema)).toThrow(ApiError)
    expect(() => validateSchema({}, schema)).toThrow('Validazione fallita')
  })

  it('dovrebbe ignorare campo non required e non fornito', () => {
    const schema = {
      name: { required: true },
      sport: { required: false },
    }
    const result = validateSchema({ name: 'Alice' }, schema)
    expect(result).not.toHaveProperty('sport')
  })

  it('dovrebbe applicare il validator se fornito', () => {
    const schema = {
      email: {
        required: true,
        validator: (v) => v.toLowerCase(),
      },
    }
    const result = validateSchema({ email: 'TEST@EXAMPLE.COM' }, schema)
    expect(result.email).toBe('test@example.com')
  })

  it('dovrebbe raccogliere errori multipli', () => {
    const schema = {
      name: { required: true },
      email: { required: true },
    }
    try {
      validateSchema({}, schema)
      fail('doveva lanciare')
    } catch (e) {
      expect(e.details).toHaveLength(2)
    }
  })

  it('dovrebbe lanciare errore per data non oggetto', () => {
    expect(() => validateSchema('stringa', {})).toThrow(ApiError)
    expect(() => validateSchema('stringa', {})).toThrow('non validi')
  })

  it('dovrebbe lanciare errore per data null', () => {
    expect(() => validateSchema(null, {})).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore se campo required è stringa vuota', () => {
    const schema = { name: { required: true } }
    expect(() => validateSchema({ name: '' }, schema)).toThrow(ApiError)
  })

  it('dovrebbe propagare errore del validator nel campo details', () => {
    const schema = {
      age: {
        required: true,
        validator: () => {
          throw new Error('Età non valida')
        },
      },
    }
    try {
      validateSchema({ age: 'abc' }, schema)
    } catch (e) {
      expect(e.details).toContain('Età non valida')
    }
  })
})

// =============================================
// validateId
// =============================================
describe('validateId', () => {
  it('dovrebbe accettare ID numerico valido', () => {
    expect(validateId(1, 'ID')).toBe(1)
    expect(validateId(100, 'ID')).toBe(100)
  })

  it('dovrebbe convertire stringa a numero', () => {
    expect(validateId('42', 'ID')).toBe(42)
  })

  it('dovrebbe lanciare errore per 0', () => {
    expect(() => validateId(0, 'ID')).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per numero negativo', () => {
    expect(() => validateId(-1, 'ID')).toThrow(ApiError)
  })

  it('dovrebbe lanciare errore per NaN', () => {
    expect(() => validateId('abc', 'ID')).toThrow(ApiError)
    expect(() => validateId('abc', 'ID')).toThrow('non valido')
  })

  it('dovrebbe usare fieldName nel messaggio', () => {
    expect(() => validateId('abc', 'EventoID')).toThrow('EventoID non valido')
  })
})

// =============================================
// validateDate
// =============================================
describe('validateDate', () => {
  it('dovrebbe accettare data ISO valida', () => {
    const result = validateDate('2024-06-15T10:00:00Z', 'Data')
    expect(result).toBeInstanceOf(Date)
  })

  it('dovrebbe accettare stringa data semplice', () => {
    const result = validateDate('2024-06-15', 'Data')
    expect(result).toBeInstanceOf(Date)
  })

  it('dovrebbe lanciare errore per data non valida', () => {
    expect(() => validateDate('not-a-date', 'Data')).toThrow(ApiError)
    expect(() => validateDate('not-a-date', 'Data')).toThrow('non valida')
  })

  it('dovrebbe usare il fieldName nel messaggio', () => {
    expect(() => validateDate('invalid', 'DataInizio')).toThrow('DataInizio non valida')
  })

  it('dovrebbe usare fieldName default "Data"', () => {
    expect(() => validateDate('invalid')).toThrow('Data non valida')
  })
})

// =============================================
// validatePhone (opzionale)
// =============================================
describe('validatePhone', () => {
  it('dovrebbe accettare telefono italiano valido', () => {
    expect(validatePhone('+39 333 1234567')).toBe('+39 333 1234567')
  })

  it('dovrebbe accettare telefono senza prefisso', () => {
    expect(validatePhone('333 1234567')).toBe('333 1234567')
  })

  it('dovrebbe restituire il valore se null (opzionale)', () => {
    expect(validatePhone(null)).toBe(null)
  })

  it('dovrebbe restituire il valore se undefined (opzionale)', () => {
    expect(validatePhone(undefined)).toBe(undefined)
  })

  it('dovrebbe lanciare errore per formato non valido', () => {
    expect(() => validatePhone('abc')).toThrow(ApiError)
    expect(() => validatePhone('abc')).toThrow('non valido')
  })

  it('dovrebbe lanciare errore per numero troppo corto', () => {
    expect(() => validatePhone('123')).toThrow(ApiError)
  })
})

// =============================================
// sanitizeString
// =============================================
describe('sanitizeString', () => {
  it('dovrebbe escapare <', () => {
    expect(sanitizeString('<script>')).toContain('&lt;')
  })

  it('dovrebbe escapare >', () => {
    expect(sanitizeString('<script>')).toContain('&gt;')
  })

  it('dovrebbe escapare "', () => {
    expect(sanitizeString('"ciao"')).toContain('&quot;')
  })

  it("dovrebbe escapare '", () => {
    expect(sanitizeString("ciao'mondo")).toContain('&#x27;')
  })

  it('dovrebbe escapare /', () => {
    expect(sanitizeString('path/to/file')).toContain('&#x2F;')
  })

  it('dovrebbe restituire stringa invariata se non ha caratteri speciali', () => {
    expect(sanitizeString('hello world')).toBe('hello world')
  })

  it('dovrebbe restituire il valore se null', () => {
    expect(sanitizeString(null)).toBe(null)
  })

  it('dovrebbe restituire il valore se undefined', () => {
    expect(sanitizeString(undefined)).toBe(undefined)
  })

  it('dovrebbe proteggere da XSS base', () => {
    const xss = '<script>alert("xss")</script>'
    const result = sanitizeString(xss)
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('</script>')
  })

  it('dovrebbe gestire stringa vuota', () => {
    expect(sanitizeString('')).toBe('')
  })
})
