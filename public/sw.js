// Nome delle cache (se ne avrai bisogno in futuro)
const CACHE_NAME = 'my-pwa-cache-v1';

// Evento: install
// Si attiva la prima volta che il Service Worker viene installato.
self.addEventListener('install', (event) => {
    console.log('Service Worker: installazione in corso...');
    // Forza l'attivazione immediata del nuovo Service Worker
    self.skipWaiting();
});

// Evento: activate
// Si attiva quando il Service Worker diventa attivo.
self.addEventListener('activate', (event) => {
    console.log('Service Worker: attivato e pronto per gestire i fetch.');
    // Rendi il Service Worker disponibile immediatamente
    event.waitUntil(clients.claim());
});

// Evento: fetch (opzionale ma fondamentale per il caching)
// Questo gestisce tutte le richieste di rete dall'app.
// Per ora, possiamo lasciare che le richieste passino alla rete (network-first).
self.addEventListener('fetch', (event) => {
    // Lascia che le richieste passino normalmente, a meno che tu non voglia implementare il caching
    // console.log('Service Worker: richiesta fetch intercettata', event.request.url);
    // event.respondWith(fetch(event.request));
});
