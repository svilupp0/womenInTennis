# 🤝 CONTRIBUTING - Women in Tennis

**Guida per contribuire al progetto**  
**Versione**: 1.0 | **Data**: 1 Febbraio 2026

---

## 📋 INDICE

1. [Branching Strategy](#branching-strategy)
2. [Workflow Sviluppo](#workflow-sviluppo)
3. [Naming Conventions](#naming-conventions)
4. [Pull Request](#pull-request)
5. [Code Review](#code-review)
6. [Quality Gates](#quality-gates)

---

## 🌿 BRANCHING STRATEGY

### Branches Principali

```
main (production)
  ↑
develop (staging)
  ↑
feature/* | fix/* | refactor/*
```

#### `main`

- **Protezione**: 🔒 LOCKED
- **Contenuto**: Codice in produzione
- **Merge**: Solo da `develop` via PR approvata
- **Deploy**: Automatico su merge
- **Rules**:
  - ✅ PR review obbligatoria (min 1 approvazione)
  - ✅ CI/CD deve passare
  - ✅ No force push
  - ✅ No delete branch

#### `develop`

- **Protezione**: 🔒 SEMI-LOCKED
- **Contenuto**: Codice pronto per release
- **Merge**: Da feature/fix/refactor branches via PR
- **Rules**:
  - ✅ PR review consigliata
  - ✅ CI/CD deve passare
  - ✅ No force push dopo 1º push

#### `feature/*`, `fix/*`, `refactor/*`

- **Protezione**: 🔓 OPEN
- **Contenuto**: Work in progress
- **Lifetime**: Eliminare dopo merge
- **Rules**:
  - ✅ Rebase frequente da develop
  - ✅ Commit atomici e descrittivi
  - ✅ Self-review prima di PR

---

## 🔄 WORKFLOW SVILUPPO

### 1. Iniziare Nuova Feature

```bash
# 1. Assicurati di essere su develop aggiornato
git checkout develop
git pull origin develop

# 2. Crea branch feature
git checkout -b feature/nome-feature

# 3. Lavora sulla feature
# ... edit code ...
git add .
git commit -m "feat: descrizione cambiamento"

# 4. Push su origin
git push origin feature/nome-feature

# 5. Apri PR su GitHub
# develop ← feature/nome-feature
```

### 2. Fix Bug

```bash
# 1. Da develop
git checkout develop
git pull origin develop

# 2. Crea branch fix
git checkout -b fix/nome-bug

# 3. Fix + test
git add .
git commit -m "fix: descrizione fix"

# 4. Push e PR
git push origin fix/nome-bug
```

### 3. Refactoring

```bash
# 1. Da develop
git checkout develop
git pull origin develop

# 2. Crea branch refactor
git checkout -b refactor/nome-refactor

# 3. Refactor + test
git add .
git commit -m "refactor: descrizione refactor"

# 4. Push e PR
git push origin refactor/nome-refactor
```

---

## 📝 NAMING CONVENTIONS

### Branch Names

**Formato**: `<type>/<short-description>`

**Types**:

- `feature/` - Nuova funzionalità
- `fix/` - Bug fix
- `refactor/` - Code refactoring (no new features)
- `docs/` - Solo documentazione
- `test/` - Aggiunta/fix test
- `chore/` - Manutenzione (deps, config)

**Esempi**:

```
✅ feature/player-search-filters
✅ fix/login-redirect-bug
✅ refactor/dashboard-components
✅ docs/api-documentation
✅ test/e2e-auth-flow
✅ chore/update-dependencies

❌ my-feature (no type)
❌ feature-player-search (usa /)
❌ FEATURE/SEARCH (no uppercase)
```

### Commit Messages

**Formato**: `<type>: <description>`

**Types** (Conventional Commits):

- `feat:` - Nuova feature
- `fix:` - Bug fix
- `refactor:` - Code refactor
- `docs:` - Documentazione
- `test:` - Test
- `style:` - Formatting, no code change
- `chore:` - Manutenzione

**Esempi**:

```
✅ feat: add player search filters
✅ fix: resolve login redirect issue
✅ refactor: extract dashboard components
✅ docs: update API documentation
✅ test: add e2e tests for auth flow
✅ chore: update npm dependencies

❌ Added player search (no type)
❌ fix bug (non descrittivo)
❌ WIP (non informativo)
```

---

## 🔀 PULL REQUEST

### Checklist Pre-PR

Prima di aprire una PR, verifica:

- [ ] **Branch aggiornato** da develop

  ```bash
  git checkout develop && git pull
  git checkout feature/my-feature
  git rebase develop
  ```

- [ ] **Codice testato localmente**

  ```bash
  npm run build  # Build passa
  npm test       # Test unitari passano
  npm run lint   # No errori lint
  ```

- [ ] **Commit puliti**
  - Commit atomici (1 concetto = 1 commit)
  - Messaggi descrittivi
  - No "WIP", "test", "fix" generici

- [ ] **Self-review completata**
  - Hai riletto il tuo codice?
  - Hai rimosso console.log/debug code?
  - Hai aggiunto commenti dove necessario?

### Come Aprire PR

1. **Push branch** su origin
2. **Vai su GitHub** → Pull Requests → New PR
3. **Compila template** (auto-loaded)
4. **Assegna reviewer** (1+ persona)
5. **Aggiungi labels** (feature, bug, refactor, etc.)
6. **Link issue** se presente (#123)

### Template PR

Il template `.github/PULL_REQUEST_TEMPLATE.md` verrà auto-loaded.  
**Compila tutte le sezioni obbligatorie!**

---

## 👀 CODE REVIEW

### Come Reviewer

#### Cosa Controllare

✅ **Funzionalità**

- [ ] Il codice fa quello che dovrebbe?
- [ ] Edge cases gestiti?
- [ ] Error handling presente?

✅ **Qualità Codice**

- [ ] Leggibile e mantenibile?
- [ ] DRY (Don't Repeat Yourself)?
- [ ] Naming chiaro e descrittivo?

✅ **Testing**

- [ ] Test unitari presenti?
- [ ] Test coprono casi critici?
- [ ] Test passano in CI?

✅ **Performance**

- [ ] Query DB ottimizzate?
- [ ] No N+1 queries?
- [ ] Lazy loading dove possibile?

✅ **Security**

- [ ] Input validation?
- [ ] SQL injection prevention?
- [ ] XSS prevention?
- [ ] Auth/authorization corretti?

#### Come Lasciare Feedback

**Tono costruttivo:**

```
✅ "Considera di estrarre questa logica in una funzione separata per riusarla"
✅ "Questo potrebbe causare un N+1 query. Suggerirei di usare include"
✅ "Ottimo lavoro! Piccolo suggerimento: potresti semplificare usando..."

❌ "Questo è sbagliato"
❌ "Non capisco perché hai fatto così"
❌ "Refactor tutto"
```

**Types di commenti:**

- 💬 **Comment**: Suggerimento, domanda
- ✏️ **Suggestion**: Proposta cambiamento specifico
- 🔴 **Request Changes**: Blocca merge, fix necessario
- ✅ **Approve**: OK per merge

### Come Autore PR

#### Rispondi ai Commenti

- ✅ Ringrazia per feedback
- ✅ Spiega decisioni se necessario
- ✅ Implementa fix suggeriti
- ✅ Risolvi conversazioni quando fixato
- ❌ No conflitti personali
- ❌ No "fatto" senza spiegazione

#### Aggiorna PR

```bash
# Fix dopo review
git add .
git commit -m "fix: address review comments"
git push origin feature/my-feature

# Se richiesto rebase
git checkout develop && git pull
git checkout feature/my-feature
git rebase develop
git push --force-with-lease origin feature/my-feature
```

---

## ✅ QUALITY GATES

### Pipeline CI/CD

Ogni PR deve passare:

1. **🔍 Lint** - ESLint no errors
2. **🧪 Tests** - Unit tests pass
3. **🏗️ Build** - Next.js build success
4. **🔒 Security** - No high/critical vulnerabilities

**Pipeline location**: `.github/workflows/ci.yml`

### Merge Requirements

**Per `develop`:**

- ✅ CI/CD green
- ✅ 1+ Code review approvata (consigliato)
- ✅ No merge conflicts

**Per `main`:**

- ✅ CI/CD green
- ✅ 2+ Code review approvate (obbligatorio)
- ✅ No merge conflicts
- ✅ QA testing completato
- ✅ Release notes preparate

---

## 🚨 SITUAZIONI SPECIALI

### Hotfix su Production

```bash
# 1. Branch da main (non develop!)
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix veloce + test
git add .
git commit -m "hotfix: fix critical bug"

# 3. PR immediata su main
git push origin hotfix/critical-bug
# Apri PR: main ← hotfix/critical-bug

# 4. Dopo merge su main, merge anche su develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

### Rollback

```bash
# Se deploy su main ha problemi
git revert <commit-hash>
git push origin main

# Deploy automatico con rollback
```

### Conflitti di Merge

```bash
# Durante rebase
git rebase develop

# Se conflitti
# 1. Risolvi in VS Code
# 2. git add <file-risolto>
# 3. git rebase --continue

# Se troppi conflitti
git rebase --abort
# Chiedi help al team
```

---

## 📞 SUPPORT

**Domande su workflow?**

- Consulta questa guida
- Chiedi su Slack #dev-support
- Ping @tech-lead

**Problemi CI/CD?**

- Controlla `.github/workflows/ci.yml`
- Vedi logs su GitHub Actions tab
- Ping @devops

---

## 📚 RIFERIMENTI

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Documento creato**: 1 Febbraio 2026  
**Maintainer**: CTO AI Auditor  
**Status**: ✅ Attivo
