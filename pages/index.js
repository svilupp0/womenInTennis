import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Women in Net - Trova la tua partner di tennis</title>
        <meta name="description" content="Connetti con altre tenniste nella tua zona. Trova la partner perfetta per i tuoi match!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

      </Head>

      <div className={styles.homepage}>
        {/* Header */}
        <header className={styles.header}>
          <div className="container">
            <div className={styles.headerContent}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>🎾</div>
                <span>Women in Net</span>
              </div>
              
              <div className={styles.authButtons}>
                <Link href="/login" className="btn btn-secondary">
                  Accedi
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Registrati
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Trova la tua partner di tennis
              </h1>
              <p className={styles.heroSubtitle}>
                Connetti con altre tenniste nella tua zona. Organizza match, migliora il tuo gioco e fai nuove amicizie nel mondo del tennis femminile.
              </p>
              
              <div className={styles.heroActions}>
                <Link href="/register" className="btn btn-primary">
                  🚀 Inizia ora - È gratis!
                </Link>
                <Link href="/map" className="btn btn-accent">
                  🗺️ Esplora la mappa
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className="container">
            <h2 className={styles.featuresTitle}>
              Perché scegliere Women in Net?
            </h2>
            
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📍</div>
                <h3 className={styles.featureTitle}>Trova vicino a te</h3>
                <p className={styles.featureDescription}>
                  Cerca tenniste nella tua città o comune. Filtra per distanza e trova partner comode da raggiungere.
                </p>
                <Link href="/map" className="btn btn-secondary" style={{marginTop: '1rem', display: 'inline-block'}}>
                  🗺️ Visualizza mappa
                </Link>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⚡</div>
                <h3 className={styles.featureTitle}>Livello compatibile</h3>
                <p className={styles.featureDescription}>
                  Trova partner del tuo stesso livello: principiante, intermedio o avanzato. Match equilibrati e divertenti.
                </p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💬</div>
                <h3 className={styles.featureTitle}>Connessioni sicure</h3>
                <p className={styles.featureDescription}>
                  Profili verificati e community femminile. Ambiente sicuro e supportivo per tutte le tenniste.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerContent}>
              <div className={styles.footerLogo}>
                Women in Net
              </div>
              <p className={styles.footerText}>
                © 2024 Women in Net. La community delle tenniste italiane.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}