/**
 * Player Service
 *
 * Centralizza la logica business per la ricerca e gestione giocatrici.
 * Estrae la logica da usePlayerSearch hook e componenti dashboard.
 */

/**
 * Cerca giocatrici con filtri
 * @param {Object} filters - Filtri ricerca
 * @returns {Promise<{success: boolean, users?: Array, error?: string}>}
 */
export async function searchPlayers(filters = {}) {
  try {
    const queryParams = new URLSearchParams()
    if (filters.comune) queryParams.append('comune', filters.comune)
    if (filters.sport) queryParams.append('sport', filters.sport)
    if (filters.livello) queryParams.append('livello', filters.livello)
    if (filters.disponibilita) queryParams.append('disponibilita', 'true')

    const response = await fetch(`/api/users/search?${queryParams}`)

    if (response.ok) {
      const data = await response.json()
      return { success: true, users: data.users || [] }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore ricerca giocatrici' }
    }
  } catch (error) {
    console.error('Errore ricerca giocatrici:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Carica lista comuni disponibili con conteggio giocatrici
 * @returns {Promise<{success: boolean, comuni?: Array, error?: string}>}
 */
export async function fetchAvailableComuni() {
  try {
    const response = await fetch('/api/comuni/available')

    if (response.ok) {
      const data = await response.json()
      return { success: true, comuni: data.comuni || [] }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore caricamento comuni' }
    }
  } catch (error) {
    console.error('Errore caricamento comuni:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Aggiorna profilo utente
 * @param {Object} profileData - Dati profilo da aggiornare
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function updateUserProfile(profileData) {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error || 'Errore aggiornamento profilo' }
      }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore aggiornamento profilo' }
    }
  } catch (error) {
    console.error('Errore aggiornamento profilo:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Aggiorna disponibilità utente
 * @param {boolean} available - Nuova disponibilità
 * @returns {Promise<{success: boolean, disponibilita?: boolean, error?: string}>}
 */
export async function updateUserAvailability(available) {
  try {
    const response = await fetch('/api/users/availability', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ disponibilita: available }),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, disponibilita: data.disponibilita }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore aggiornamento disponibilità' }
    }
  } catch (error) {
    console.error('Errore aggiornamento disponibilità:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Ottieni profilo utente
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function fetchUserProfile() {
  try {
    const response = await fetch('/api/users/profile')

    if (response.ok) {
      const data = await response.json()
      return { success: true, user: data.user }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || 'Errore caricamento profilo' }
    }
  } catch (error) {
    console.error('Errore caricamento profilo:', error)
    return { success: false, error: 'Errore di connessione' }
  }
}

/**
 * Valida dati profilo prima dell'aggiornamento
 * @param {Object} profileData - Dati profilo da validare
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateProfileData(profileData) {
  const errors = []

  // Validazione nome (opzionale ma se presente, deve essere valido)
  if (profileData.name !== undefined && profileData.name !== null) {
    const name = profileData.name.trim()
    if (name.length > 0 && name.length < 2) {
      errors.push('Il nome deve essere di almeno 2 caratteri')
    }
    if (name.length > 100) {
      errors.push('Il nome è troppo lungo (max 100 caratteri)')
    }
  }

  // Validazione comune (opzionale)
  if (profileData.comune !== undefined && profileData.comune !== null) {
    const comune = profileData.comune.trim()
    if (comune.length > 100) {
      errors.push('Il nome del comune è troppo lungo (max 100 caratteri)')
    }
  }

  // Validazione telefono (opzionale ma se presente, deve essere valido)
  if (profileData.telefono) {
    const telefono = profileData.telefono.trim()
    // Formato base: almeno 8 cifre, può contenere spazi, +, -, ()
    const telefonoRegex = /^[\d\s+\-()]{8,20}$/
    if (!telefonoRegex.test(telefono)) {
      errors.push('Numero di telefono non valido')
    }
  }

  // Validazione sport-livelli
  if (profileData.sportLevels) {
    if (!Array.isArray(profileData.sportLevels)) {
      errors.push('Sport-livelli deve essere un array')
    } else {
      profileData.sportLevels.forEach((sl, index) => {
        if (!sl.sport || !['TENNIS', 'PADEL'].includes(sl.sport)) {
          errors.push(`Sport non valido alla posizione ${index + 1}`)
        }
        if (!sl.livello || !['Principiante', 'Intermedio', 'Avanzato'].includes(sl.livello)) {
          errors.push(`Livello non valido alla posizione ${index + 1}`)
        }
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Genera messaggio WhatsApp per contattare giocatrice
 * @param {Object} player - Dati giocatrice
 * @param {Object} currentUser - Utente corrente
 * @returns {string} URL WhatsApp
 */
export function generateWhatsAppUrl(player, currentUser = {}) {
  if (!player.telefono) {
    return null
  }

  const phoneNumber = player.telefono.replace(/[^0-9]/g, '')
  const message = encodeURIComponent(
    `Ciao! Ho visto il tuo profilo su Women in Net e mi piacerebbe giocare insieme. Quando sei disponibile?`
  )

  return `https://wa.me/${phoneNumber}?text=${message}`
}

/**
 * Genera oggetto e corpo email per contattare giocatrice
 * @param {Object} player - Dati giocatrice
 * @param {Object} currentUser - Utente corrente con location e livello
 * @returns {{subject: string, body: string, mailto: string}}
 */
export function generateEmailContact(player, currentUser = {}) {
  const playerName = player.email.split('@')[0]
  const subject = 'Partner Tennis - Women in Net'
  const body = `Ciao ${playerName}!

Ho visto il tuo profilo su Women in Net e mi piacerebbe giocare insieme.

${currentUser.location ? `Sono di ${currentUser.location}` : ''}${currentUser.level ? ` e il mio livello è ${currentUser.level}` : ''}.

Quando sei disponibile per una partita?

Grazie!`

  return {
    subject,
    body,
    mailto: `mailto:${player.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  }
}
