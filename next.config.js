/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Applica questi headers a tutte le route
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=()'
          },
          // HSTS solo in produzione
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Script sources
              // In sviluppo, 'unsafe-eval' è necessario per React Fast Refresh.
              // In produzione, è rimosso per maggiore sicurezza.
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} https://maps.googleapis.com https://maps.gstatic.com`,
              // Style sources - permetti Google Fonts e inline per styled-components
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Font sources
              "font-src 'self' https://fonts.gstatic.com data:",
              // Image sources - includi Google Maps e data URLs (CORRETTO)
              "img-src 'self' blob: data: https://maps.googleapis.com https://maps.gstatic.com https://lh3.googleusercontent.com",
              // Connect sources per API calls
              "connect-src 'self' https://maps.googleapis.com",
              // Frame sources per Google Maps embed (se necessario)
              "frame-src 'self' https://www.google.com",
              // Object e base
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              // Upgrade insecure requests solo in produzione
              ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : [])
            ].join('; ')
          }
        ]
      },
      {
        // Headers specifici per API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      },
      {
        // Headers per assets statici
        source: '/(_next/static|favicon.ico|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Configurazioni aggiuntive per sicurezza
  poweredByHeader: false, // Rimuove header "X-Powered-By: Next.js"

  // Configurazione immagini
  images: {
    domains: [
      'maps.googleapis.com',
      'maps.gstatic.com',
      'lh3.googleusercontent.com' // Per foto profilo Google se implementi OAuth
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60
  },

  // Configurazione per produzione
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    generateEtags: true,
    httpAgentOptions: {
      keepAlive: true
    }
  })
}

module.exports = nextConfig