import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#00a32e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Women in Net" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎾</text></svg>" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Women in Net - Trova la tua partner di tennis" />
        <meta property="og:description" content="Connetti con altre tenniste nella tua zona. Trova la partner perfetta per i tuoi match!" />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Women in Net - Trova la tua partner di tennis" />
        <meta name="twitter:description" content="Connetti con altre tenniste nella tua zona. Trova la partner perfetta per i tuoi match!" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}