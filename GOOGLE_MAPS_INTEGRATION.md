# 🗺️ Integrazione Google Maps - Women in Tennis

## Panoramica
Questa documentazione descrive l'integrazione di Google Maps nella webapp Women in Tennis per visualizzare campi da tennis e posizioni delle giocatrici.

## 📁 File Creati/Modificati

### Nuovi File
- `pages/map.js` - Pagina principale della mappa
- `styles/Map.module.css` - Stili per la pagina mappa
- `GOOGLE_MAPS_INTEGRATION.md` - Questa documentazione

### File Modificati
- `pages/index.js` - Aggiunto link alla mappa nella homepage
- `pages/dashboard.js` - Aggiunto link alla mappa nell'header
- `styles/Dashboard.module.css` - Aggiunto stile per headerActions

## 🔧 Configurazione

### Variabili d'Ambiente
La chiave API di Google Maps è configurata nel file `.env`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyARB1jY0ZnHgzoVZFPhELkw4nT_x-dmK04"
```

### Script di Caricamento
La mappa utilizza il caricamento dinamico dello script Google Maps:
```javascript
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`
```

## 🎯 Funzionalità Implementate

### 1. Visualizzazione Mappa
- **Centro predefinito**: Roma (41.9028, 12.4964)
- **Zoom iniziale**: 6 (vista Italia)
- **Tipo mappa**: Roadmap
- **Stili personalizzati**: Nasconde POI per ridurre il clutter

### 2. Marker Campi da Tennis
- **Icone personalizzate**: Emoji tennis (🎾) su sfondo rosa
- **Info Window**: Popup con nome, indirizzo, telefono e pulsante Google Maps
- **Raggio di ricerca**: 15 km (ottimizzato per migliore copertura)
- **Dati visualizzati**: Nome, indirizzo, numero di telefono (quando disponibile)
- **Tipi di luoghi**: Complessi sportivi, club sportivi, stadi (ottimizzato per API Google Places)

### 3. Geolocalizzazione
- **Pulsante "Trova la mia posizione"**: Centra la mappa sulla posizione dell'utente
- **Marker utente**: Icona blu distintiva per la posizione corrente
- **Gestione errori**: Alert in caso di permessi negati

### 4. Ricerca Luoghi
- **Input di ricerca**: Campo per cercare città o indirizzi
- **Geocoding**: Conversione indirizzo → coordinate
- **Marker ricerca**: Icona arancione per luoghi cercati
- **Ricerca con Enter**: Supporto tasto Invio

### 5. Interfaccia Utente
- **Header attrattivo**: Gradiente rosa con titolo e sottotitolo
- **Controlli intuitivi**: Pulsanti per geolocalizzazione e ricerca
- **Loading state**: Spinner durante il caricamento
- **Legenda**: Spiegazione dei diversi tipi di marker
- **Design responsive**: Ottimizzato per mobile e desktop

## 🎨 Design e Stili

### Colori Principali
- **Rosa primario**: #e91e63 (tema tennis femminile)
- **Blu geolocalizzazione**: #4285f4 (standard Google)
- **Arancione ricerca**: #ff9800 (distintivo)

### Layout Responsive
- **Mobile**: Layout verticale, controlli stack
- **Tablet**: Layout ottimizzato per touch
- **Desktop**: Layout orizzontale, controlli inline

### Animazioni
- **Hover effects**: Trasformazioni sui pulsanti
- **Loading spinner**: Rotazione fluida
- **Transizioni**: Smooth per tutti gli stati

## 🔗 Navigazione

### Collegamenti Aggiunti
1. **Homepage** (`pages/index.js`):
   - Pulsante "🗺️ Esplora la mappa" nella sezione hero
   - Link "🗺️ Visualizza mappa" nella feature card

2. **Dashboard** (`pages/dashboard.js`):
   - Pulsante "🗺️ Mappa" nell'header accanto al logout

### URL della Mappa
- **Percorso**: `/map`
- **Titolo pagina**: "Mappa Campi da Tennis - Women in Tennis"

## 📱 Esperienza Mobile

### Ottimizzazioni Mobile
- **Touch-friendly**: Pulsanti dimensionati per il tocco
- **Viewport responsive**: Meta tag viewport configurato
- **Controlli stack**: Layout verticale su schermi piccoli
- **Mappa full-width**: Utilizzo completo dello spazio disponibile

### Gestione Orientamento
- **Portrait**: Layout verticale ottimizzato
- **Landscape**: Sfruttamento larghezza aggiuntiva

## 🚀 Funzionalità Future

### Possibili Miglioramenti
1. **Integrazione Database**:
   - Marker dinamici da database campi tennis
   - Posizioni giocatrici registrate

2. **Filtri Avanzati**:
   - Filtro per tipo di campo (terra, erba, cemento)
   - Filtro per disponibilità oraria
   - Filtro per livello giocatrici

3. **Interazioni Social**:
   - Chat integrata nei popup
   - Prenotazione campi
   - Organizzazione match

4. **Personalizzazione**:
   - Salvataggio campi preferiti
   - Cronologia ricerche
   - Notifiche di prossimità

## 🔒 Sicurezza

### Chiave API
- **Restrizioni dominio**: Configurare restrizioni nel Google Cloud Console
- **Limitazioni API**: Impostare quote per prevenire abusi
- **Monitoraggio**: Controllare regolarmente l'utilizzo

### Best Practices
- **Variabili ambiente**: Chiave API in .env (non committata)
- **Validazione input**: Sanitizzazione input di ricerca
- **Error handling**: Gestione graceful degli errori

## 📊 Metriche e Analytics

### Dati da Monitorare
- **Utilizzo mappa**: Numero di visualizzazioni
- **Ricerche**: Query più frequenti
- **Geolocalizzazione**: Tasso di utilizzo
- **Interazioni marker**: Click sui popup

### Google Maps Analytics
- **API calls**: Monitoraggio chiamate API
- **Performance**: Tempi di caricamento
- **Errori**: Rate di errore e tipologie

## 🛠️ Troubleshooting

### Problemi Comuni
1. **Mappa non si carica**:
   - Verificare chiave API
   - Controllare console per errori
   - Verificare connessione internet

2. **Geolocalizzazione non funziona**:
   - Verificare permessi browser
   - Controllare HTTPS (richiesto per geolocation)
   - Testare su dispositivi diversi

3. **Ricerca non trova risultati**:
   - Verificare formato indirizzo
   - Controllare limiti API Geocoding
   - Testare con query diverse

### Debug
```javascript
// Abilitare debug Google Maps
window.google.maps.event.addListener(map, 'idle', function() {
  console.log('Map loaded successfully');
});
```

## 📞 Supporto

Per problemi o domande sull'integrazione Google Maps:
1. Controllare la documentazione ufficiale Google Maps JavaScript API
2. Verificare lo stato dei servizi Google Cloud
3. Consultare la community Stack Overflow
4. Contattare il team di sviluppo

---

**Ultima modifica**: Dicembre 2024  
**Versione**: 1.0  
**Autore**: Team Women in Tennis