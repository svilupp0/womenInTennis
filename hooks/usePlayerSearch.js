import { useState, useEffect, useRef, useCallback } from 'react'
import {
  searchPlayers as searchPlayersService,
  fetchAvailableComuni,
} from '../lib/services/playerService'

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
 * @param {object} user - Utente corrente
 * @returns {object} - Stati e funzioni per la ricerca
 */
export function usePlayerSearch(user) {
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
    setIsLoadingComuni(true)
    try {
      const result = await fetchAvailableComuni()
      if (result.success) {
        setComuniDisponibili(result.comuni)
      } else {
        console.error('Errore caricamento comuni:', result.error)
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
  const executeSearch = useCallback(async () => {
    setIsSearching(true)
    try {
      const result = await searchPlayersService(searchFilters)
      if (result.success) {
        setSearchResults(result.users)
      } else {
        console.error('Errore ricerca:', result.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Errore ricerca:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchFilters])

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
      executeSearch()
    }, 500) // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [executeSearch])

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
    if (user) {
      loadComuniDisponibili()
    }
  }, [user])

  // Ricerca automatica quando cambiano i filtri (con debounce)
  useEffect(() => {
    if (user) {
      // Usa debounced search invece di executeSearch diretta
      debouncedSearch()
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchFilters, user, debouncedSearch])

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
    searchPlayers: executeSearch,
    loadComuniDisponibili,
  }
}
