import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { useEffect } from 'react'
import PWAInstallManager from '../lib/pwaInstallManager'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Registrazione del Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrato con successo:', registration);
        })
        .catch((error) => {
          console.log('Registrazione Service Worker fallita:', error);
        });
    }

    // Inizializzazione PWA Install Manager SOLO se autenticato
    // Il manager verrà inizializzato nella dashboard dopo il login
    // Questo previene popup su pagine pubbliche come home, login, register
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
