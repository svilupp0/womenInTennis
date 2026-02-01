import { useState } from 'react'
import styles from '../styles/Auth.module.css'
import { questions, levelFromScore } from '../config/tennisQuizData'

const TennisQuiz = ({ onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(questions.length).fill(null))
  const [result, setResult] = useState(null)

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const allAnswered = answers.every((answer) => answer !== null)

  const handleAnswerSelect = (value) => {
    const updated = [...answers]
    updated[currentIndex] = value
    setAnswers(updated)
  }

  const goNext = () => {
    if (isLastQuestion) {
      const score = answers.reduce((acc, val) => acc + (Number(val) || 0), 0)
      const level = levelFromScore(score)
      setResult({ score, level })
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const goBack = () => {
    if (result) {
      setResult(null)
      setCurrentIndex(questions.length - 1)
      return
    }
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const renderScaleButtons = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
      {Array.from({ length: 11 }, (_, value) => (
        <button
          type="button"
          key={value}
          className={`btn ${currentAnswer === value ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            flex: '1 0 60px',
            minWidth: '45px',
            color: 'black',
            border: '1px solid var(--gray-300)',
            background: 'var(--gray-100)',
          }}
          onClick={() => handleAnswerSelect(value)}
        >
          {value}
        </button>
      ))}
    </div>
  )

  const renderChoiceButtons = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
      {currentQuestion.options.map((option) => (
        <label
          key={option.value}
          style={{
            border: '1px solid var(--gray-200)',
            borderRadius: '6px',
            padding: '0.75rem',
            cursor: 'pointer',
            background: currentAnswer === option.value ? 'var(--primary-50)' : 'transparent',
          }}
        >
          <input
            type="radio"
            name={`quiz-q-${currentQuestion.id}`}
            value={option.value}
            checked={currentAnswer === option.value}
            onChange={() => handleAnswerSelect(option.value)}
            style={{ marginRight: '0.5rem' }}
          />
          {option.label}
        </label>
      ))}
    </div>
  )

  if (result) {
    return (
      <div className={styles.formGroup}>
        <h3>🎯 Risultato Quiz Tennis</h3>
        <p style={{ fontSize: '1.1rem' }}>
          Punteggio totale: <strong>{result.score}/100</strong>
        </p>
        <p style={{ fontSize: '1.1rem' }}>
          Livello assegnato: <strong>{result.level}</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onComplete({ livello: result.level, score: result.score })}
          >
            ➕ Aggiungi
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annulla
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.formGroup}>
      <div style={{ marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
          Domanda {currentIndex + 1} di {questions.length}
        </p>
        <h3 style={{ marginBottom: '0.5rem' }}>{currentQuestion.title}</h3>
      </div>

      {currentQuestion.type === 'scale' ? renderScaleButtons() : renderChoiceButtons()}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={goBack}
          disabled={currentIndex === 0}
          style={{
            border: '1px solid var(--gray-300)',
            background: 'var(--gray-100)',
            color: 'black',
            opacity: currentIndex === 0 ? 0.4 : 1,
          }}
        >
          ⬅️ Indietro
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={goNext}
          disabled={currentAnswer === null}
        >
          {isLastQuestion ? 'Calcola livello' : 'Avanti ➡️'}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          style={{
            border: '1px solid var(--gray-300)',
            background: 'transparent',
            color: 'black',
          }}
        >
          Annulla
        </button>
      </div>

      {isLastQuestion && !allAnswered && (
        <p style={{ marginTop: '0.5rem', color: 'var(--warning)' }}>
          Compila tutte le risposte per calcolare il livello.
        </p>
      )}
    </div>
  )
}

export default TennisQuiz
