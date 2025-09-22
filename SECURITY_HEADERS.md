# 🛡️ Security Headers Configuration

## Configurazione Headers di Sicurezza - Women in Tennis

Questo file documenta la configurazione dei security headers implementata in `next.config.js`.

### 🎯 Headers Implementati

#### **1. Protezione Base**
- **X-Frame-Options: DENY** - Previene clickjacking
- **X-Content-Type-Options: nosniff** - Previene MIME type sniffing
- **X-XSS-Protection: 1; mode=block** - Protezione XSS legacy

#### **2. Controllo Referrer e Permissions**
- **Referrer-Policy: strict-origin-when-cross-origin** - Controllo referrer
- **Permissions-Policy** - Disabilita API non necessarie (camera, microphone, payment)

#### **3. HTTPS e Transport Security**
- **HSTS** (solo produzione) - Forza HTTPS per 1 anno
- **upgrade-insecure-requests** (solo produzione) - Upgrade automatico HTTP→HTTPS

#### **4. Content Security Policy (CSP)**
Configurazione specifica per il progetto:

```
default-src 'self'
script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
img-src 'self' blob: data: https://maps.googleapis.com https://maps.gstatic.com https://lh3.googleusercontent.com
connect-src 'self' https://maps.googleapis.com
frame-src 'self' https://www.google.com
object-src 'none'
base-uri 'self'
form-action 'self'
frame-ancestors 'none'
```

### 🚀 Configurazioni per Performance

#### **Cache Headers**
- **API Routes**: No-cache per sicurezza
- **Assets Statici**: Cache 1 anno per performance

#### **Ottimizzazioni Produzione**
- **poweredByHeader: false** - Nasconde "X-Powered-By: Next.js"
- **compress: true** - Compressione gzip/brotli
- **generateEtags: true** - ETag per cache validation

#### **Configurazione Immagini**
- **Domini consentiti**: Google Maps, Google User Content
- **Formati moderni**: WebP, AVIF
- **Cache TTL**: 60 secondi

### 🔧 Testing

#### **Sviluppo**
```bash
npm run dev
# Verifica che tutto funzioni senza errori CSP nella console
```

#### **Produzione**
```bash
npm run build
npm start
# Testa con browser dev tools → Security tab
```

#### **Strumenti di Test**
- [Security Headers](https://securityheaders.com/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

### ⚠️ Note Importanti

#### **Sviluppo vs Produzione**
- HSTS e upgrade-insecure-requests sono disabilitati in sviluppo
- Questo evita problemi con localhost HTTP

#### **Google Maps Integration**
La configurazione è ottimizzata per:
- Google Maps JavaScript API
- Google Maps Static API
- Google Fonts (se usati)

#### **Possibili Problemi**
Se vedi errori CSP nella console:
1. Controlla che tutti i domini esterni siano inclusi
2. Verifica che non ci siano script inline non autorizzati
3. Assicurati che le immagini vengano da domini consentiti

### 🔄 Aggiornamenti Futuri

#### **Se aggiungi nuovi servizi esterni:**
1. Aggiungi i domini alla CSP appropriata
2. Testa in sviluppo
3. Verifica con strumenti di sicurezza

#### **Per PWA (futuro):**
```javascript
"manifest-src 'self'"
"worker-src 'self'"
```

#### **Per Analytics (futuro):**
```javascript
"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com"
"connect-src 'self' https://www.google-analytics.com"
```

### 📊 Security Score

Con questa configurazione dovresti ottenere:
- **Security Headers**: A+ 
- **CSP**: A
- **Overall Security**: A

### 🆘 Troubleshooting

#### **Errori comuni:**
1. **CSP violation**: Aggiungi il dominio mancante alla policy
2. **Font non caricati**: Verifica font-src
3. **Immagini bloccate**: Controlla img-src
4. **API calls falliti**: Verifica connect-src

#### **Debug CSP:**
```javascript
// Temporaneamente per debug, aggiungi:
"report-uri /api/csp-report"
```

---

**Configurazione creata per Women in Tennis**  
**Data**: $(date)  
**Versione**: 1.0  
**Status**: ✅ Pronto per produzione