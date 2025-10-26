import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Map.module.css'

export default function Map() {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const [markers, setMarkers] = useState([])
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false)

  useEffect(() => {
    // Funzione per inizializzare la mappa
    const initMap = () => {
      if (mapRef.current && window.google) {
        const mapOptions = {
          center: { lat: 41.9028, lng: 12.4964 }, // Roma come centro predefinito
          zoom: 6,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }

        const googleMap = new window.google.maps.Map(mapRef.current, mapOptions)
        setMap(googleMap)
        setIsLoaded(true)
        
        // Forza il resize della mappa dopo un breve delay
        setTimeout(() => {
          window.google.maps.event.trigger(googleMap, 'resize')
        }, 100)
        


        // Funzione per cercare strutture sportive nelle vicinanze usando la nostra API route
        const searchSportsFacilities = async (center, radius = 15000) => {
          try {
            const response = await fetch('/api/places/search-tennis', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                latitude: center.lat,
                longitude: center.lng,
                radius: radius
              })
            })

            if (!response.ok) {
              throw new Error(`API error! status: ${response.status}`)
            }

            const data = await response.json()
            
            if (!data.success) {
              throw new Error(data.error || 'Failed to search tennis courts')
            }
            
            const places = data.places || []
            
            places.forEach((place) => {
              if (place.location) {
                const marker = new window.google.maps.Marker({
                  position: {
                    lat: place.location.latitude,
                    lng: place.location.longitude
                  },
                  map: googleMap,
                  title: place.displayName?.text || 'Campo da tennis',
                  icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="12" fill="#e91e63" stroke="#fff" stroke-width="2"/>
                        <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🎾</text>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(32, 32)
                  }
                })

                // Info window con dettagli del posto reale
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                    <div style="padding: 12px; max-width: 250px;">
                      <h3 style="margin: 0 0 8px 0; color: #e91e63; font-size: 16px;">${place.displayName?.text || 'Campo da tennis'}</h3>
                      <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">
                        📍 ${place.formattedAddress || 'Indirizzo non disponibile'}
                      </p>
                      ${place.nationalPhoneNumber ? `
                        <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">
                          📞 ${place.nationalPhoneNumber}
                        </p>
                      ` : ''}
                      <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}', '_blank')" 
                              style="margin-top: 8px; padding: 6px 12px; background: #e91e63; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        🗺️ Visualizza su Google Maps
                      </button>
                    </div>
                  `
                })

                marker.addListener('click', () => {
                  infoWindow.open(googleMap, marker)
                })

                // Salva il marker per eventuale pulizia futura
                setMarkers(prev => [...prev, marker])
              }
            })
            
            if (places.length === 0) {
              console.log('Nessuna struttura sportiva trovata nelle vicinanze')
            }
          } catch (error) {
            console.error('Errore nella ricerca dei campi da tennis:', error)
          }
        }

        // Aggiungi marker per Matchpoint Lecce
        const matchpointMarker = new window.google.maps.Marker({
          position: { lat: 40.344500, lng: 18.212694 },
          map: googleMap,
          title: "Matchpoint Lecce",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#e91e63" stroke="#fff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🎾</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        })

        // Info window per Matchpoint Lecce
        const matchpointInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #e91e63; font-size: 16px;">Matchpoint Lecce</h3>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">
                📍 Via Provinciale Lecce - Vernole, KM 2, 73100 Lecce LE, Italia
              </p>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">
                📞 393 2023863
              </p>
              <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=40.344500,18.212694', '_blank')"
                      style="margin-top: 8px; padding: 6px 12px; background: #e91e63; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                🗺️ Visualizza su Google Maps
              </button>
            </div>
          `
        })

        matchpointMarker.addListener('click', () => {
          matchpointInfoWindow.open(googleMap, matchpointMarker)
        })

        // Salva il marker
        setMarkers(prev => [...prev, matchpointMarker])

        // Cerca strutture sportive nell'area iniziale (Roma)
        searchSportsFacilities({ lat: 41.9028, lng: 12.4964 }, 15000)
        
        // Aggiungi listener per cercare campi quando la mappa viene spostata
        let searchTimeout
        googleMap.addListener('idle', () => {
          // Debounce per evitare troppe chiamate API
          clearTimeout(searchTimeout)
          searchTimeout = setTimeout(() => {
            const center = googleMap.getCenter()
            if (center) {
              searchSportsFacilities({
                lat: center.lat(),
                lng: center.lng()
              }, 15000)
            }
          }, 1000)
        })
      }
    }

    // Assegna la funzione initMap al window object per la callback
    window.initMap = initMap

    // Carica lo script di Google Maps se non è già caricato
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    } else {
      // Se Google Maps è già caricato, inizializza direttamente
      initMap()
    }

    // Cleanup function
    return () => {
      if (window.initMap) {
        delete window.initMap
      }
    }
  }, [])

  const handleLocationSearch = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          map.setCenter(userLocation)
          map.setZoom(12)
          
          // Aggiungi marker per la posizione dell'utente
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: "La tua posizione",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#4285f4" stroke="#fff" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="#fff"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24)
            }
          })
        },
        (error) => {
          console.error('Errore nel recuperare la posizione:', error)
          alert('Impossibile recuperare la tua posizione. Assicurati di aver dato il permesso.')
        }
      )
    }
  }

  const handleSearch = () => {
    if (!searchInput.trim() || !map || !window.google) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        map.setCenter(location)
        map.setZoom(12)
        
        // Aggiungi marker per il luogo cercato
        new window.google.maps.Marker({
          position: location,
          map: map,
          title: searchInput,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#ff9800" stroke="#fff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">📍</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
          }
        })
      } else {
        alert('Luogo non trovato. Prova con un indirizzo più specifico.')
      }
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const searchSportsInCurrentArea = async () => {
    if (!map) return

    setIsSearchingPlaces(true)
    const center = map.getCenter()

    try {
      const response = await fetch('/api/places/search-tennis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: center.lat(),
          longitude: center.lng(),
          radius: 15000
        })
      })

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to search sports facilities')
      }

      const places = data.places || []

      // Pulisci marker precedenti delle strutture sportive (mantieni posizione utente)
      markers.forEach(marker => {
        if (marker.getTitle() !== 'La tua posizione' && !marker.getTitle().includes('📍')) {
          marker.setMap(null)
        }
      })

      const newMarkers = []
      places.forEach((place) => {
        if (place.location) {
          const marker = new window.google.maps.Marker({
            position: {
              lat: place.location.latitude,
              lng: place.location.longitude
            },
            map: map,
            title: place.displayName?.text || 'Struttura sportiva',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#e91e63" stroke="#fff" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🎾</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32)
            }
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #e91e63; font-size: 16px;">${place.displayName?.text || 'Struttura sportiva'}</h3>
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">
                  📍 ${place.formattedAddress || 'Indirizzo non disponibile'}
                </p>
                ${place.nationalPhoneNumber ? `
                  <p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">
                    📞 ${place.nationalPhoneNumber}
                  </p>
                ` : ''}
                <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${place.location.latitude},${place.location.longitude}', '_blank')"
                        style="margin-top: 8px; padding: 6px 12px; background: #e91e63; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  🗺️ Visualizza su Google Maps
                </button>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })

          newMarkers.push(marker)
        }
      })

      setMarkers(prev => [...prev.filter(m => m.getTitle() === 'La tua posizione' || m.getTitle().includes('📍')), ...newMarkers])

      if (places.length === 0) {
        alert('Nessuna struttura sportiva trovata in questa area. Prova a cercare in una zona diversa.')
      }
    } catch (error) {
      console.error('Errore nella ricerca delle strutture sportive:', error)
      alert('Errore nella ricerca delle strutture sportive. Riprova più tardi.')
    } finally {
      setIsSearchingPlaces(false)
    }
  }

  return (
    <>
      <Head>
        <title>Mappa Campi da Tennis e Padel - Women in Net</title>
        <meta name="description" content="Trova campi da tennis e padel e tenniste nella tua zona" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.mapPage}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
          <h1 className={styles.title}>
            🎾 Mappa Campi da Tennis e Padel
          </h1>
          <p className={styles.subtitle}>
            Trova campi da tennis e padel reali nella tua zona
          </p>
          </div>
        </header>

        {/* Controls */}
        <div className={styles.controls}>
          <button 
            className={styles.locationBtn}
            onClick={handleLocationSearch}
            disabled={!isLoaded}
          >
            📍 Trova la mia posizione
          </button>
          
          <button
            className={styles.locationBtn}
            onClick={searchSportsInCurrentArea}
            disabled={!isLoaded || isSearchingPlaces}
            style={{ background: '#4caf50' }}
          >
            {isSearchingPlaces ? '⏳ Cercando...' : '🎾 Cerca campi qui'}
          </button>
          
          <div className={styles.searchBox}>
            <input 
              type="text" 
              placeholder="Cerca città o indirizzo..."
              className={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className={styles.searchBtn}
              onClick={handleSearch}
              disabled={!isLoaded || !searchInput.trim()}
            >
              🔍
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className={styles.mapContainer}>
          <div 
            ref={mapRef} 
            className={styles.map}
            style={{ width: '100%', height: '100%' }}
          />
          
          {!isLoaded && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Caricamento mappa e ricerca strutture sportive...</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <h3>Legenda</h3>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon}>🎾</span>
            <span>Campi da tennis e padel</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon} style={{color: '#4285f4'}}>📍</span>
            <span>La tua posizione</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon} style={{color: '#ff9800'}}>📍</span>
            <span>Luogo cercato</span>
          </div>
          <div style={{marginTop: '1rem', padding: '0.5rem', background: '#f0f8ff', borderRadius: '4px', fontSize: '0.8rem'}}>
            💡 <strong>Suggerimento:</strong> Sposta la mappa e clicca "Cerca campi qui" per trovare campi da tennis e padel nell'area visualizzata
            <br />📏 <strong>Raggio di ricerca:</strong> 15 km dal centro della mappa
          </div>
        </div>
      </div>
    </>
  )
}