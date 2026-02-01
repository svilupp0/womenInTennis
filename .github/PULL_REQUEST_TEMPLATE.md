## 📋 Descrizione

<!-- Descrivi brevemente cosa fa questa PR -->

## 🎯 Tipo di Cambiamento

<!-- Seleziona il tipo di PR (metti X nella casella) -->

- [ ] 🐛 **Bug fix** (non-breaking change che risolve un issue)
- [ ] ✨ **New feature** (non-breaking change che aggiunge funzionalità)
- [ ] 💥 **Breaking change** (fix o feature che causa breaking changes)
- [ ] 📚 **Documentation** (solo documentazione)
- [ ] 🔧 **Refactor** (codice che non aggiunge feature né fixa bug)
- [ ] ✅ **Test** (aggiunta o fix test)
- [ ] 🔨 **Chore** (manutenzione, deps update, config)

## 🔗 Issue Collegata

<!-- Link alla issue GitHub se presente -->

Fixes #(issue number)
Closes #(issue number)
Related to #(issue number)

## 🧪 Testing

### Test Eseguiti

<!-- Descrivi i test che hai fatto -->

- [ ] Test unitari aggiunti/aggiornati
- [ ] Test E2E aggiunti/aggiornati (se necessario)
- [ ] Test manuali completati
- [ ] Build verificato (`npm run build`)

### Come Testare

<!-- Istruzioni per testare questa PR -->

1. Checkout branch: `git checkout <branch-name>`
2. Install deps: `npm install`
3. Run dev: `npm run dev`
4. Test steps:
   - Step 1...
   - Step 2...

## ✅ Checklist Pre-Merge

<!-- Verifica TUTTO prima di richiedere review -->

### Codice

- [ ] Il codice segue le style guidelines del progetto
- [ ] Ho fatto self-review del mio codice
- [ ] Ho commentato codice complesso
- [ ] Ho rimosso console.log/debug code
- [ ] No codice commentato lasciato

### Testing

- [ ] Build passa (`npm run build`)
- [ ] Test unitari passano (`npm test`)
- [ ] Lint passa (`npm run lint`)
- [ ] Ho testato su browser (Chrome, Firefox, Safari)
- [ ] Ho testato su mobile (responsive)

### Documentazione

- [ ] Ho aggiornato README se necessario
- [ ] Ho aggiornato documentazione API se necessario
- [ ] Ho aggiornato CHANGELOG se necessario
- [ ] Commenti del codice aggiunti dove necessario

### Git

- [ ] Branch aggiornato da `develop`
- [ ] Commit messages seguono Conventional Commits
- [ ] No merge conflicts
- [ ] Branch name segue naming convention

### Security

- [ ] Ho verificato input validation
- [ ] Ho verificato auth/authorization
- [ ] No secrets/credentials nel codice
- [ ] Ho verificato SQL injection prevention
- [ ] Ho verificato XSS prevention

## 📸 Screenshots

<!-- Se ci sono cambiamenti UI, aggiungi screenshots -->

### Prima

<!-- Screenshot before changes -->

### Dopo

<!-- Screenshot after changes -->

## 📝 Note per Reviewer

<!-- Informazioni extra che possono aiutare il reviewer -->

- Area di focus per review:
- Domande specifiche:
- Decisioni di design da discutere:

## 🚀 Deploy Notes

<!-- Se questa PR richiede azioni speciali al deploy -->

- [ ] Richiede migration database
- [ ] Richiede env vars update
- [ ] Richiede cache clear
- [ ] Richiede deploy order specifico
- [ ] Altro: **\*\***\_\_\_**\*\***

## 📊 Performance Impact

<!-- Se ci sono impatti su performance -->

- [ ] Ho testato performance impact
- [ ] Bundle size verificato
- [ ] Query DB ottimizzate
- [ ] Lazy loading implementato dove possibile

---

## 📚 Riferimenti

<!-- Link utili -->

- [ CONTRIBUTING.md](../CONTRIBUTING.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Code Review Checklist](../CONTRIBUTING.md#code-review)
