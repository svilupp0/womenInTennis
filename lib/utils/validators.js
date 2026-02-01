/**
 * Validation Utilities
 *
 * Centralizza tutte le validazioni usate nelle API routes.
 * Fornisce funzioni riutilizzabili per validare input comuni.
 */

import { ApiError, ErrorTypes } from './apiErrors'

/**
 * Valida email
 * @param {string} email - Email da validare
 * @throws {ApiError} Se email non valida
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new ApiError('Email obbligatoria', 400, ErrorTypes.VALIDATION_ERROR)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ApiError('Formato email non valido', 400, ErrorTypes.VALIDATION_ERROR)
  }

  return email.toLowerCase().trim()
}

/**
 * Valida password
 * @param {string} password - Password da validare
 * @param {object} options - Opzioni validazione
 * @throws {ApiError} Se password non valida
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options

  if (!password || typeof password !== 'string') {
    throw new ApiError('Password obbligatoria', 400, ErrorTypes.VALIDATION_ERROR)
  }

  if (password.length < minLength) {
    throw new ApiError(
      `Password deve essere di almeno ${minLength} caratteri`,
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    throw new ApiError(
      'Password deve contenere almeno una lettera maiuscola',
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    throw new ApiError(
      'Password deve contenere almeno una lettera minuscola',
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  if (requireNumbers && !/\d/.test(password)) {
    throw new ApiError('Password deve contenere almeno un numero', 400, ErrorTypes.VALIDATION_ERROR)
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new ApiError(
      'Password deve contenere almeno un carattere speciale',
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  return password
}

/**
 * Valida stringa non vuota
 * @param {string} value - Valore da validare
 * @param {string} fieldName - Nome campo (per messaggio errore)
 * @param {object} options - Opzioni
 * @throws {ApiError} Se non valido
 */
export function validateRequiredString(value, fieldName, options = {}) {
  const { minLength = 1, maxLength = 1000, trim = true } = options

  if (value === undefined || value === null) {
    throw new ApiError(`${fieldName} obbligatorio`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  if (typeof value !== 'string') {
    throw new ApiError(`${fieldName} deve essere una stringa`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  const processedValue = trim ? value.trim() : value

  if (processedValue.length < minLength) {
    throw new ApiError(
      `${fieldName} deve essere di almeno ${minLength} caratteri`,
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  if (processedValue.length > maxLength) {
    throw new ApiError(
      `${fieldName} non può superare ${maxLength} caratteri`,
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  return processedValue
}

/**
 * Valida numero
 * @param {any} value - Valore da validare
 * @param {string} fieldName - Nome campo
 * @param {object} options - Opzioni (min, max)
 * @throws {ApiError} Se non valido
 */
export function validateNumber(value, fieldName, options = {}) {
  const { min, max, integer = false } = options

  const num = Number(value)

  if (isNaN(num)) {
    throw new ApiError(`${fieldName} deve essere un numero`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  if (integer && !Number.isInteger(num)) {
    throw new ApiError(
      `${fieldName} deve essere un numero intero`,
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  if (min !== undefined && num < min) {
    throw new ApiError(`${fieldName} deve essere almeno ${min}`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  if (max !== undefined && num > max) {
    throw new ApiError(`${fieldName} non può superare ${max}`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  return num
}

/**
 * Valida enum (valore tra quelli permessi)
 * @param {any} value - Valore da validare
 * @param {array} allowedValues - Valori permessi
 * @param {string} fieldName - Nome campo
 * @throws {ApiError} Se non valido
 */
export function validateEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    throw new ApiError(
      `${fieldName} deve essere uno tra: ${allowedValues.join(', ')}`,
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  return value
}

/**
 * Valida array
 * @param {any} value - Valore da validare
 * @param {string} fieldName - Nome campo
 * @param {object} options - Opzioni
 * @throws {ApiError} Se non valido
 */
export function validateArray(value, fieldName, options = {}) {
  const { minLength = 0, maxLength, itemValidator } = options

  if (!Array.isArray(value)) {
    throw new ApiError(`${fieldName} deve essere un array`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  if (value.length < minLength) {
    throw new ApiError(
      `${fieldName} deve contenere almeno ${minLength} elementi`,
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new ApiError(
      `${fieldName} non può contenere più di ${maxLength} elementi`,
      400,
      ErrorTypes.VALIDATION_ERROR
    )
  }

  // Valida ogni elemento se fornito validator
  if (itemValidator && typeof itemValidator === 'function') {
    value.forEach((item, index) => {
      try {
        itemValidator(item, index)
      } catch (error) {
        throw new ApiError(
          `${fieldName}[${index}]: ${error.message}`,
          400,
          ErrorTypes.VALIDATION_ERROR
        )
      }
    })
  }

  return value
}

/**
 * Valida oggetto con schema
 * @param {object} data - Dati da validare
 * @param {object} schema - Schema validazione
 * @returns {object} Dati validati
 * @throws {ApiError} Se validazione fallisce
 */
export function validateSchema(data, schema) {
  if (!data || typeof data !== 'object') {
    throw new ApiError('Dati non validi', 400, ErrorTypes.VALIDATION_ERROR)
  }

  const validated = {}
  const errors = []

  for (const [field, rules] of Object.entries(schema)) {
    try {
      const value = data[field]

      // Verifica required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} è obbligatorio`)
        continue
      }

      // Skip se non required e non fornito
      if (!rules.required && (value === undefined || value === null)) {
        continue
      }

      // Applica validator se fornito
      if (rules.validator && typeof rules.validator === 'function') {
        validated[field] = rules.validator(value)
      } else {
        validated[field] = value
      }
    } catch (error) {
      errors.push(error.message)
    }
  }

  if (errors.length > 0) {
    throw new ApiError('Validazione fallita', 400, ErrorTypes.VALIDATION_ERROR, errors)
  }

  return validated
}

/**
 * Valida ID database
 * @param {any} id - ID da validare
 * @param {string} fieldName - Nome campo
 * @throws {ApiError} Se non valido
 */
export function validateId(id, fieldName = 'ID') {
  const numId = parseInt(id, 10)

  if (isNaN(numId) || numId <= 0) {
    throw new ApiError(`${fieldName} non valido`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  return numId
}

/**
 * Valida data
 * @param {string} dateString - Data in formato stringa
 * @param {string} fieldName - Nome campo
 * @throws {ApiError} Se non valida
 */
export function validateDate(dateString, fieldName = 'Data') {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    throw new ApiError(`${fieldName} non valida`, 400, ErrorTypes.VALIDATION_ERROR)
  }

  return date
}

/**
 * Valida telefono
 * @param {string} phone - Numero telefono
 * @throws {ApiError} Se non valido
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return phone // Opzionale
  }

  const cleanPhone = phone.trim()

  // Formato base: almeno 8 cifre, può contenere spazi, +, -, ()
  const phoneRegex = /^[\d\s+\-()]{8,20}$/

  if (!phoneRegex.test(cleanPhone)) {
    throw new ApiError('Numero di telefono non valido', 400, ErrorTypes.VALIDATION_ERROR)
  }

  return cleanPhone
}

/**
 * Sanitizza stringa (rimuove HTML pericoloso)
 * @param {string} str - Stringa da sanitizzare
 * @returns {string} Stringa pulita
 */
export function sanitizeString(str) {
  if (!str || typeof str !== 'string') return str

  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
