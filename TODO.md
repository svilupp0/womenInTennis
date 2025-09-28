# TODO: Standardizzazione Nome Brand a "Women in Net"

## Passi per Completare le Modifiche

### 1. Modifiche ai File di Documentazione (MD)
- [x] README.md: Sostituire tutti i titoli, descrizioni, footer e sezioni da "Women in Tennis" a "Women in Net" (mantenere maiuscole per titoli).
- [x] GOOGLE_MAPS_INTEGRATION.md: Sostituire titoli, descrizioni e sezioni (es. "Mappa Campi da Tennis - Women in Tennis" → "Mappa Campi da Tennis - Women in Net").
- [x] IMPLEMENTATION_GUIDE.md: Nessuna occorrenza trovata.
- [x] IMPLEMENTATION_PLAN.md: Sostituire titoli e sezioni principali.
- [ ] AVAILABILITY_FIX_SUMMARY.md: Sostituire occorrenze sparse.
- [ ] UX_ANALYSIS_DASHBOARD_PROFILE.md: Sostituire occorrenze.
- [ ] UX_EXECUTIVE_SUMMARY.md: Sostituire occorrenze.
- [ ] UX_FIXES_IMPLEMENTED.md: Sostituire occorrenze.
- [x] SECURITY_HEADERS.md: Sostituito titolo e footer.
- [ ] TROUBLESHOOTING_AVAILABILITY.md: Sostituire occorrenze.
- [ ] install_calendar_deps.md: Sostituire occorrenze.

### 2. Modifiche ai File Frontend (Pages e Components)
- [x] pages/dashboard.js: Nessuna occorrenza trovata (già aggiornato).
- [x] pages/calendar.js: Nessuna occorrenza trovata (già aggiornato).
- [x] pages/map.js: Nessuna occorrenza trovata (già aggiornato).
- [ ] pages/login.js: Sostituire titoli, descrizioni e riferimenti email.
- [x] pages/register.js: Nessuna occorrenza trovata (già aggiornato).
- [x] pages/verify-email.js: Nessuna occorrenza trovata (già aggiornato).
- [ ] pages/admin.js: Sostituire titoli e span logo.
- [ ] components/Calendar.js: Sostituire occorrenze in commenti o testo (se presenti).

### 3. Modifiche ai File Backend e Utils
- [ ] lib/services/emailService.js: Sostituire tutti i subject, body HTML/text e from field.

### 4. Modifiche ai File di Test e Script
- [ ] cypress/support/commands.js: Sostituire commenti.
- [ ] scripts/run-all-tests.js: Sostituire log console.
- [ ] __tests__/api.test.js: Sostituire occorrenze se presenti.
- [ ] __tests__/auth.test.js: Sostituire occorrenze se presenti.
- [ ] __tests__/utils.test.js: Sostituire occorrenze se presenti.

### 5. Verifiche e Follow-up
- [ ] Eseguire `npm run build` per verificare errori.
- [ ] Testare email con script o comando.
- [ ] Aggiornare e eseguire test (npm test, npm run test:e2e).
- [ ] Verificare UI con browser (npm run dev + browser_action).
- [ ] Pulire cache Next.js se necessario.
- [ ] Aggiornare questo TODO man mano che i passi vengono completati.

**Note:** Maiuscole: Usa "Women in Net" per titoli e nomi propri; "women in net" per testo normale/minuscole. Non modificare file generati (coverage, .next).
