import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { submitQuiz } from '../api';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function useTimer(startTime) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return elapsed;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const QuizPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const quizData = location.state?.quizData;
  const questions = quizData?.questions || [];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const elapsed = useTimer(startTime);

  // Redirect if no quiz data
  useEffect(() => {
    if (!quizData) navigate('/dashboard');
  }, [quizData, navigate]);

  const selectAnswer = (option) => {
    setAnswers(prev => ({ ...prev, [String(currentQ)]: option }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await submitQuiz(id, answers);
      navigate(`/result/${id}`, { state: { resultData: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Try again.');
      setSubmitting(false);
    }
  };

  if (!quizData || questions.length === 0) return null;

  const q = questions[currentQ];
  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;
  const progress = ((currentQ + 1) / questions.length) * 100;

  const timerClass = elapsed > 1500 ? 'danger' : elapsed > 900 ? 'warning' : '';

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0 0', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '8px' }}>
              {quizData.topic}
            </div>
            <div className="progress-bar-wrap" style={{ width: '200px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {currentQ + 1} of {questions.length}
            </div>
          </div>
          <div className={`timer ${timerClass}`}>{formatTime(elapsed)}</div>
          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--success)' }}>{answered}</span> answered &bull; {' '}
            <span style={{ color: 'var(--text-muted)' }}>{unanswered}</span> remaining
          </div>
        </div>

        <div className="quiz-layout">
          {/* Question area */}
          <div>
            <div className="question-card fade-in" key={currentQ}>
              <div className="question-number">Question {currentQ + 1} of {questions.length}</div>
              <div className="question-text">{q.question}</div>
              <div className="options-grid">
                {OPTION_KEYS.map(opt => (
                  <button
                    key={opt}
                    className={`option-btn ${answers[String(currentQ)] === opt ? 'selected' : ''}`}
                    onClick={() => selectAnswer(opt)}
                  >
                    <span className="option-letter">{opt}</span>
                    <span>{q.options[opt]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-nav">
              <button
                className="btn btn-outline"
                onClick={handlePrev}
                disabled={currentQ === 0}
              >
                ← Previous
              </button>

              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {answers[String(currentQ)] ? `✓ Answered` : 'Not answered'}
              </span>

              {currentQ < questions.length - 1 ? (
                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleNext}>
                  Next →
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  style={{ width: 'auto' }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : '✓ Submit Quiz'}
                </button>
              )}
            </div>

            {error && <div className="error-msg" style={{ marginTop: '16px' }}>⚠ {error}</div>}
          </div>

          {/* Sidebar */}
          <div className="quiz-sidebar">
            {/* Question navigator */}
            <div className="sidebar-card">
              <div className="sidebar-title">Questions</div>
              <div className="question-grid">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    className={`q-dot ${i === currentQ ? 'current' : answers[String(i)] ? 'answered' : ''}`}
                    onClick={() => setCurrentQ(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="sidebar-card">
              <div className="sidebar-title">Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Answered', value: answered, color: 'var(--accent)' },
                  { label: 'Skipped', value: unanswered, color: 'var(--text-muted)' },
                  { label: 'Time', value: formatTime(elapsed), color: 'var(--accent2)' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: '600' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit section */}
            <div className="sidebar-card submit-section">
              <div className="sidebar-title">Finish Quiz</div>
              {unanswered > 0 && (
                <div className="unanswered-warning">
                  ⚠ {unanswered} question{unanswered > 1 ? 's' : ''} unanswered
                </div>
              )}
              <button
                className="btn btn-success"
                style={{ width: '100%' }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    Submitting...
                  </>
                ) : (
                  '✓ Submit Now'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
