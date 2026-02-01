# 🚀 Deployment Guide - Women in Net

Guida completa per il deployment dell'applicazione **Women in Net** in produzione.

**Ultima revisione**: 1 Febbraio 2026

---

## 📋 Indice

1. [Prerequisiti](#-prerequisiti)
2. [Vercel Deployment (Raccomandato)](#-vercel-deployment-raccomandato)
3. [Docker Deployment](#-docker-deployment)
4. [Deploy Manuale](#-deploy-manuale)
5. [Database Setup](#-database-setup-produzione)
6. [Variabili d'Ambiente](#-variabili-dambiente-produzione)
7. [Post-Deployment](#-post-deployment)
8. [Monitoring](#-monitoring-e-logging)
9. [Troubleshooting](#-troubleshooting)

---

## ✅ Prerequisiti

Prima di procedere con il deployment, assicurati di avere:

- [ ] **Database PostgreSQL** in produzione (Vercel Postgres, AWS RDS, Supabase, etc.)
- [ ] **JWT_SECRET** sicuro (min 32 caratteri casuali)
- [ ] **Email SMTP** configurato (Gmail, SendGrid, Mailgun, etc.)
- [ ] **Google Maps API Key** con billing abilitato
- [ ] **Dominio** configurato (opzionale ma consigliato)
- [ ] **Repository Git** con codice aggiornato
- [ ] **Build locale** testato con `npm run build`

---

## 🎯 Vercel Deployment (Raccomandato)

Vercel è la piattaforma raccomandata per Next.js apps. Offre:

- ✅ Deploy automatico da Git
- ✅ Preview deployments per PR
- ✅ Edge network globale
- ✅ Zero configurazione infrastruttura
- ✅ Serverless functions ottimizzate

### Step 1: Connetti Repository

1. Vai su [vercel.com](https://vercel.com)
2. Clicca **"Add New Project"**
3. Importa il repository GitHub/GitLab/Bitbucket
4. Seleziona **"womenInTennis"**

### Step 2: Configura Progetto

```yaml
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 3: Variabili d'Ambiente

Aggiungi le seguenti variabili in **Settings → Environment Variables**:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
JWT_SECRET=your-production-secret-min-32-chars

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@your-domain.com

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-production-api-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Step 4: Deploy

1. Clicca **"Deploy"**
2. Attendi il build (~2-3 minuti)
3. Verifica il deployment preview
4. Effettua migrazioni database (vedi sotto)

### Step 5: Post-Deploy

```bash
# Esegui migrazioni su production database
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Genera Prisma client (automatico in build, ma verificare)
npx prisma generate
```

### Step 6: Dominio Custom (Opzionale)

1. Vai su **Settings → Domains**
2. Aggiungi il tuo dominio
3. Configura DNS records:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 🐳 Docker Deployment

Per deployment su infrastruttura custom (AWS, DigitalOcean, etc.)

### 1. Dockerfile

Crea `Dockerfile` nella root:

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Docker Compose

Crea `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/womenintennis
      - JWT_SECRET=${JWT_SECRET}
      - EMAIL_HOST=${EMAIL_HOST}
      - EMAIL_PORT=${EMAIL_PORT}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASS=${EMAIL_PASS}
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=womenintennis
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Build & Run

```bash
# Build image
docker-compose build

# Run containers
docker-compose up -d

# Esegui migrazioni
docker-compose exec app npx prisma migrate deploy

# Check logs
docker-compose logs -f app
```

---

## 🛠️ Deploy Manuale

Per deployment su server Linux (Ubuntu/Debian):

### 1. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Deploy App

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/svilupp0/womenInTennis.git
cd womenInTennis

# Install dependencies
sudo npm ci --production

# Build app
sudo npm run build

# Setup .env
sudo cp .env.example .env
sudo nano .env  # Configura variabili produzione
```

### 3. Start con PM2

```bash
# Start app
pm2 start npm --name "women-in-net" -- start

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### 4. Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/womeninnet
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/womeninnet /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. SSL con Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🗄️ Database Setup Produzione

### Vercel Postgres

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Create database
vercel postgres create

# Get connection string
vercel env pull
```

### AWS RDS

1. Crea RDS PostgreSQL instance
2. Configura Security Groups (porta 5432)
3. Ottieni connection string:
   ```
   postgresql://username:password@endpoint.region.rds.amazonaws.com:5432/database
   ```

### Supabase

1. Crea progetto su [supabase.com](https://supabase.com)
2. Vai su **Settings → Database**
3. Copia **Connection string** (con password)
4. Abilita **Connection pooling** per performance

### Migrazioni Database

```bash
# Esegui migrazioni su production
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Verifica schema
DATABASE_URL="your-production-url" npx prisma db push

# Seed iniziale (opzionale)
DATABASE_URL="your-production-url" npx prisma db seed
```

---

## 🔐 Variabili d'Ambiente Produzione

### Generazione JWT_SECRET Sicuro

```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Output esempio:
# K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=
```

### Email SMTP Setup

**Gmail (App Password):**

1. Attiva 2FA su account Google
2. Vai su **Account → Security → 2-Step Verification → App passwords**
3. Genera password per "Mail"
4. Usa password generata in `EMAIL_PASS`

**SendGrid:**

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Google Maps API

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea progetto o seleziona esistente
3. Abilita APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Crea credenziali → API Key
5. Restrizioni (IMPORTANTE):
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: `your-domain.com/*`
   - **API restrictions**: Solo Maps, Places, Geocoding

---

## ✅ Post-Deployment

### Checklist Verifica

- [ ] **Homepage** carica correttamente
- [ ] **Login/Registration** funziona
- [ ] **Email verification** inviata e ricevuta
- [ ] **Dashboard** accessibile dopo login
- [ ] **Calendario** carica eventi
- [ ] **Mappa** visualizza campi tennis
- [ ] **Search** giocatrici funziona
- [ ] **Admin panel** accessibile (se admin)
- [ ] **Error pages** (404, 500) personalizzate
- [ ] **Performance** Lighthouse score >90

### Test Produzione

```bash
# Test API health
curl https://your-domain.com/api/test

# Test autenticazione
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test database connection
curl https://your-domain.com/api/users/search
```

### Performance Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --url=https://your-domain.com
```

---

## 📊 Monitoring e Logging

### Vercel Analytics

```bash
# Install
npm install @vercel/analytics

# Add to _app.js
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### Error Tracking (Sentry)

```bash
# Install
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Config in sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
})
```

### Database Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Database size
SELECT pg_size_pretty(pg_database_size('womenintennis'));
```

---

## 🔧 Troubleshooting

### Build Failures

**Error: `Prisma Client not generated`**

```bash
# Solution
npx prisma generate
npm run build
```

**Error: `Module not found`**

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues

**Connection timeout**

```env
# Add connection pooling
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=30"
```

**SSL required**

```env
# Add SSL mode
DATABASE_URL="postgresql://...?sslmode=require"
```

### Email Not Sending

**Gmail blocked**

1. Verifica 2FA attiva
2. Usa App Password (non password account)
3. Check "Less secure app access" disabilitato

**Port 587 blocked**

```env
# Try port 465 con SSL
EMAIL_PORT=465
EMAIL_SECURE=true
```

### Performance Issues

**Slow API responses**

```javascript
// Add database indexes
// In prisma/schema.prisma
model User {
  email String @unique
  comune String

  @@index([comune])
  @@index([disponibilita])
}
```

**High memory usage**

```javascript
// Optimize Prisma queries
const users = await prisma.user.findMany({
  select: { id: true, email: true }, // Solo campi necessari
  take: 50, // Limit results
  skip: page * 50, // Pagination
})
```

---

## 📞 Supporto

### Risorse Utili

- 📚 [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- 🎯 [Vercel Docs](https://vercel.com/docs)
- 🗄️ [Prisma Deploy Docs](https://www.prisma.io/docs/guides/deployment)
- 🐳 [Docker Docs](https://docs.docker.com/)

### Contact

- 📧 **Email**: win.womeninnet@gmail.com
- 💬 **Issues**: [GitHub Issues](https://github.com/svilupp0/womenInTennis/issues)

---

**Ultimo aggiornamento**: 1 Febbraio 2026
**Versione**: 1.0
