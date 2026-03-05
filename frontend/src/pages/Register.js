import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Visual side */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <span className="auth-visual-icon">🧠</span>
          <h1 className="auth-visual-title">Master Any Subject with AI</h1>
          <p className="auth-visual-sub">
            Generate personalized 20-question MCQ tests on any topic instantly using advanced AI. Track your progress and ace your exams.
          </p>
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['📚 AI-Generated Questions', '⏱️ Timed Challenges', '📊 Instant Score & Analysis'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div className="fade-in">
            <div className="badge badge-purple" style={{ marginBottom: '24px' }}>✦ Get Started</div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>Create account</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '36px', fontSize: '15px' }}>Join thousands of students leveling up with AI</p>
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="fade-in-delay-1">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Creating account...
                </>
              ) : (
                '✦ Create Account'
              )}
            </button>
          </form>

          <div className="auth-link fade-in-delay-2">
            Already have an account? <Link to="/login">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
