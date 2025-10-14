// ==============================================
// PWA Install Prompt Manager (Refactored)
// ==============================================
class PWAInstallManager {
    constructor(config = {}) {
        this.config = {
            promptVersion: config.promptVersion || 'v1.0.0',
            delayBeforeShow: config.delayBeforeShow || 5000,
            ...config
        };

        this.deferredPrompt = null;
        this.popupElement = null;
        this.showTimeout = null; // Aggiunto per tracciare il timeout
        this.storageKey = `pwa_install_dismissed_${this.config.promptVersion}`;

        this.init();
    }

    // Inizializzazione
    init() {
        // Previeni l'inizializzazione o l'ulteriore esecuzione di listener se già in standalone
        if (this.isStandalone()) {
            console.log('✅ App già in modalità standalone');
            return;
        }

        // Listener per l'evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.handleInstallPromptReady();
        });

        // Listener per rilevare l'installazione avvenuta
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installata con successo');
            this.cleanup();
        });
    }

    // Verifica se l'app è già in modalità standalone
    isStandalone() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true
        );
    }

    // Verifica se l'utente è su iOS
    isIOS() {
        return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    }

    // Gestisce quando il prompt è pronto
    handleInstallPromptReady() {
        if (!this.shouldShowPrompt()) {
            return;
        }

        // Salva l'ID del timeout per poterlo pulire in seguito
        this.showTimeout = setTimeout(() => {
            // Doppio check prima di mostrare
            if (this.deferredPrompt && !this.isStandalone()) {
                this.showPopup();
            }
        }, this.config.delayBeforeShow);
    }

    // Determina se mostrare il prompt (Logica Unificata)
    shouldShowPrompt() {
        // 1. Se l'app è GIA' installata, non mostrare
        if (this.isStandalone()) {
            // Chiama cleanup per pulire eventuali timeout pendenti
            this.cleanup();
            return false;
        }

        // 2. Se già dismissato per questa versione
        if (localStorage.getItem(this.storageKey) === 'true') {
            return false;
        }

        // 3. Se non c'è il deferredPrompt (iOS non lo supporta)
        if (!this.deferredPrompt && !this.isIOS()) {
            return false;
        }

        return true;
    }

    // Mostra il popup
    showPopup() {
        if (this.popupElement) {
            return; // Già mostrato
        }



        this.popupElement = document.createElement('div');
        this.popupElement.className = 'pwa-install-popup';
        this.popupElement.innerHTML = `
            <div class="pwa-popup-overlay"></div>
            <div class="pwa-popup-content">
                <div class="pwa-popup-header">
                    <span class="pwa-popup-icon">📲</span>
                    <h3>Installa l'App</h3>
                </div>
                <p>Aggiungi questa app alla tua schermata home per un accesso rapido!</p>
                <div class="pwa-popup-actions">
                    <button id="pwa-install-btn" class="pwa-btn-primary">Installa</button>
                    <button id="pwa-close-btn" class="pwa-btn-secondary">Non ora</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.popupElement);

        // Event listeners con bind corretto
        const installBtn = document.getElementById('pwa-install-btn');
        const closeBtn = document.getElementById('pwa-close-btn');

        installBtn.addEventListener('click', () => this.handleInstall());
        closeBtn.addEventListener('click', () => this.handleDismiss());
    }

    // Gestisce il click su "Installa"
    async handleInstall() {
        if (this.isIOS()) {
            alert("Per installare su iOS:\n\n1. Tocca l'icona 'Condividi' 🔗\n2. Scorri e seleziona 'Aggiungi a Home'\n3. Tocca 'Aggiungi'");
            this.hidePopup();
            return;
        }

        if (!this.deferredPrompt) {
            console.warn('deferredPrompt non disponibile');
            this.hidePopup();
            return;
        }

        try {
            // Mostra il prompt nativo
            this.deferredPrompt.prompt();

            // Aspetta la scelta dell'utente
            const choiceResult = await this.deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('✅ Utente ha accettato l\'installazione');
            } else {
                console.log('❌ Utente ha rifiutato l\'installazione');
                // Salva che l'utente ha rifiutato per questa versione
                localStorage.setItem(this.storageKey, 'true');
            }

        } catch (error) {
            console.error('Errore durante l\'installazione:', error);
        } finally {
            // Reset del prompt (può essere usato una sola volta)
            this.deferredPrompt = null;
            this.hidePopup();
        }
    }

    // Gestisce il click su "Non ora"
    handleDismiss() {
        localStorage.setItem(this.storageKey, 'true');
        this.hidePopup();
    }

    // Nasconde il popup
    hidePopup() {
        if (this.popupElement) {
            this.popupElement.remove();
            this.popupElement = null;
        }
    }

    // Cleanup completo (anche pulizia del timeout)
    cleanup() {
        this.hidePopup();
        this.deferredPrompt = null;

        // Pulizia professionale: assicura che il timeout non venga eseguito se non necessario
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
    }

    // Metodo pubblico per riattivare il prompt (es. dopo un update)
    resetPrompt() {
        localStorage.removeItem(this.storageKey);
    }
}

// Esporta la classe per importazione
export default PWAInstallManager;
