// 🎯 USER PROFILE HEADER COMPONENT
// Componente ottimizzato per la sezione profilo della dashboard

import React, { useState, useEffect } from 'react';
import { 
  truncateDisplayName, 
  getTooltipDisplayName, 
  getInitials,
  isMobileDevice 
} from '../utils/displayNameUtils';
import styles from '../styles/Dashboard.module.css';

const UserProfileHeader = ({ 
  user, 
  getDisplayName, 
  getUserLocation, 
  getUserLevel,
  availability,
  onAvailabilityToggle,
  onEditProfile,
  onShowReports
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Rileva se siamo su mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ottieni nomi ottimizzati
  const originalName = getDisplayName();
  const displayName = truncateDisplayName(originalName, isMobile ? 15 : 20, isMobile);
  const tooltipName = getTooltipDisplayName(originalName);
  const initials = getInitials(originalName);
  const needsTooltip = originalName !== displayName;

  // Ottieni dettagli utente con gestione overflow
  const location = getUserLocation();
  const level = getUserLevel();
  const details = `📍 ${location} • 🎾 ${level}`;
  const truncatedDetails = isMobile && details.length > 30 
    ? `📍 ${location.substring(0, 10)}... • 🎾 ${level}`
    : details;

  return (
    <section className={styles.profileSection}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          {/* Avatar e Info Utente */}
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {initials}
            </div>
            <div className={styles.profileInfo}>
              <h1 
                className={styles.profileName}
                title={needsTooltip ? tooltipName : undefined}
                aria-label={`Nome utente: ${originalName}`}
              >
                {displayName}
              </h1>
              <p 
                className={styles.profileDetails}
                title={isMobile ? details : undefined}
                aria-label={`Posizione: ${location}, Livello: ${level}`}
              >
                {truncatedDetails}
              </p>
            </div>
          </div>

          {/* Azioni Profilo */}
          <div className={styles.profileActions}>
            {/* Toggle Disponibilità */}
            <div className={styles.availabilityToggle}>
              <span className={styles.toggleLabel}>
                {isMobile ? 'Disp.' : 'Disponibile'}:
              </span>
              <div 
                className={`${styles.toggle} ${availability ? styles.active : ''}`}
                onClick={onAvailabilityToggle}
                role="switch"
                aria-checked={availability}
                aria-label={`Disponibilità: ${availability ? 'attiva' : 'disattiva'}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAvailabilityToggle();
                  }
                }}
              >
                <div className={styles.toggleSlider}></div>
              </div>
            </div>

            {/* Bottoni Azione */}
            <button 
              className=\"btn btn-secondary\"
              onClick={onEditProfile}
              aria-label=\"Modifica profilo utente\"
            >
              {isMobile ? '✏️' : '✏️ Modifica Profilo'}
            </button>
            
            <button 
              className=\"btn btn-outline\"
              onClick={onShowReports}
              aria-label=\"Visualizza le mie segnalazioni\"
            >
              {isMobile ? '📄' : '📄 Le mie segnalazioni'}
            </button>
          </div>
        </div>

        {/* Indicatore Status Mobile */}
        {isMobile && (
          <div className={styles.mobileStatusBar}>
            <span className={`${styles.statusIndicator} ${availability ? styles.available : styles.unavailable}`}>
              {availability ? '🟢 Disponibile' : '🔴 Non disponibile'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserProfileHeader;