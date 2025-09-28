# 🔧 TROUBLESHOOTING - Sistema Disponibilità

## 🎯 **ANALISI SENIOR DEVELOPER**

Il tuo codice è **eccellente** e segue le best practices! Ho implementato la tua versione con miglioramenti aggiuntivi per error handling e debugging.

---

## ✅ **PROBLEMI RISOLTI**

### **1. File Mancanti**
- ✅ **Creato `lib/auth.js`**: Utilities per autenticazione JWT
- ✅ **Verificato `lib/prisma.js`**: Già esistente e corretto
- ✅ **Aggiornato API**: Usa la tua struttura migliorata

### **2. Error Handling Migliorato**
- ✅ **Token validation**: Gestione token scaduti/non validi
- ✅ **Prisma errors**: Codici errore specifici (P2025, P2002)
- ✅ **User ID extraction**: Supporta `id`, `sub`, `userId`
- ✅ **Environment check**: Verifica JWT_SECRET

---

## 🚨 **ERRORI COMUNI E SOLUZIONI**

### **Error 1: "Cannot resolve module '../../../lib/auth'"**
```bash
❌ Errore: Module not found: Can't resolve '../../../lib/auth'
```

**Causa**: File `lib/auth.js` mancante  
**Soluzione**: ✅ **RISOLTO** - File creato

### **Error 2: "JWT_SECRET non configurato"**
```bash
❌ Errore: JWT_SECRET non configurato
```

**Causa**: Variabile d'ambiente mancante  
**Soluzione**:
```bash
# .env.local
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
```

### **Error 3: "Token non valido"**
```bash
❌ Errore: Token non valido. Effettua nuovamente il login.
```

**Causa**: Token JWT malformato o scaduto  
**Soluzioni**:
1. Logout e login di nuovo
2. Verifica formato token nel localStorage
3. Controlla scadenza token

### **Error 4: "Utente non trovato" (P2025)**
```bash
❌ Errore: Utente non trovato
```

**Causa**: ID utente nel token non esiste nel database  
**Soluzioni**:
1. Verifica struttura token JWT
2. Controlla che l'utente esista nel database
3. Verifica campo `id` vs `sub` nel token

### **Error 5: "Campo disponibilita non esiste"**
```bash
❌ Errore: Unknown field `disponibilita`
```

**Causa**: Campo database mancante  
**Soluzione**:
```sql
-- Aggiungi campo al database
ALTER TABLE User ADD COLUMN disponibilita BOOLEAN DEFAULT false;
```

---

## 🔍 **DEBUG CHECKLIST**

### **1. Verifica Environment**
```bash
# Controlla variabili d'ambiente
echo $JWT_SECRET
# Deve essere almeno 32 caratteri
```

### **2. Test API Manuale**
```bash
# Test con curl
curl -X PUT http://localhost:3000/api/users/availability \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"available": true}'
```

### **3. Verifica Token JWT**
```javascript
// Nel browser console
const token = localStorage.getItem('token')
console.log('Token:', token)

// Decodifica token (solo per debug)
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Payload:', payload)
```

### **4. Verifica Database**
```sql
-- Controlla struttura tabella User
DESCRIBE User;

-- Verifica utente esiste
SELECT id, email, disponibilita FROM User WHERE id = 'USER_ID';
```

---

## 🎯 **TESTING RAPIDO**

### **Test 1: API Endpoint**
```javascript
// Test in browser console
fetch('/api/users/availability', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ available: true })
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err))
```

### **Test 2: Hook React**
```javascript
// Nel componente Dashboard
useEffect(() => {
  console.log('🔄 Availability state:', {
    availability,
    isUpdating,
    error,
    isSynced
  })
}, [availability, isUpdating, error, isSynced])
```

### **Test 3: Database**
```javascript
// Test Prisma connection
import { prisma } from '../lib/prisma'

// Nel tuo API handler
console.log('📊 Database test:', await prisma.user.count())
```

---

## 🚀 **PERFORMANCE MONITORING**

### **Logging Migliorato**
```javascript
// Aggiungi al tuo API handler
console.log('📊 API Performance:', {
  userId,
  available,
  timestamp: new Date().toISOString(),
  responseTime: Date.now() - startTime
})
```

### **Error Tracking**
```javascript
// Aggiungi error tracking
if (error) {
  console.error('🚨 Error Details:', {
    message: error.message,
    code: error.code,
    stack: error.stack,
    userId,
    timestamp: new Date().toISOString()
  })
}
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Pre-Deploy**
- [ ] JWT_SECRET configurato in produzione
- [ ] Database schema aggiornato
- [ ] Test API endpoint funzionante
- [ ] Error handling testato
- [ ] Logging configurato

### **Post-Deploy**
- [ ] Test toggle in produzione
- [ ] Verifica persistenza database
- [ ] Monitor error logs
- [ ] Test su dispositivi reali
- [ ] Verifica performance

---

## 🎉 **RISULTATO FINALE**

### **Codice Implementato**
```javascript
// ✅ API Endpoint pulito e robusto
PUT /api/users/availability

// ✅ Hook React con ottimismo UI
const { availability, toggleAvailability, isUpdating } = useAvailability()

// ✅ Error handling completo
- Token validation
- Prisma error codes
- User-friendly messages
```

### **Benefici Ottenuti**
- ✅ **Codice più pulito**: Separazione responsabilità
- ✅ **Error handling robusto**: Gestione errori specifici
- ✅ **Debugging facilitato**: Logging dettagliato
- ✅ **Manutenibilità**: Utilities riutilizzabili
- ✅ **Scalabilità**: Struttura professionale

---

## 📞 **SUPPORT**

### **Se hai ancora errori:**

1. **Controlla console browser** per errori JavaScript
2. **Verifica network tab** per errori API
3. **Controlla server logs** per errori backend
4. **Testa con Postman/curl** per isolare il problema

### **Debug Commands**
```bash
# Verifica file esistono
ls -la lib/
ls -la pages/api/users/

# Verifica environment
printenv | grep JWT

# Test database connection
npm run prisma studio
```

---

**🎯 Il tuo approccio era corretto! Ho solo aggiunto i file mancanti e migliorato l'error handling. Il sistema ora dovrebbe funzionare perfettamente.**