import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <span className="auth-visual-icon"></span>
          <h1 className="auth-visual-title">Welcome Back, Scholar</h1>
          <p className="auth-visual-sub">
            Your AI-powered study companion is ready. Continue where you left off and push your knowledge further.
          </p>
          <div style={{
            marginTop: '48px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.07)',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>How it works</p>
            {['Choose a topic', 'AI generates 20 MCQs', 'Answer & submit', 'See your score instantly'].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', flexShrink: 0
                }}>{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div className="fade-in">
            <div className="badge badge-cyan" style={{ marginBottom: '24px' }}>→ Welcome Back</div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>Sign in</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '36px', fontSize: '15px' }}>Enter your credentials to continue</p>
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="fade-in-delay-1">
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
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Signing in...
                </>
              ) : (
                '→ Sign In'
              )}
            </button>
          </form>

          <div className="auth-link fade-in-delay-2">
            New here? <Link to="/register">Create account →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
