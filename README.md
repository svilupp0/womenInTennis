# 🎾 Women in Tennis

Una piattaforma web dedicata alle donne appassionate di tennis per trovare partner di gioco, organizzare partite e scoprire campi da tennis nella propria zona.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![License](https://img.shields.io/badge/License-ISC-green)

## 🌟 Caratteristiche Principali

### 👥 **Gestione Utenti**
- **Registrazione e Login** sicuri con verifica email
- **Profili personalizzati** con informazioni tennis-specifiche
- **Sistema di sicurezza** con protezione da attacchi brute force
- **Gestione password** con reset sicuro

### 📅 **Sistema Calendario**
- **Calendario interattivo** per gestire disponibilità
- **Creazione eventi** per slot di gioco disponibili
- **Visualizzazione** delle proprie disponibilità e impegni
- **Integrazione FullCalendar** per un'esperienza utente ottimale

### 🤝 **Sistema Proposte**
- **Proponi partite** ad altre giocatrici
- **Gestione proposte** ricevute e inviate
- **Stati dinamici** (pending, accepted, rejected)
- **Messaggi personalizzati** nelle proposte

### 🗺️ **Mappa Interattiva**
- **Visualizzazione campi da tennis** nella zona
- **Geolocalizzazione** per trovare campi vicini
- **Ricerca per località** con geocoding
- **Integrazione Google Maps** con marker personalizzati

### 🛡️ **Sicurezza e Moderazione**
- **Sistema di report** per segnalazioni
- **Pannello admin** per moderazione
- **Security headers** configurati per produzione
- **Protezione CSRF** e XSS

### 📊 **Testing e Qualità**
- **Test unitari** con Jest
- **Test E2E** con Cypress
- **Coverage reporting** per monitorare la qualità del codice
- **CI/CD ready** per deployment automatico

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+ 
- PostgreSQL
- Account Google Cloud (per Google Maps API)

### Installazione

1. **Clona il repository**
```bash
git clone https://github.com/svilupp0/womenInTennis.git
cd womenInTennis
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le variabili d'ambiente**
```bash
cp .env.example .env
```

Modifica il file `.env` con i tuoi valori:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/womenintennis"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Email (per verifica account)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Setup del database**
```bash
# Genera il client Prisma
npx prisma generate

# Esegui le migrazioni
npx prisma migrate dev

# (Opzionale) Popola con dati di esempio
npx prisma db seed
```

5. **Avvia l'applicazione**
```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## 📁 Struttura del Progetto

```
womenInTennis/
├── 📁 components/          # Componenti React riutilizzabili
├── 📁 contexts/           # Context API per stato globale
├── 📁 hooks/              # Custom React hooks
├── 📁 lib/                # Utilities e configurazioni
│   ├── 📁 constants/      # Costanti dell'applicazione
│   ├── 📁 middleware/     # Middleware personalizzati
│   ├── 📁 security/       # Utilities di sicurezza
│   ├── 📁 services/       # Servizi business logic
│   └── 📁 templates/      # Template email
├── 📁 pages/              # Pagine Next.js
│   ├── 📁 api/           # API routes
│   ├── calendar.js       # Gestione calendario
│   ├── dashboard.js      # Dashboard utente
│   ├── map.js           # Mappa campi tennis
│   └── ...
├── 📁 prisma/            # Schema database e migrazioni
├── 📁 styles/            # CSS Modules
├── 📁 __tests__/         # Test unitari
├── 📁 cypress/           # Test E2E
└── 📄 README.md          # Questo file
```

## 🎯 Funzionalità Dettagliate

### 🔐 Autenticazione
- **JWT-based authentication** con refresh token
- **Email verification** obbligatoria per nuovi account
- **Password reset** sicuro via email
- **Rate limiting** per prevenire attacchi brute force
- **Account lockout** dopo tentativi falliti

### 👤 Profilo Utente
```javascript
// Campi profilo disponibili
{
  email: "user@example.com",
  comune: "Roma",
  livello: "Intermedio", // Principiante/Intermedio/Avanzato
  telefono: "+39 123 456 7890",
  disponibilita: true,
  emailVerified: true
}
```

### 📅 Gestione Eventi
- **Creazione slot** di disponibilità
- **Stati evento**: Available, Proposed, Confirmed, Denied, Expired
- **Colori personalizzabili** per organizzazione visiva
- **Notifiche** per cambi di stato

### 🗺️ Integrazione Mappe
- **Google Maps JavaScript API**
- **Places API** per ricerca campi tennis
- **Geocoding API** per conversione indirizzi
- **Marker personalizzati** con info window

## 🧪 Testing

### Test Unitari
```bash
# Esegui tutti i test
npm test

# Test in modalità watch
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test E2E
```bash
# Apri Cypress UI
npm run test:e2e

# Esegui test headless
npm run test:e2e:headless
```

## 🚀 Deployment

### Vercel (Raccomandato)
1. Connetti il repository a Vercel
2. Configura le variabili d'ambiente
3. Deploy automatico ad ogni push

### Docker
```bash
# Build immagine
docker build -t women-in-tennis .

# Run container
docker run -p 3000:3000 women-in-tennis
```

### Variabili d'Ambiente Produzione
```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 📊 Monitoraggio e Analytics

### Metriche Disponibili
- **Registrazioni utenti** per periodo
- **Utilizzo calendario** e creazione eventi
- **Tasso di conversione** proposte
- **Utilizzo mappa** e ricerche

### Logging
- **Errori applicazione** con stack trace
- **Tentativi login** falliti
- **API calls** con timing
- **Database queries** performance

## 🔧 Configurazione Avanzata

### Security Headers
Configurati in `next.config.js`:
- **CSP** (Content Security Policy)
- **HSTS** per HTTPS enforcement
- **X-Frame-Options** anti-clickjacking
- **Referrer Policy** controllo referrer

### Rate Limiting
```javascript
// Configurazione API rate limiting
{
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // max 100 richieste per IP
  message: "Troppe richieste, riprova più tardi"
}
```

### Email Templates
Template HTML personalizzabili in `lib/templates/`:
- **Verifica email** per nuovi account
- **Reset password** per recupero credenziali
- **Notifiche** per proposte partite

## 🤝 Contribuire

### Setup Sviluppo
1. Fork del repository
2. Crea branch feature: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Apri Pull Request

### Coding Standards
- **ESLint** per linting JavaScript
- **Prettier** per formatting
- **Conventional Commits** per messaggi commit
- **Test coverage** minimo 80%

### Issue e Bug Report
Usa i template GitHub per:
- 🐛 **Bug reports** con steps di riproduzione
- 💡 **Feature requests** con use case
- 📚 **Documentation** miglioramenti

## 📚 Documentazione Aggiuntiva

- 📋 [**Piano Implementazione**](IMPLEMENTATION_PLAN.md) - Roadmap sviluppo
- 🗺️ [**Integrazione Google Maps**](GOOGLE_MAPS_INTEGRATION.md) - Setup mappe
- 🛡️ [**Security Headers**](SECURITY_HEADERS.md) - Configurazione sicurezza
- 📦 [**Installazione Calendar**](install_calendar_deps.md) - Setup calendario

## 🐛 Troubleshooting

### Problemi Comuni

**Database connection failed**
```bash
# Verifica che PostgreSQL sia in esecuzione
sudo service postgresql status

# Controlla le credenziali in .env
echo $DATABASE_URL
```

**Google Maps non si carica**
```bash
# Verifica API key
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Controlla console browser per errori CSP
```

**Email non inviate**
```bash
# Testa configurazione SMTP
npm run test:email

# Verifica credenziali email in .env
```

## 📞 Supporto

- 📧 **Email**: support@womenintennis.com
- 💬 **Discord**: [Community Server](https://discord.gg/womenintennis)
- 📱 **Twitter**: [@WomenInTennis](https://twitter.com/womenintennis)
- 🐛 **Issues**: [GitHub Issues](https://github.com/svilupp0/womenInTennis/issues)

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **ISC**. Vedi il file [LICENSE](LICENSE) per dettagli.

## 🙏 Ringraziamenti

- **Next.js Team** per il framework eccezionale
- **Prisma Team** per l'ORM intuitivo
- **FullCalendar** per il componente calendario
- **Google Maps** per le API di geolocalizzazione
- **Community Open Source** per le librerie utilizzate

---

<div align="center">

**Fatto con ❤️ per la community tennistica femminile**

[🌐 Website](https://womenintennis.com) • [📱 App](https://app.womenintennis.com) • [📧 Newsletter](https://newsletter.womenintennis.com)

</div>