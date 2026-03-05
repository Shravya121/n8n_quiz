import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function getGrade(pct) {
  if (pct >= 90) return { label: 'Excellent!', emoji: '🏆', color: 'var(--success)' };
  if (pct >= 75) return { label: 'Great Job!', emoji: '🎯', color: '#22c55e' };
  if (pct >= 60) return { label: 'Good Work!', emoji: '👍', color: 'var(--accent2)' };
  if (pct >= 40) return { label: 'Keep Trying', emoji: '📚', color: 'var(--accent3)' };
  return { label: 'Need Practice', emoji: '💪', color: 'var(--danger)' };
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

const ResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const resultData = location.state?.resultData;

  if (!resultData) {
    navigate('/dashboard');
    return null;
  }

  const { score, totalQuestions, percentage, timeTaken, results, topic } = resultData;
  const grade = getGrade(percentage);
  const wrongAnswers = results.filter(r => !r.isCorrect);
  const correctAnswers = results.filter(r => r.isCorrect);
  const displayResults = showAll ? results : results.slice(0, 5);

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        {/* Hero result */}
        <div className="result-hero fade-in">
          <div
            className="result-score-display"
            style={{ '--pct': `${percentage * 3.6}deg` }}
          >
            <span className="result-pct">{percentage}%</span>
            <span className="result-label">{score}/{totalQuestions}</span>
          </div>

          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{grade.emoji}</div>
          <h1 style={{
            fontFamily: 'Syne', fontSize: '40px', fontWeight: '800',
            color: grade.color, marginBottom: '8px'
          }}>
            {grade.label}
          </h1>
          {resultData.topic && (
            <div className="badge badge-purple" style={{ margin: '0 auto 24px' }}>
              {resultData.topic}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="result-stats fade-in-delay-1">
          {[
            { label: 'Correct', value: score, color: 'var(--success)' },
            { label: 'Wrong', value: totalQuestions - score, color: 'var(--danger)' },
            { label: 'Score', value: `${percentage}%`, color: grade.color },
            { label: 'Time Taken', value: formatTime(timeTaken || 0), color: 'var(--accent2)' },
          ].map(s => (
            <div key={s.label} className="stat-chip" style={{ borderColor: `${s.color}22` }}>
              <span className="stat-chip-value" style={{ color: s.color }}>{s.value}</span>
              <div className="stat-chip-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '48px' }} className="fade-in-delay-2">
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Try Another Quiz
          </button>
        </div>

        {/* Divider */}
        <div style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: '22px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              Answer Review
            </h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--success)' }}>✓ {correctAnswers.length} correct</span>
              <span style={{ color: 'var(--danger)' }}>✗ {wrongAnswers.length} wrong</span>
            </div>
          </div>
        </div>

        {/* Results list */}
        <div className="results-list fade-in-delay-3">
          {displayResults.map((r, i) => (
            <div
              key={i}
              className={`result-item ${r.isCorrect ? 'correct-item' : 'wrong-item'}`}
            >
              <div className="result-item-header">
                <div className="result-item-q">
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: r.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                    color: r.isCorrect ? 'var(--success)' : 'var(--danger)',
                    fontSize: '12px', marginRight: '10px', flexShrink: 0
                  }}>
                    {r.isCorrect ? '✓' : '✗'}
                  </span>
                  {r.question}
                </div>
              </div>

              <div className="result-options">
                {OPTION_KEYS.map(opt => {
                  const isCorrect = opt === r.correctAnswer;
                  const isSelected = opt === r.selectedAnswer;
                  const isWrong = isSelected && !isCorrect;
                  return (
                    <div
                      key={opt}
                      className={`result-option ${isCorrect ? 'opt-correct' : isWrong ? 'opt-wrong' : ''}`}
                    >
                      <span style={{ fontWeight: '700', fontSize: '12px', opacity: 0.7 }}>{opt}.</span>
                      {r.options[opt]}
                      {isCorrect && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
                      {isWrong && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✗</span>}
                    </div>
                  );
                })}
              </div>

              {r.selectedAnswer ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Your answer: <strong style={{ color: r.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                    {r.selectedAnswer}. {r.options[r.selectedAnswer]}
                  </strong>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Not answered — Correct: <strong style={{ color: 'var(--success)' }}>
                    {r.correctAnswer}. {r.options[r.correctAnswer]}
                  </strong>
                </div>
              )}

              {r.explanation && (
                <div className="result-explanation">
                  💡 {r.explanation}
                </div>
              )}
            </div>
          ))}

          {results.length > 5 && (
            <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
              <button className="btn btn-outline" onClick={() => setShowAll(!showAll)}>
                {showAll ? '▲ Show Less' : `▼ Show All ${results.length} Questions`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
