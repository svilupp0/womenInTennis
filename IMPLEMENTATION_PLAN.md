# Piano di Implementazione - Women in Net
## Integrazione Funzionalità da Codice Open Source

### 🔍 Analisi Differenze

#### Tecnologie
| Aspetto | Open Source | Webapp Attuale | Azione |
|---------|-------------|----------------|---------|
| UI Framework | Material-UI | CSS Modules | Mantenere CSS, aggiungere componenti simili |
| Componenti | Class Components | Functional + Hooks | Convertire a Hooks |
| Calendario | FullCalendar | Non presente | **IMPLEMENTARE** |
| Date | moment.js | Date nativo | Aggiungere moment.js |
| Gestione Eventi | Completa | Non presente | **IMPLEMENTARE** |

#### Funzionalità
| Funzionalità | Open Source | Webapp Attuale | Priorità |
|--------------|-------------|----------------|----------|
| Profilo Avanzato | ✅ | ⚠️ Base | 🔥 ALTA |
| Calendario Eventi | ✅ | ❌ | 🔥 ALTA |
| Proposte Partite | ✅ | ❌ | 🔥 ALTA |
| Sistema Notifiche | ✅ | ❌ | 🟡 MEDIA |
| Feed Eventi | ✅ | ❌ | 🟡 MEDIA |
| Messenger | ✅ | ❌ | 🟢 BASSA |

### 📋 FASE 1: Miglioramento Profilo (1-2 giorni)

#### 1.1 Estendere Database
```sql
-- Aggiungere campi mancanti alla tabella User
ALTER TABLE User ADD COLUMN nome VARCHAR(100);
ALTER TABLE User ADD COLUMN cognome VARCHAR(100);
ALTER TABLE User ADD COLUMN citta VARCHAR(100);
ALTER TABLE User ADD COLUMN cap VARCHAR(10);
ALTER TABLE User ADD COLUMN livello_ricercato VARCHAR(50);
```

#### 1.2 Componente ProfileForm Avanzato
- Form completo con tutti i campi
- Toggle modifica come nell'open source
- Validazione client-side
- API update profilo

#### 1.3 API Profilo
- GET /api/profile - Dati completi profilo
- PUT /api/profile/update - Aggiornamento profilo

### 📋 FASE 2: Sistema Calendario (3-4 giorni)

#### 2.1 Installazione Dipendenze
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction moment
```

#### 2.2 Database Eventi
```sql
CREATE TABLE Event (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  location VARCHAR(200),
  status ENUM('available', 'proposed', 'confirmed', 'denied', 'expired') DEFAULT 'available',
  color VARCHAR(7),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE EventParticipant (
  id INT PRIMARY KEY AUTO_INCREMENT,
  eventId INT NOT NULL,
  userId INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES Event(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);
```

#### 2.3 Componenti Calendario
- `components/Calendar.js` - Calendario principale
- `components/EventModal.js` - Modal creazione/modifica eventi
- `components/EventDetailsModal.js` - Dettagli evento
- `utils/CalendarEvent.js` - Utility eventi

#### 2.4 API Eventi
- GET /api/calendar - Lista eventi utente
- POST /api/events/create - Crea nuovo evento
- PUT /api/events/[id] - Modifica evento
- DELETE /api/events/[id] - Elimina evento

### 📋 FASE 3: Sistema Proposte (2-3 giorni)

#### 3.1 Database Proposte
```sql
CREATE TABLE MatchProposal (
  id INT PRIMARY KEY AUTO_INCREMENT,
  proposerId INT NOT NULL,
  targetId INT NOT NULL,
  eventId INT,
  proposedDate DATETIME NOT NULL,
  proposedTime TIME NOT NULL,
  location VARCHAR(200),
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposerId) REFERENCES User(id),
  FOREIGN KEY (targetId) REFERENCES User(id),
  FOREIGN KEY (eventId) REFERENCES Event(id)
);
```

#### 3.2 Componenti Proposte
- `components/ProposeMatchModal.js` - Modal proposta partita
- `components/ProposalsList.js` - Lista proposte ricevute
- `components/MyProposals.js` - Proposte inviate

#### 3.3 API Proposte
- POST /api/proposals/create - Crea proposta
- GET /api/proposals/received - Proposte ricevute
- GET /api/proposals/sent - Proposte inviate
- PUT /api/proposals/[id]/respond - Accetta/rifiuta proposta

### 📋 FASE 4: Integrazione Dashboard (1-2 giorni)

#### 4.1 Nuova Pagina Calendario
- `pages/calendar.js` - Pagina calendario dedicata
- Integrazione con dashboard esistente
- Menu navigazione aggiornato

#### 4.2 Dashboard Migliorata
- Sezione "Prossimi Eventi"
- Sezione "Proposte Pendenti"
- Quick actions per calendario

### 📋 FASE 5: Sistema Notifiche (2-3 giorni)

#### 5.1 Database Notifiche
```sql
CREATE TABLE Notification (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('match_proposal', 'proposal_accepted', 'proposal_rejected', 'event_reminder') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  relatedId INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id)
);
```

#### 5.2 Sistema Notifiche
- Componente NotificationBell
- API notifiche
- Notifiche real-time (WebSocket opzionale)

### 📋 FASE 6: Feed Eventi (1-2 giorni)

#### 6.1 Feed Homepage
- Eventi confermati recenti
- Attività community
- Statistiche utenti

### 🛠️ Implementazione Tecnica

#### Struttura File Consigliata
```
pages/
  calendar.js          # Nuova pagina calendario
  proposals.js         # Gestione proposte
components/
  Calendar/
    Calendar.js        # Calendario principale
    EventModal.js      # Modal eventi
    EventDetails.js    # Dettagli evento
  Proposals/
    ProposeMatch.js    # Proponi partita
    ProposalsList.js   # Lista proposte
  Profile/
    ProfileForm.js     # Form profilo avanzato
  Notifications/
    NotificationBell.js # Campanella notifiche
utils/
  calendar.js          # Utility calendario
  dateHelpers.js       # Helper date
api/
  calendar/
    index.js          # CRUD eventi
  proposals/
    index.js          # CRUD proposte
  notifications/
    index.js          # Gestione notifiche
```

### 🎨 Considerazioni Design

#### Mantenere Coerenza
- Usare CSS modules esistenti
- Adattare colori/stili attuali
- Responsive design
- Accessibilità

#### UX Miglioramenti
- Loading states
- Error handling
- Feedback utente
- Animazioni smooth

### 📊 Timeline Stimato

| Fase | Durata | Dipendenze |
|------|--------|------------|
| Fase 1 | 1-2 giorni | - |
| Fase 2 | 3-4 giorni | Fase 1 |
| Fase 3 | 2-3 giorni | Fase 2 |
| Fase 4 | 1-2 giorni | Fase 2,3 |
| Fase 5 | 2-3 giorni | Fase 3 |
| Fase 6 | 1-2 giorni | Tutte |

**Totale: 10-16 giorni di sviluppo**

### 🚀 Quick Start

Per iniziare subito con la Fase 1:

1. Aggiornare schema database
2. Installare dipendenze calendario
3. Creare componente ProfileForm avanzato
4. Implementare API profilo estesa

Vuoi che iniziamo con una fase specifica?