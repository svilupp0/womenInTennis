export const questions = [
  {
    id: 1,
    type: 'scale',
    title: 'Dritto – solidità: Su 10 dritti in palleggio regolare, quanti vanno in campo?',
  },
  {
    id: 2,
    type: 'scale',
    title:
      "Dritto – qualità: Su 10 dritti in spinta, quanti mettono l'avversario in difficoltà o fanno punto?",
  },
  {
    id: 3,
    type: 'scale',
    title: 'Rovescio – affidabilità: Su 10 rovesci, quanti vanno in campo?',
  },
  {
    id: 4,
    type: 'scale',
    title:
      'Servizio – continuità: Su 10 servizi totali (prime + seconde), quanti giochi senza doppio fallo?',
  },
  {
    id: 5,
    type: 'scale',
    title:
      'Servizio – impatto: Su 10 servizi, quanti ti danno un vantaggio immediato nello scambio?',
  },
  {
    id: 6,
    type: 'scale',
    title: 'Risposta: Su 10 risposte al servizio, quante rimetti in campo in modo giocabile?',
  },
  {
    id: 7,
    type: 'scale',
    title:
      'Scambi lunghi: Su 10 scambi da 6+ colpi, quanti vinci o resti competitivo senza errore gratuito?',
  },
  {
    id: 8,
    type: 'scale',
    title: 'Gioco a rete: Su 10 volée facili, quante chiudi?',
  },
  {
    id: 9,
    type: 'choice',
    title: 'Adattamento tattico – Quando una strategia non funziona:',
    options: [
      { value: 0, label: '0 = "Continuo uguale"' },
      { value: 5, label: '5 = "Provo a cambiare"' },
      { value: 10, label: '10 = "Cambio con criterio"' },
    ],
  },
  {
    id: 10,
    type: 'choice',
    title: 'Pressione – Nei punti importanti (40–40, palla break):',
    options: [
      { value: 0, label: '0 = "Gioco peggio"' },
      { value: 5, label: '5 = "Uguale"' },
      { value: 10, label: '10 = "Meglio"' },
    ],
  },
]

export const levelFromScore = (score) => {
  if (score <= 35) return 'Principiante'
  if (score <= 55) return 'Amatore base'
  if (score <= 70) return 'Intermedio'
  if (score <= 85) return 'Avanzato'
  return 'Agonista'
}
