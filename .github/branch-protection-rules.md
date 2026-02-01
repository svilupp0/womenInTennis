# 🔒 BRANCH PROTECTION RULES - Women in Tennis

**Guida configurazione protezioni branch GitHub**  
**Versione**: 1.0 | **Data**: 1 Febbraio 2026

---

## 📋 OVERVIEW

Le Branch Protection Rules impediscono merge pericolosi e garantiscono quality gates automatici.

**Configurazione location**: GitHub Repository → Settings → Branches

---

## 🛡️ CONFIGURAZIONE BRANCH `main`

### Come Configurare

1. Vai su **GitHub Repository**
2. Click **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Branch name pattern: `main`
5. Abilita le seguenti opzioni:

### ✅ Opzioni da Abilitare

#### **Require a pull request before merging**

- ✅ **Enabled**
- ✅ Require approvals: **2**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (se configurato)

#### **Require status checks to pass before merging**

- ✅ **Enabled**
- ✅ Require branches to be up to date before merging
- Status checks richiesti:
  - ✅ `build` (CI/CD)
  - ✅ `test` (CI/CD)
  - ✅ `lint` (CI/CD)
  - ✅ `security-audit` (CI/CD)

#### **Require conversation resolution before merging**

- ✅ **Enabled**

#### **Require signed commits**

- ⚠️ **Optional** (consigliato per progetti enterprise)

#### **Require linear history**

- ✅ **Enabled** (force rebase, no merge commits)

#### **Require deployments to succeed before merging**

- ⚠️ **Optional** (se hai staging environment)

#### **Lock branch**

- ❌ **Disabled** (blocca solo quando necessario)

#### **Do not allow bypassing the above settings**

- ✅ **Enabled**
- ⚠️ Exceptions: Solo admin per hotfix critici

#### **Restrict who can push to matching branches**

- ✅ **Enabled**
- Allowed: Solo `github-actions[bot]` per auto-deploy
- Everyone else: via PR only

#### **Allow force pushes**

- ❌ **Disabled** (IMPORTANTE!)

#### **Allow deletions**

- ❌ **Disabled** (IMPORTANTE!)

---

## 🔐 CONFIGURAZIONE BRANCH `develop`

### Come Configurare

Stesso percorso di `main`, branch pattern: `develop`

### ✅ Opzioni da Abilitare

#### **Require a pull request before merging**

- ✅ **Enabled**
- ✅ Require approvals: **1** (meno restrittivo di main)
- ✅ Dismiss stale pull request approvals when new commits are pushed

#### **Require status checks to pass before merging**

- ✅ **Enabled**
- ✅ Require branches to be up to date before merging
- Status checks richiesti:
  - ✅ `build`
  - ✅ `test`
  - ✅ `lint`

#### **Require conversation resolution before merging**

- ✅ **Enabled**

#### **Require linear history**

- ✅ **Enabled**

#### **Do not allow bypassing the above settings**

- ✅ **Enabled**

#### **Allow force pushes**

- ❌ **Disabled** dopo primo push
- ⚠️ Developers possono force push PRIMA del primo push public

#### **Allow deletions**

- ❌ **Disabled**

---

## 📝 CONFIGURAZIONE CODEOWNERS (Optional)

### File `.github/CODEOWNERS`

Crea file per assegnare reviewer automatici:

```
# Default owners for everything
* @tech-lead @senior-dev

# Specific areas
/pages/api/**          @backend-team
/components/**         @frontend-team
/prisma/**             @database-team
/.github/workflows/**  @devops-team

# Critical files
package.json           @tech-lead
prisma/schema.prisma   @tech-lead @database-team
.github/workflows/**   @tech-lead
```

---

## 🚨 CONFIGURAZIONE HOTFIX

### Temporary Branch Protection Bypass

Per hotfix critici su production:

1. **Admin** può temporaneamente:
   - Creare `hotfix/*` branch da `main`
   - Bypassare 2 approvals (usa 1 approval)
   - Merge rapido

2. **Procedura**:

   ```bash
   # 1. Branch da main
   git checkout main
   git pull
   git checkout -b hotfix/critical-issue

   # 2. Fix + test veloce
   git add .
   git commit -m "hotfix: fix critical production bug"

   # 3. Push e PR
   git push origin hotfix/critical-issue
   # PR: main ← hotfix/critical-issue

   # 4. Admin approva (1 approval)
   # 5. Merge

   # 6. IMPORTANTE: Sync develop
   git checkout develop
   git pull origin develop
   git merge main
   git push origin develop
   ```

3. **Post-Hotfix**:
   - Ripristinare branch protection rules
   - Documentare in issue
   - Post-mortem meeting

---

## 🔍 VERIFICA CONFIGURAZIONE

### Checklist Finale

Dopo configurazione, verifica:

- [ ] `main` richiede 2 approvals
- [ ] `main` richiede CI/CD passing
- [ ] `main` no force push allowed
- [ ] `main` no delete allowed
- [ ] `develop` richiede 1 approval
- [ ] `develop` richiede CI/CD passing
- [ ] `develop` no force push (dopo 1° push)
- [ ] PR template auto-loads
- [ ] CI/CD pipeline funziona
- [ ] Status checks visibili in PR

### Test Manuale

```bash
# 1. Crea test branch
git checkout -b test/branch-protection
git push origin test/branch-protection

# 2. Apri PR verso main
# Verifica che:
# - CI/CD starts automaticamente
# - "2 approvals required" mostrato
# - Merge button disabilitato fino a checks pass

# 3. Tenta force push su main (deve fallire)
git checkout main
git push --force origin main
# Expected: ERROR "protected branch"

# 4. Cleanup
git push origin --delete test/branch-protection
```

---

## 📊 STATUS CHECKS REFERENCE

### Dal file `.github/workflows/ci.yml`

| Job Name         | Descrizione   | Critical    |
| ---------------- | ------------- | ----------- |
| `lint`           | ESLint check  | ⚠️ Warning  |
| `test`           | Unit tests    | ✅ Blocking |
| `build`          | Next.js build | ✅ Blocking |
| `security-audit` | npm audit     | ✅ Blocking |

**Blocking**: Merge impossibile se fail  
**Warning**: Merge possibile ma sconsigliato

---

## 🎯 BEST PRACTICES

### 1. PR Size

- ✅ Keep PR < 400 lines changed
- ✅ 1 PR = 1 feature/fix/refactor
- ❌ No PR "mega" con 10+ file changed

### 2. Review Time

- Target: Review entro 24h
- Hotfix: Review entro 2h
- Non-urgent: Review entro 48h

### 3. Merge Strategy

- **Rebase and merge** (preferred)
- **Squash and merge** (per feature con molti commit)
- **Merge commit** (no, disabled)

### 4. Branch Cleanup

- Auto-delete branch dopo merge
- Settings → Pull Requests → "Automatically delete head branches"

---

## 📞 TROUBLESHOOTING

### "Required status check is failing"

**Causa**: CI/CD job fallito  
**Fix**:

1. Vai su GitHub Actions
2. Vedi log del job fallito
3. Fix codice
4. Push nuovo commit
5. CI/CD re-runs automaticamente

### "This branch is out-of-date with the base branch"

**Fix**:

```bash
git checkout feature/my-branch
git fetch origin
git rebase origin/develop
git push --force-with-lease
```

### "Review required"

**Fix**:

- Chiedi review ai colleghi
- Tag reviewer in commento PR
- Se urgente, ping su Slack

### "Conversation must be resolved before merging"

**Fix**:

- Rispondi a tutti i commenti review
- Implementa fix richiesti
- Reviewer clicca "Resolve conversation"

---

## 🔒 SECURITY CONSIDERATIONS

### Protezione Secrets

- ❌ **MAI** committare secrets in codice
- ✅ Usa GitHub Secrets per env vars
- ✅ Usa `.env.example` per template
- ✅ `.env` in `.gitignore`

### Code Scanning

Abilita su repo:

- **Dependabot alerts** (auto-enabled)
- **Code scanning** (GitHub Advanced Security)
- **Secret scanning** (auto-enabled)

### Branch Protection Bypass

Solo per:

- Critical hotfix (admin only)
- Rollback emergenza (admin only)
- **MAI** per feature normale

---

## 📚 RIFERIMENTI

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

---

**Documento creato**: 1 Febbraio 2026  
**Maintainer**: CTO AI Auditor  
**Status**: ✅ Attivo - Applica regole ASAP
