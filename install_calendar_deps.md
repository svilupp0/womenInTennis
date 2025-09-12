# Installazione Dipendenze Calendario

Esegui questi comandi nel terminale:

```bash
# Installa FullCalendar e dipendenze
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Installa moment.js per gestione date
npm install moment

# Aggiorna il database Prisma
npx prisma generate
npx prisma db push
```

Questo installerà:
- **@fullcalendar/react** - Componente calendario React
- **@fullcalendar/daygrid** - Vista mensile
- **@fullcalendar/timegrid** - Vista settimanale/giornaliera  
- **@fullcalendar/interaction** - Interazioni (click, drag)
- **moment** - Gestione date e orari