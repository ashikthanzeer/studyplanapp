import React, { useState, useEffect } from 'react';
import { verifyEmail, resendVerification } from '../api/client';

interface EmailVerificationProps {
  userEmail: string;
  onVerificationSuccess: () => void;
  onLogout: () => void;
}

export default function EmailVerification({ userEmail, onVerificationSuccess, onLogout }: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmail({ code });
      if (res.is_verified) {
        onVerificationSuccess();
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await resendVerification();
      setMessage(res.message || 'A new verification code has been sent to your email.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to resend code. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '20px', padding: '40px 20px', backgroundColor: 'var(--bg-app)' }}>
      <div className="glass-card auth-card" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-glow" style={{ borderRadius: '50%', padding: '6px' }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <h2 style={{ fontSize: '26px' }}>Verify Your Email</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', lineHeight: '1.5', marginTop: '4px' }}>
            We've sent a 6-digit verification code to <br />
            <strong style={{ color: 'var(--text-heading)' }}>{userEmail}</strong>.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-light)', color: 'var(--warning)', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '14px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '500', marginBottom: '16px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'center' }}>
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="0 0 0 0 0 0"
              className="form-input"
              style={{
                textAlign: 'center',
                letterSpacing: '8px',
                fontSize: '24px',
                fontWeight: 'bold',
                padding: '12px',
              }}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-link"
              style={{
                background: 'none',
                border: 'none',
                color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                cursor: cooldown > 0 ? 'default' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
            >
              {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
            </button>

            <button
              type="button"
              className="btn-link"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={onLogout}
            >
              Log Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
