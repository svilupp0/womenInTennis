import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        {/* Meta Tags Base */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#744040" />

        {/* Title e Description */}
        <title>Women in Net - Trova la tua partner di gioco</title>
        <meta
          name="description"
          content="Connetti con altre giocatrici nella tua zona. Trova la partner perfetta per i tuoi match di tennis e padel!"
        />
        <meta
          name="keywords"
          content="tennis femminile, padel femminile, giocatrici femminili, matching tennis, partite tennis, partner tennis, sport femminile italia"
        />
        <meta name="author" content="Francesca - svilupp0" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://women-in-tennis.vercel.app" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://women-in-tennis.vercel.app" />
        <meta property="og:title" content="Women in Net - Trova la tua partner di gioco" />
        <meta
          property="og:description"
          content="Connetti con altre giocatrici nella tua zona. Trova la partner perfetta per i tuoi match di tennis e padel!"
        />
        <meta property="og:image" content="https://women-in-tennis.vercel.app/icons/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Women in Net" />
        <meta property="og:locale" content="it_IT" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://women-in-tennis.vercel.app" />
        <meta name="twitter:title" content="Women in Net - Trova la tua partner di gioco" />
        <meta
          name="twitter:description"
          content="Connetti con altre giocatrici nella tua zona. Trova la partner perfetta per i tuoi match di tennis e padel!"
        />
        <meta
          name="twitter:image"
          content="https://women-in-tennis.vercel.app/icons/og-image.jpg"
        />

        {/* Favicon e Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />

        {/* Manifest per PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Robots */}
        <meta name="robots" content="index, follow" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Women in Net',
              url: 'https://women-in-tennis.vercel.app',
              description:
                'Connetti con altre giocatrici nella tua zona. Trova la partner perfetta per i tuoi match di tennis e padel!',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://women-in-tennis.vercel.app/map?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
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
              <h1 className={styles.heroTitle}>Trova la tua partner di gioco</h1>
              <p className={styles.heroSubtitle}>
                Connetti con altre giocatrici nella tua zona. Organizza match, migliora il tuo gioco
                e fai nuove amicizie nel mondo dello sport femminile.
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
            <h2 className={styles.featuresTitle}>Perché scegliere Women in Net?</h2>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📍</div>
                <h3 className={styles.featureTitle}>Trova vicino a te</h3>
                <p className={styles.featureDescription}>
                  Cerca giocatrici nella tua città o comune. Filtra per distanza e trova partner
                  comode da raggiungere.
                </p>
                <Link
                  href="/map"
                  className="btn btn-secondary"
                  style={{
                    marginTop: '1rem',
                    display: 'inline-block',
                    background:
                      'linear-gradient(135deg, #744040 0%, #27537f 50%, var(--gray-200) 100%)',
                    color: 'white',
                  }}
                >
                  🗺️ Visualizza mappa
                </Link>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⚡</div>
                <h3 className={styles.featureTitle}>Livello compatibile</h3>
                <p className={styles.featureDescription}>
                  Trova partner del tuo stesso livello: principiante, intermedio o avanzato. Match
                  equilibrati e divertenti.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💬</div>
                <h3 className={styles.featureTitle}>Connessioni sicure</h3>
                <p className={styles.featureDescription}>
                  Profili verificati e community femminile. Ambiente sicuro e supportivo per tutte
                  le giocatrici.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerContent}>
              <div className={styles.footerLogo}>Women in Net</div>
              <p className={styles.footerText}>
                © 2024 Women in Net. La community delle giocatrici italiane.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
