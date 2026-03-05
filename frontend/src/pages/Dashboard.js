import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { generateQuiz, getQuizHistory } from '../api';

const SUGGESTED_TOPICS = [
  'React.js', 'World History', 'Biology', 'Data Structures',
  'Physics', 'Machine Learning', 'Python', 'Economics'
];

function getGradeColor(pct) {
  if (pct >= 80) return 'var(--success)';
  if (pct >= 60) return 'var(--accent)';
  if (pct >= 40) return 'var(--accent3)';
  return 'var(--danger)';
}

function getGradeLabel(pct) {
  if (pct >= 90) return 'Excellent 🏆';
  if (pct >= 75) return 'Great 🎯';
  if (pct >= 60) return 'Good 👍';
  if (pct >= 40) return 'Fair 📚';
  return 'Needs Work 💪';
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    getQuizHistory()
      .then(res => setHistory(res.data.quizzes))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleGenerate = async e => {
    e.preventDefault();
    if (!topic.trim()) return setError('Please enter a topic');
    setError('');
    setGenerating(true);
    try {
      const res = await generateQuiz(topic.trim());
      navigate(`/quiz/${res.data.quizId}`, { state: { quizData: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Please try again.');
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="page">
        <Navbar />
        <div className="loader-wrap">
          <div className="card generating-card fade-in">
            <span className="generating-icon">🤖</span>
            <h2 style={{ fontFamily: 'Syne', fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
              Crafting Your Quiz
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
              AI is generating 20 questions about <strong style={{ color: 'var(--accent)' }}>{topic}</strong>...
            </p>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <main>
        <div className="container">
          {/* Hero */}
          <div className="page-hero fade-in">
            <h1>Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p>What would you like to master today?</p>
          </div>

          {/* Topic generator */}
          <div className="topic-section fade-in-delay-1">
            <div className="topic-card">
              <h3 style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-dim)' }}>
                Generate AI Quiz
              </h3>
              {error && <div className="error-msg">⚠ {error}</div>}
              <form onSubmit={handleGenerate}>
                <div className="topic-input-row">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Quantum Physics, World War II, Python..."
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                    ✦ Generate
                  </button>
                </div>
              </form>

              {/* Suggested topics */}
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Quick pick
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SUGGESTED_TOPICS.map(t => (
                    <button
                      key={t}
                      className="btn btn-outline btn-sm"
                      onClick={() => setTopic(t)}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          {history.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }} className="fade-in-delay-2">
              {[
                { label: 'Quizzes Taken', value: history.length },
                { label: 'Avg Score', value: `${Math.round(history.filter(q => q.score !== null).reduce((acc, q) => acc + (q.score / q.totalQuestions) * 100, 0) / (history.filter(q => q.score !== null).length || 1))}%` },
                { label: 'Best Score', value: `${Math.max(...history.filter(q => q.score !== null).map(q => Math.round((q.score / q.totalQuestions) * 100)), 0)}%` },
              ].map(s => (
                <div key={s.label} className="stat-chip">
                  <span className="stat-chip-value">{s.value}</span>
                  <div className="stat-chip-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="fade-in-delay-2">
            <h2 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: '700' }}>Quiz History</h2>
            {history.length > 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{history.length} attempts</span>
            )}
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }} className="fade-in">
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎯</div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '8px' }}>No quizzes yet</p>
              <p>Generate your first quiz above to get started!</p>
            </div>
          ) : (
            <div className="history-grid fade-in-delay-3">
              {history.map(quiz => {
                const pct = quiz.score !== null ? Math.round((quiz.score / quiz.totalQuestions) * 100) : null;
                return (
                  <div
                    key={quiz._id}
                    className="history-card"
                    onClick={() => quiz.status === 'completed' ? navigate(`/result/${quiz._id}`) : navigate(`/quiz/${quiz._id}`)}
                  >
                    <div className="history-card-meta">
                      <div>
                        <span className={`badge ${quiz.status === 'completed' ? 'badge-green' : 'badge-purple'}`}>
                          {quiz.status === 'completed' ? '✓ Completed' : '● In Progress'}
                        </span>
                      </div>
                      {pct !== null && (
                        <div
                          className="score-ring"
                          style={{ '--pct': `${pct * 3.6}deg`, color: getGradeColor(pct) }}
                        >
                          <span>{pct}%</span>
                        </div>
                      )}
                    </div>

                    <div className="history-card-topic">{quiz.topic}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                      {quiz.status === 'completed' && pct !== null && (
                        <span style={{ color: getGradeColor(pct) }}>{getGradeLabel(pct)}</span>
                      )}
                    </div>

                    {quiz.timeTaken && (
                      <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⏱</span> {formatTime(quiz.timeTaken)} &bull; {quiz.score}/{quiz.totalQuestions} correct
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
