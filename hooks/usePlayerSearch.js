import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom Hook per gestione ricerca giocatrici
 *
 * Responsabilità:
 * - Gestione filtri di ricerca (comune, sport, livello, disponibilità)
 * - Caricamento comuni disponibili
 * - Ricerca giocatrici con filtri
 * - Stato loading e risultati
 *
 * Ottimizzazioni:
 * - Debounce 500ms per ridurre chiamate API durante digitazione
 * - useCallback per funzioni stabili
 *
 * @param {string} token - JWT token per autenticazione API
 * @param {object} user - Utente corrente
 * @returns {object} - Stati e funzioni per la ricerca
 */
export function usePlayerSearch(token, user) {
  // Stati filtri
  const [searchFilters, setSearchFilters] = useState({
    comune: '',
    sport: '',
    livello: '',
    disponibilita: true,
  })

  // Stati risultati e comuni
  const [searchResults, setSearchResults] = useState([])
  const [comuniDisponibili, setComuniDisponibili] = useState([])

  // Stati loading
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingComuni, setIsLoadingComuni] = useState(false)

  // Ref per debounce timer
  const debounceTimerRef = useRef(null)

  /**
   * Carica lista comuni disponibili con conteggio giocatrici
   */
  const loadComuniDisponibili = async () => {
    if (!token) return

    setIsLoadingComuni(true)
    try {
      const response = await fetch('/api/comuni/available', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setComuniDisponibili(data.comuni || [])
      } else {
        console.error('Errore caricamento comuni:', response.statusText)
        setComuniDisponibili([])
      }
    } catch (error) {
      console.error('Errore caricamento comuni:', error)
      setComuniDisponibili([])
    } finally {
      setIsLoadingComuni(false)
    }
  }

  /**
   * Ricerca giocatrici con i filtri attuali
   * Memoized con useCallback per evitare ricreazione
   */
  const searchPlayers = useCallback(async () => {
    if (!token) return

    setIsSearching(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchFilters.comune) queryParams.append('comune', searchFilters.comune)
      if (searchFilters.sport) queryParams.append('sport', searchFilters.sport)
      if (searchFilters.livello) queryParams.append('livello', searchFilters.livello)
      if (searchFilters.disponibilita) queryParams.append('disponibilita', 'true')

      const response = await fetch(`/api/users/search?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      } else {
        console.error('Errore ricerca:', response.statusText)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Errore ricerca:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [token, searchFilters])

  /**
   * Ricerca con debounce - chiamata dopo 500ms di inattività
   */
  const debouncedSearch = useCallback(() => {
    // Cancella timer precedente
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Imposta nuovo timer
    debounceTimerRef.current = setTimeout(() => {
      searchPlayers()
    }, 500) // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchPlayers])

  /**
   * Aggiorna un singolo filtro
   */
  const handleFilterChange = (filterName, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  /**
   * Reset tutti i filtri ai valori di default
   */
  const resetFilters = () => {
    setSearchFilters({
      comune: '',
      sport: '',
      livello: '',
      disponibilita: true,
    })
  }

  // Carica comuni all'avvio
  useEffect(() => {
    if (user && token) {
      loadComuniDisponibili()
    }
  }, [user, token])

  // Ricerca automatica quando cambiano i filtri (con debounce)
  useEffect(() => {
    if (user && token) {
      // Usa debounced search invece di searchPlayers diretta
      debouncedSearch()
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchFilters, user, token, debouncedSearch])

  return {
    // Stati filtri
    searchFilters,
    handleFilterChange,
    resetFilters,

    // Risultati
    searchResults,
    isSearching,

    // Comuni
    comuniDisponibili,
    isLoadingComuni,

    // Funzioni
    searchPlayers,
    loadComuniDisponibili,
  }
}
