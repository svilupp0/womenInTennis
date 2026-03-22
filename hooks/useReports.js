import { useState } from 'react'
import { createReport, fetchMyReports } from '../lib/services/reportService'

/**
 * Custom Hook per gestione segnalazioni utenti
 *
 * Responsabilità:
 * - Gestione modal segnalazione
 * - Invio segnalazioni al backend
 * - Caricamento e visualizzazione segnalazioni fatte
 * - Gestione stati form e loading
 *
 * @returns {object} - Stati e funzioni per le segnalazioni
 */
export function useReports() {
  // Stati modal segnalazione
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)
  const [reportForm, setReportForm] = useState({
    reason: '',
    description: '',
  })
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  // Stati lista segnalazioni
  const [showMyReports, setShowMyReports] = useState(false)
  const [myReports, setMyReports] = useState([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)

  /**
   * Apri modal segnalazione per un utente
   */
  const handleReportUser = (player) => {
    setReportTarget(player)
    setReportForm({ reason: '', description: '' })
    setShowReportModal(true)
  }

  /**
   * Aggiorna campo form segnalazione
   */
  const handleReportFormChange = (field, value) => {
    setReportForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * Invia segnalazione al backend
   */
  const submitReport = async () => {
    if (!reportForm.reason) {
      return {
        success: false,
        error: 'Seleziona un motivo per la segnalazione',
      }
    }

    setIsSubmittingReport(true)
    try {
      const result = await createReport({
        reportedId: reportTarget.id,
        reason: reportForm.reason,
        description: reportForm.description,
      })

      if (result.success) {
        // Successo - chiudi modal e reset form
        setShowReportModal(false)
        setReportTarget(null)
        setReportForm({ reason: '', description: '' })

        return {
          success: true,
          message: 'Segnalazione inviata con successo',
        }
      } else {
        return {
          success: false,
          error: result.error || "Errore durante l'invio della segnalazione",
        }
      }
    } catch (error) {
      console.error('Errore invio segnalazione:', error)
      return {
        success: false,
        error: 'Errore di connessione. Riprova più tardi.',
      }
    } finally {
      setIsSubmittingReport(false)
    }
  }

  /**
   * Carica lista segnalazioni fatte dall'utente
   */
  const loadMyReports = async () => {
    setIsLoadingReports(true)
    try {
      const result = await fetchMyReports('given')
      if (result.success) {
        setMyReports(result.reports)
      } else {
        console.error('Errore caricamento segnalazioni:', result.error)
        setMyReports([])
      }
    } catch (error) {
      console.error('Errore caricamento segnalazioni:', error)
      setMyReports([])
    } finally {
      setIsLoadingReports(false)
    }
  }

  /**
   * Toggle visualizzazione segnalazioni
   */
  const toggleMyReports = () => {
    if (!showMyReports) {
      loadMyReports()
    }
    setShowMyReports(!showMyReports)
  }

  /**
   * Chiudi modal segnalazione
   */
  const closeReportModal = () => {
    setShowReportModal(false)
    setReportTarget(null)
    setReportForm({ reason: '', description: '' })
  }

  /**
   * Chiudi lista segnalazioni
   */
  const closeMyReports = () => {
    setShowMyReports(false)
  }

  return {
    // Stati modal segnalazione
    showReportModal,
    reportTarget,
    reportForm,
    isSubmittingReport,

    // Stati lista segnalazioni
    showMyReports,
    myReports,
    isLoadingReports,

    // Funzioni segnalazione
    handleReportUser,
    handleReportFormChange,
    submitReport,
    closeReportModal,

    // Funzioni lista
    toggleMyReports,
    loadMyReports,
    closeMyReports,
  }
}
