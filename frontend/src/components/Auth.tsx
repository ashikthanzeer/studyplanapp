import React, { useState } from 'react';
import { login, register } from '../api/client';

interface AuthProps {
  onAuthSuccess: (token: string) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await login({ email, password });
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          onAuthSuccess(response.token);
        } else {
          setError('Login failed: no token returned.');
        }
      } else {
        const response = await register({ email, password });
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          onAuthSuccess(response.token);
        } else {
          setError('Registration failed: no token returned.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '20px', padding: '40px 20px' }}>
      <div className="glass-card auth-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {/* Logo Icon */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-glow" style={{ borderRadius: '50%', padding: '6px' }}>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 6v6l4 2" />
          </svg>
          <h2 style={{ fontSize: '28px', marginTop: '12px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isLogin ? 'Sign in to access your study schedules' : 'Sign up to plan your study sessions'}
          </p>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>
            Login
          </div>
          <div className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>
            Register
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-light)', color: 'var(--warning)', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>Email Address</label>
            <input type="email" placeholder="you@example.com" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>Password</label>
            <input type="password" placeholder="••••••••" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>

      {/* Download button for Android */}
      <a 
        href="https://expo.dev/accounts/ashikthanzeer/projects/study-planner/builds/8ec53be2-adb7-438d-8f3a-b9c2809d293f"
        target="_blank"
        rel="noopener noreferrer"
        className="android-download-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.61 15.15c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1-1.1.49-1.1 1.1.49 1.1 1.1 1.1m-9.22 0c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1-1.1.49-1.1 1.1.49 1.1 1.1 1.1m9.67-5.57l1.7-2.95a.365.365 0 0 0-.13-.5.365.365 0 0 0-.5.13l-1.73 3a10.02 10.02 0 0 0-7.8 0l-1.73-3a.365.365 0 0 0-.5-.13.365.365 0 0 0-.13.5l1.7 2.95C5.07 10.96 2.87 13.97 2.87 17.5h18.26c0-3.53-2.2-6.54-5.3-7.92M6.5 22h2v-2h-2zm9 0h2v-2h-2z" />
        </svg>
        <span>Download for Android</span>
      </a>
    </div>
  );
}
