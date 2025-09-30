// lib/services/emailService.js
import nodemailer from 'nodemailer'

/**
 * Configurazione del transporter email
 */
const createTransporter = () => {
  const config = {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  }

  if (!config.auth.user || !config.auth.pass) {
    throw new Error('Configurazione email mancante. Controlla EMAIL_USER e EMAIL_PASSWORD in .env')
  }

  return nodemailer.createTransport(config)
}

/**
 * Invia email di verifica account
 * @param {string} email - Email destinatario
 * @param {string} token - Token di verifica
 * @param {string} userName - Nome utente (opzionale)
 * @returns {Promise<boolean>} Success status
 */
export async function sendVerificationEmail(email, token, userName = '') {
  try {
    const transporter = createTransporter()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationLink = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Women in Net" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎾 Verifica la tua email - Women in Net',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifica Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c5530; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #538558ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎾 Women in Net</h1>
              <p>Benvenuta nella community!</p>
            </div>
            <div class="content">
              <h2>Ciao ${email.split('@')[0]}! 👋</h2>
              <p>Grazie per esserti registrata su <strong>Women in Net</strong>!</p>
              <p>Per completare la registrazione e iniziare a trovare partner di gioco, clicca sul pulsante qui sotto per verificare la tua email:</p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">✅ Verifica Email</a>
              </div>
              
              <p><strong>Oppure copia e incolla questo link nel tuo browser:</strong></p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                ${verificationLink}
              </p>
              
              <hr style="margin: 30px 0;">
              
              <h3>🎾 Cosa puoi fare dopo la verifica:</h3>
              <ul>
                <li>Trovare partner di tennis nella tua zona</li>
                <li>Organizzare partite e tornei</li>
                <li>Connetterti con altre giocatrici</li>
                <li>Accedere al calendario eventi</li>
              </ul>
              
              <p><small>⏰ Questo link scadrà tra 24 ore per motivi di sicurezza.</small></p>
            </div>
            <div class="footer">
              <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
              <p>© 2024 Women in Net - Community di tennis femminile</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        🎾 Women in Net - Verifica Email
        
        Ciao ${email.split('@')[0]}!
        
        Grazie per esserti registrata su Women in Net!
        
        Per completare la registrazione, clicca su questo link:
        ${verificationLink}
        
        Questo link scadrà tra 24 ore.
        
        Se non hai richiesto questa registrazione, puoi ignorare questa email.
        
        © 2024 Women in Net
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email di verifica inviata:', result.messageId)
    return true

  } catch (error) {
    console.error('❌ Errore invio email verifica:', error)
    return false
  }
}

/**
 * Invia email di benvenuto dopo verifica
 * @param {string} email - Email destinatario
 * @param {string} userName - Nome utente
 * @returns {Promise<boolean>} Success status
 */
export async function sendWelcomeEmail(email, userName = '') {
  try {
    const transporter = createTransporter()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Women in Net" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Benvenuta in Women in Net!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Benvenuta!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c5530; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2c5530; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎾 Women in Net</h1>
              <p>Account verificato con successo!</p>
            </div>
            <div class="content">
              <h2>Benvenuta ${email.split('@')[0]}! 🎉</h2>
              <p>Il tuo account è stato verificato con successo! Ora puoi accedere a tutte le funzionalità della piattaforma.</p>
              
              <div style="text-align: center;">
                <a href="${appUrl}/dashboard" class="button">🏠 Vai alla Dashboard</a>
                <a href="${appUrl}/calendar" class="button">📅 Vedi Calendario</a>
              </div>
              
              <h3>🚀 Inizia subito:</h3>
              <ul>
                <li><strong>Completa il tuo profilo</strong> - Aggiungi il tuo livello e comune</li>
                <li><strong>Cerca partner</strong> - Trova giocatrici nella tua zona</li>
                <li><strong>Crea eventi</strong> - Organizza partite e allenamenti</li>
                <li><strong>Esplora la mappa</strong> - Trova campi da tennis vicini</li>
              </ul>
              
              <h3>💡 Suggerimenti:</h3>
              <ul>
                <li>Aggiorna la tua disponibilità nel calendario</li>
                <li>Usa la ricerca per trovare giocatrici del tuo livello</li>
                <li>Partecipa agli eventi della community</li>
              </ul>
            </div>
            <div class="footer">
              <p>Buon divertimento e buone partite! 🎾</p>
              <p>© 2024 Women in Net - Community di tennis femminile</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        🎾 Women in Net - Benvenuta!
        
        Benvenuta ${email.split('@')[0]}!
        
        Il tuo account è stato verificato con successo!
        
        Vai alla dashboard: ${appUrl}/dashboard
        Vedi calendario: ${appUrl}/calendar
        
        Inizia subito:
        - Completa il tuo profilo
        - Cerca partner di gioco
        - Crea eventi
        - Esplora la mappa dei campi
        
        Buon divertimento e buone partite!
        
        © 2024 Women in Net
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email di benvenuto inviata:', result.messageId)
    return true

  } catch (error) {
    console.error('❌ Errore invio email benvenuto:', error)
    return false
  }
}

/**
 * Invia email per reset password
 * @param {string} email - Email destinatario
 * @param {string} token - Token di reset
 * @returns {Promise<boolean>} Success status
 */
export async function sendResetPasswordEmail(email, token) {
  try {
    const transporter = createTransporter()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Women in Net" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Reset Password - Women in Net',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Password</h1>
              <p>Women in Net</p>
            </div>
            <div class="content">
              <h2>Richiesta Reset Password</h2>
              <p>Hai richiesto di reimpostare la password per il tuo account Women in Net.</p>
              <p>Clicca sul pulsante qui sotto per creare una nuova password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">🔐 Reset Password</a>
              </div>
              
              <p><strong>Oppure copia e incolla questo link:</strong></p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                ${resetLink}
              </p>
              
              <p><small>⏰ Questo link scadrà tra 1 ora per motivi di sicurezza.</small></p>
              
              <hr style="margin: 30px 0;">
              
              <p><strong>⚠️ Se non hai richiesto questo reset:</strong></p>
              <ul>
                <li>Puoi ignorare questa email</li>
                <li>La tua password attuale rimane valida</li>
                <li>Considera di cambiare la password per sicurezza</li>
              </ul>
            </div>
            <div class="footer">
              <p>Per sicurezza, non condividere mai questo link con nessuno.</p>
              <p>© 2024 Women in Net</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        🔐 Women in Net - Reset Password
        
        Hai richiesto di reimpostare la password.
        
        Clicca su questo link per creare una nuova password:
        ${resetLink}
        
        Questo link scadrà tra 1 ora.
        
        Se non hai richiesto questo reset, puoi ignorare questa email.
        
        © 2024 Women in Net
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email reset password inviata:', result.messageId)
    return true

  } catch (error) {
    console.error('❌ Errore invio email reset:', error)
    return false
  }
}

/**
 * Test configurazione email
 * @returns {Promise<boolean>} Success status
 */
export async function testEmailConfiguration() {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('✅ Configurazione email valida')
    return true
  } catch (error) {
    console.error('❌ Errore configurazione email:', error)
    return false
  }
}