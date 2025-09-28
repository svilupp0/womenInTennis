// 🔧 DISPLAY NAME UTILITIES
// Utilities per gestire nomi utente lunghi e migliorare la UX

/**
 * Tronca intelligentemente il display name per evitare overflow
 * @param {string} name - Il nome completo da troncare
 * @param {number} maxLength - Lunghezza massima (default: 20)
 * @param {boolean} isMobile - Se è un dispositivo mobile (default: false)
 * @returns {string} Nome troncato
 */
export const truncateDisplayName = (name, maxLength = 20, isMobile = false) => {
  if (!name || typeof name !== 'string') {
    return 'Utente';
  }

  // Su mobile, usa una lunghezza più conservativa
  const effectiveMaxLength = isMobile ? Math.min(maxLength, 15) : maxLength;
  
  // Se il nome è già abbastanza corto, restituiscilo così com'è
  if (name.length <= effectiveMaxLength) {
    return name;
  }

  // Se è un'email, estrai solo la parte username
  if (name.includes('@')) {
    const username = name.split('@')[0];
    
    // Se l'username è abbastanza corto, usalo
    if (username.length <= effectiveMaxLength) {
      return username;
    }
    
    // Altrimenti tronca l'username
    return username.substring(0, effectiveMaxLength - 3) + '...';
  }

  // Per nomi normali, tronca e aggiungi ellipsis
  return name.substring(0, effectiveMaxLength - 3) + '...';
};

/**
 * Rileva se il dispositivo è mobile basandosi sulla larghezza dello schermo
 * @returns {boolean} True se è mobile
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Ottiene il display name ottimizzato per il dispositivo corrente
 * @param {string} name - Nome originale
 * @param {number} maxLength - Lunghezza massima
 * @returns {string} Nome ottimizzato
 */
export const getOptimizedDisplayName = (name, maxLength = 20) => {
  const mobile = isMobileDevice();
  return truncateDisplayName(name, maxLength, mobile);
};

/**
 * Formatta il nome per il tooltip (versione completa)
 * @param {string} name - Nome originale
 * @returns {string} Nome formattato per tooltip
 */
export const getTooltipDisplayName = (name) => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Se è un'email, mostra email completa nel tooltip
  if (name.includes('@')) {
    return `${name.split('@')[0]} (${name})`;
  }

  return name;
};

/**
 * Genera iniziali per avatar da un nome
 * @param {string} name - Nome completo
 * @returns {string} Iniziali (max 2 caratteri)
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return 'U'; // Default per "Utente"
  }

  // Se è un'email, usa la prima lettera dell'username
  if (name.includes('@')) {
    const username = name.split('@')[0];
    return username.charAt(0).toUpperCase();
  }

  // Per nomi normali, prendi le prime lettere delle parole
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Una sola parola: prendi le prime 2 lettere
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Più parole: prendi la prima lettera di ciascuna (max 2)
  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
};

/**
 * Valida se un display name è appropriato
 * @param {string} name - Nome da validare
 * @returns {object} Risultato validazione con isValid e suggerimenti
 */
export const validateDisplayName = (name) => {
  const result = {
    isValid: true,
    warnings: [],
    suggestions: []
  };

  if (!name || typeof name !== 'string') {
    result.isValid = false;
    result.warnings.push('Nome non valido');
    return result;
  }

  // Controlla lunghezza
  if (name.length > 50) {
    result.warnings.push('Nome molto lungo, potrebbe causare problemi di layout');
    result.suggestions.push('Considera di usare un nickname più corto');
  }

  // Controlla caratteri speciali problematici
  const problematicChars = /[<>"'&]/g;
  if (problematicChars.test(name)) {
    result.warnings.push('Contiene caratteri che potrebbero causare problemi');
    result.suggestions.push('Evita caratteri speciali come < > " \' &');
  }

  // Controlla se è solo spazi
  if (name.trim().length === 0) {
    result.isValid = false;
    result.warnings.push('Nome non può essere vuoto');
  }

  return result;
};

/**
 * Utility per debug - mostra informazioni sul display name
 * @param {string} name - Nome da analizzare
 */
export const debugDisplayName = (name) => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('🔍 Display Name Debug');
  console.log('Original:', name);
  console.log('Truncated (desktop):', truncateDisplayName(name, 20, false));
  console.log('Truncated (mobile):', truncateDisplayName(name, 20, true));
  console.log('Initials:', getInitials(name));
  console.log('Tooltip:', getTooltipDisplayName(name));
  console.log('Validation:', validateDisplayName(name));
  console.groupEnd();
};

// Export default per compatibilità
export default {
  truncateDisplayName,
  isMobileDevice,
  getOptimizedDisplayName,
  getTooltipDisplayName,
  validateDisplayName,
  getInitials,
  debugDisplayName
};