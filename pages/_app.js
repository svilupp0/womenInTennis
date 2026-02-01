import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { useEffect } from 'react'
import PWAInstallManager from '../lib/pwaInstallManager'
import Script from 'next/script'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Registrazione del Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrato con successo:', registration)
        })
        .catch((error) => {
          console.log('Registrazione Service Worker fallita:', error)
        })
    }

    // Inizializzazione PWA Install Manager SOLO se autenticato
    // Il manager verrà inizializzato nella dashboard dopo il login
    // Questo previene popup su pagine pubbliche come home, login, register
  }, [])

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Script
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        strategy="beforeInteractive"
        data-name="BMC-Widget"
        data-cfasync="false"
        data-id="winwomenina"
        data-description="Support me on Buy me a coffee!"
        data-message="🎾 Questa piattaforma è stata creata con passione per te, ma ha costi vivi reali. Offrimi un caffè e sostieni il tennis femminile digitale!"
        data-color="#40DCA5"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
      />
    </AuthProvider>
  )
}
