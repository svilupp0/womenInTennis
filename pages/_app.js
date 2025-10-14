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

    // Inizializzazione PWA Install Manager
    const pwaManager = new PWAInstallManager({
      promptVersion: 'v1.0.3',
      delayBeforeShow: 5000 // 5 secondi
    });

    // Esponi globalmente per debug o reset manuale
    window.pwaManager = pwaManager;
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
