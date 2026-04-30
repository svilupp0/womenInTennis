import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Qualcosa è andato storto</h1>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Si è verificato un errore imprevisto. Ricarica la pagina per riprovare.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#00a32e',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Ricarica pagina
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
