import React, { useState } from 'react';
import { login, register, forgotPassword, resetPassword } from '../api/client';

interface AuthProps {
  onAuthSuccess: (token: string) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail || !password) {
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
        const response = await login({ email: normalizedEmail, password });
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          onAuthSuccess(response.token);
        } else {
          setError('Login failed: no token returned.');
        }
      } else {
        const response = await register({ email: normalizedEmail, password });
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

  async function handleForgotPasswordRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const normalizedForgotEmail = forgotEmail.toLowerCase().trim();
    if (!normalizedForgotEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: normalizedForgotEmail });
      setMessage(res.message || 'OTP verification code sent to your email.');
      setForgotStep('reset');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const normalizedForgotEmail = forgotEmail.toLowerCase().trim();
    if (!normalizedForgotEmail || !otpCode || !newPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email: normalizedForgotEmail, code: otpCode, newPassword });
      setMessage(res.message || 'Password reset successfully! You can now log in.');
      // Return to login state
      setShowForgot(false);
      setForgotStep('request');
      setEmail(normalizedForgotEmail);
      setIsLogin(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to reset password. Please verify your OTP code.');
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
          <h2 style={{ fontSize: '28px', marginTop: '12px' }}>
            {showForgot ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
            {showForgot 
              ? 'Follow the steps to recover your account'
              : isLogin ? 'Sign in to access your study schedules' : 'Sign up to plan your study sessions'}
          </p>
        </div>

        {!showForgot && (
          <div className="auth-tabs">
            <div className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}>
              Login
            </div>
            <div className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}>
              Register
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-light)', color: 'var(--warning)', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '14px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '500' }}>
            {message}
          </div>
        )}

        {showForgot ? (
          forgotStep === 'request' ? (
            <form onSubmit={handleForgotPasswordRequest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>Registered Email</label>
                <input type="email" placeholder="you@example.com" className="form-input" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                {loading ? 'Requesting...' : 'Send Verification Code'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px' }} onClick={() => { setShowForgot(false); setError(''); setMessage(''); }}>
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>Verification Code (OTP)</label>
                <input type="text" maxLength={6} placeholder="Enter 6-digit code" className="form-input" style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>New Password</label>
                <input type="password" placeholder="••••••••" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Change Password'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }} onClick={() => { setForgotStep('request'); setError(''); setMessage(''); }}>
                  Change Email
                </button>
                <button type="button" className="btn-link" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px' }} onClick={() => { setShowForgot(false); setForgotStep('request'); setError(''); setMessage(''); }}>
                  Back to Login
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>Email Address</label>
              <input type="email" placeholder="you@example.com" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>Password</label>
                {isLogin && (
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', padding: 0 }} onClick={() => { setShowForgot(true); setForgotEmail(email); setError(''); setMessage(''); }}>
                    Forgot Password?
                  </button>
                )}
              </div>
              <input type="password" placeholder="••••••••" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>

      {/* Download button for Android */}
      <a 
        href="/download"
        download="study-planner.apk"
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
