// lib/constants/errorMessages.js
// Messaggi di errore standardizzati per l'applicazione

export const ERROR_MESSAGES = {
  // Validazione input
  EMAIL_REQUIRED: 'Email è obbligatoria',
  EMAIL_INVALID_FORMAT: 'Formato email non valido',
  EMAIL_TOO_LONG: 'Email troppo lunga',
  EMAIL_DISPOSABLE: 'Email temporanee non sono consentite',
  
  PASSWORD_REQUIRED: 'Password è obbligatoria',
  PASSWORD_TOO_SHORT: 'Password deve essere di almeno 6 caratteri',
  PASSWORD_TOO_LONG: 'Password troppo lunga',
  PASSWORD_TOO_COMMON: 'Password troppo comune, scegline una più sicura',
  
  // Autenticazione
  CREDENTIALS_INVALID: 'Credenziali non valide',
  EMAIL_NOT_VERIFIED: 'Email non verificata. Controlla la tua casella di posta o richiedi un nuovo link di verifica.',
  ACCOUNT_LOCKED: 'Account temporaneamente bloccato. Riprova più tardi.',
  
  // Registrazione
  EMAIL_ALREADY_EXISTS: 'Un utente con questa email esiste già',
  EMAIL_EXISTS_VERIFIED: 'Un utente con questa email esiste già ed è verificato. Prova a fare login.',
  EMAIL_EXISTS_UNVERIFIED: 'Un utente con questa email esiste già ma non è verificato. Controlla la tua email o richiedi un nuovo link di verifica.',
  
  // Verifica email
  TOKEN_EMAIL_REQUIRED: 'Token e email sono obbligatori',
  USER_NOT_FOUND: 'Utente non trovato',
  EMAIL_ALREADY_VERIFIED: 'Email già verificata! Puoi fare login.',
  TOKEN_NOT_FOUND: 'Token di verifica non trovato. Richiedi un nuovo link.',
  TOKEN_EXPIRED: 'Token di verifica scaduto. Richiedi un nuovo link.',
  TOKEN_INVALID: 'Token di verifica non valido',
  
  // Rate limiting
  TOO_MANY_REGISTRATION_ATTEMPTS: 'Troppi tentativi di registrazione. Riprova tra 15 minuti.',
  TOO_MANY_LOGIN_ATTEMPTS: 'Troppi tentativi di login. Riprova tra 15 minuti.',
  TOO_MANY_VERIFICATION_ATTEMPTS: 'Troppi tentativi di verifica. Riprova tra 1 ora.',
  TOO_MANY_RESEND_ATTEMPTS: 'Troppi reinvii email. Riprova tra 1 ora.',
  
  // Metodi HTTP
  METHOD_NOT_ALLOWED: 'Metodo non consentito',
  
  // Errori generici
  INTERNAL_SERVER_ERROR: 'Errore interno del server. Riprova più tardi.',
  CONNECTION_ERROR: 'Errore di connessione',
  EMAIL_SEND_ERROR: 'Errore nell\'invio dell\'email. Riprova più tardi.',
  
  // Successo
  REGISTRATION_SUCCESS: 'Registrazione completata! Controlla la tua email per verificare l\'account.',
  LOGIN_SUCCESS: 'Login effettuato con successo!',
  EMAIL_VERIFICATION_SUCCESS: 'Email verificata con successo! Ora puoi fare login.',
  EMAIL_VERIFICATION_SENT: 'Email di verifica inviata! Controlla la tua casella di posta.',
}

// Codici di errore per identificazione programmatica
export const ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ALREADY_VERIFIED: 'ALREADY_VERIFIED',
  VERIFICATION_SUCCESS: 'VERIFICATION_SUCCESS',
  MISSING_PARAMS: 'MISSING_PARAMS',
  NO_TOKEN: 'NO_TOKEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
}

// Helper per creare risposte di errore consistenti
export const createErrorResponse = (message, code = null, statusCode = 400) => ({
  error: message,
  ...(code && { code }),
  timestamp: new Date().toISOString()
})

// Helper per creare risposte di successo consistenti
export const createSuccessResponse = (message, data = null, code = null) => ({
  success: true,
  message,
  ...(data && { ...data }),
  ...(code && { code }),
  timestamp: new Date().toISOString()
})