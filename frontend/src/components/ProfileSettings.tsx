import React, { useState, useEffect } from 'react';
import {
  getStudentProfile,
  updateStudentProfile,
  getPreferences,
  updatePreferences,
  getGoals,
  updateGoals,
  requestEmailChange,
  confirmEmailChange,
  requestPasswordChange,
  confirmPasswordChange
} from '../api/client';

interface ProfileSettingsProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentTheme: 'light' | 'dark';
  refreshUserData: () => void;
  initialTab?: TabType;
}

type TabType = 'profile' | 'preferences' | 'goals';

export default function ProfileSettings({ onThemeChange, currentTheme, refreshUserData, initialTab }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'profile');
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');

  // Tab 1: Profile State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Tab 1: Account Credentials States
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState<'idle' | 'otp'>('idle');

  const [passwordOtp, setPasswordOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStep, setPasswordStep] = useState<'idle' | 'otp'>('idle');
  
  // Tab 2: Preferences State
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  // Tab 3: Goals State
  const [dailyGoalHours, setDailyGoalHours] = useState(2);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(10);
  const [dailyGoalId, setDailyGoalId] = useState<number | undefined>(undefined);
  const [weeklyGoalId, setWeeklyGoalId] = useState<number | undefined>(undefined);

  // Avatar Options
  const avatars = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Jack',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Luna'
  ];

  useEffect(() => {
    loadProfile();
    loadPreferences();
    loadGoals();
  }, []);

  async function loadProfile() {
    try {
      const data = await getStudentProfile();
      if (data.profile) {
        setName(data.profile.name || '');
        setBio(data.profile.bio || '');
        setAvatarUrl(data.profile.avatar_url || '');
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  }

  async function loadPreferences() {
    try {
      const data = await getPreferences();
      if (data.preferences) {
        const p = data.preferences;
        setPomodoroDuration(p.pomodoro_duration || 25);
        setBreakDuration(p.break_duration || 5);
        setNotificationsEnabled(p.notification_enabled !== false);
        setQuietHoursStart(p.quiet_hours_start ? p.quiet_hours_start.slice(0, 5) : '22:00');
        setQuietHoursEnd(p.quiet_hours_end ? p.quiet_hours_end.slice(0, 5) : '08:00');
      }
    } catch (e) {
      console.error('Failed to load preferences', e);
    }
  }

  async function loadGoals() {
    try {
      const data = await getGoals();
      if (data.goals) {
        const daily = data.goals.find((g: any) => g.period === 'daily');
        if (daily) {
          setDailyGoalHours(daily.target_hours);
          setDailyGoalId(daily.id);
        }
        const weekly = data.goals.find((g: any) => g.period === 'weekly');
        if (weekly) {
          setWeeklyGoalHours(weekly.target_hours);
          setWeeklyGoalId(weekly.id);
        }
      }
    } catch (e) {
      console.error('Failed to load goals', e);
    }
  }

  function flashMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  }

  function flashError(msg: string) {
    setErrMessage(msg);
    setTimeout(() => setErrMessage(''), 4000);
  }

  // Profile Save
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStudentProfile({ name, bio, avatar_url: avatarUrl });
      flashMessage('Profile saved successfully!');
      refreshUserData();
    } catch (err) {
      flashError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  }

  // Email change handlers
  async function handleEmailChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    const normalizedNewEmail = newEmail.toLowerCase().trim();
    if (!normalizedNewEmail) return;
    setLoading(true);
    try {
      const res = await requestEmailChange({ newEmail: normalizedNewEmail });
      flashMessage(res.message || 'Verification code sent to your new email.');
      setEmailStep('otp');
    } catch (err: any) {
      flashError(err.response?.data?.error || 'Failed to request email change.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailChangeConfirm(e: React.FormEvent) {
    e.preventDefault();
    const normalizedNewEmail = newEmail.toLowerCase().trim();
    if (!emailOtp || !normalizedNewEmail) return;
    setLoading(true);
    try {
      const res = await confirmEmailChange({ code: emailOtp, newEmail: normalizedNewEmail });
      flashMessage(res.message || 'Email updated successfully!');
      setEmailStep('idle');
      setNewEmail('');
      setEmailOtp('');
      refreshUserData();
    } catch (err: any) {
      flashError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  // Password change handlers
  async function handlePasswordChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordChange();
      flashMessage(res.message || 'Verification code sent to your current email.');
      setPasswordStep('otp');
    } catch (err: any) {
      flashError(err.response?.data?.error || 'Failed to request password change.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChangeConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordOtp || !newPassword) return;
    if (newPassword.length < 8) {
      flashError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      const res = await confirmPasswordChange({ code: passwordOtp, newPassword });
      flashMessage(res.message || 'Password updated successfully!');
      setPasswordStep('idle');
      setNewPassword('');
      setPasswordOtp('');
    } catch (err: any) {
      flashError(err.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  // Preferences Save
  async function handlePreferencesSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePreferences({
        pomodoro_duration: pomodoroDuration,
        break_duration: breakDuration,
        notification_enabled: notificationsEnabled,
        quiet_hours_start: quietHoursStart,
        quiet_hours_end: quietHoursEnd
      });
      flashMessage('Preferences updated successfully!');
    } catch (err) {
      flashError('Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  }

  // Goals Save
  async function handleGoalsSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const goalsPayload = [
        { id: dailyGoalId, period: 'daily', target_hours: dailyGoalHours, title: 'Daily Target' },
        { id: weeklyGoalId, period: 'weekly', target_hours: weeklyGoalHours, title: 'Weekly Target' }
      ];
      const data = await updateGoals({ goals: goalsPayload });
      
      // Update IDs in case they were newly created
      if (data.goals) {
        const daily = data.goals.find((g: any) => g.period === 'daily');
        if (daily) setDailyGoalId(daily.id);
        const weekly = data.goals.find((g: any) => g.period === 'weekly');
        if (weekly) setWeeklyGoalId(weekly.id);
      }
      
      flashMessage('Goals updated successfully!');
    } catch (err) {
      flashError('Failed to save goals.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Control Center</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Customize your account, theme, and study preferences</p>
      </div>

      {/* Save Messages */}
      {message && (
        <div style={{ padding: '10px 18px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600' }}>
          {message}
        </div>
      )}
      {errMessage && (
        <div style={{ padding: '10px 18px', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600' }}>
          {errMessage}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="settings-grid">
        
        {/* Settings Tab Sidebar */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setActiveTab('profile')}>
            Student Profile
          </div>
          <div className={`sidebar-item ${activeTab === 'preferences' ? 'active' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setActiveTab('preferences')}>
            Study Preferences
          </div>
          <div className={`sidebar-item ${activeTab === 'goals' ? 'active' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setActiveTab('goals')}>
            Productivity Goals
          </div>
        </div>

        {/* Settings Active View */}
        <div className="glass-card" style={{ padding: '32px' }}>
          
          {/* TAB 1: Profile Settings */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', textAlign: 'left' }}>
                  Profile Information
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Choose Avatar</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {avatars.map((url, idx) => (
                      <img key={idx} src={url} alt="Avatar option" onClick={() => setAvatarUrl(url)} style={{ width: '48px', height: '48px', borderRadius: '50%', border: avatarUrl === url ? '3px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', transition: '0.2s', padding: '2px', background: 'rgba(0,0,0,0.02)' }} />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Display Name</label>
                  <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Bio / Description</label>
                  <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="University of California, Biology Major..." />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={loading}>
                  Save Changes
                </button>
              </form>

              <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '10px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', textAlign: 'left' }}>
                  Account Credentials
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', flexWrap: 'wrap' }} className="credentials-settings-grid">
                  {/* Change Email Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)' }}>Change Email Address</h4>
                    {emailStep === 'idle' ? (
                      <form onSubmit={handleEmailChangeRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="Enter new email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} disabled={loading}>
                          Request Email Change
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleEmailChangeConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enter the code sent to {newEmail}:</p>
                        <input
                          type="text"
                          maxLength={6}
                          className="form-input"
                          placeholder="Verification Code"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn btn-primary" style={{ flex: '1', padding: '8px' }} disabled={loading}>
                            Confirm
                          </button>
                          <button type="button" className="btn btn-secondary" style={{ flex: '1', padding: '8px' }} onClick={() => { setEmailStep('idle'); setEmailOtp(''); }} disabled={loading}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Change Password Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)' }}>Change Password</h4>
                    {passwordStep === 'idle' ? (
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          Request an OTP verification code to reset your account password.
                        </p>
                        <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', width: '100%' }} onClick={handlePasswordChangeRequest} disabled={loading}>
                          Request Password Reset
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordChangeConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enter the code sent to your registered email:</p>
                        <input
                          type="text"
                          maxLength={6}
                          className="form-input"
                          placeholder="Verification Code"
                          value={passwordOtp}
                          onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn btn-primary" style={{ flex: '1', padding: '8px' }} disabled={loading}>
                            Confirm
                          </button>
                          <button type="button" className="btn btn-secondary" style={{ flex: '1', padding: '8px' }} onClick={() => { setPasswordStep('idle'); setPasswordOtp(''); setNewPassword(''); }} disabled={loading}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Preferences Settings */}
          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', textAlign: 'left' }}>
                Study Intervals & UI Theme
              </h3>

              {/* Theme Settings */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)' }}>Application Theme</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Switch interface color mode</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--border)', padding: '4px', borderRadius: '8px' }}>
                  <button type="button" className={`btn ${currentTheme === 'light' ? 'btn-primary' : ''}`} style={{ padding: '6px 12px', fontSize: '12px', background: currentTheme === 'light' ? 'var(--primary)' : 'transparent', color: currentTheme === 'light' ? '#fff' : 'var(--text-main)', boxShadow: 'none' }} onClick={() => onThemeChange('light')}>
                    Light Mode
                  </button>
                  <button type="button" className={`btn ${currentTheme === 'dark' ? 'btn-primary' : ''}`} style={{ padding: '6px 12px', fontSize: '12px', background: currentTheme === 'dark' ? 'var(--primary)' : 'transparent', color: currentTheme === 'dark' ? '#fff' : 'var(--text-main)', boxShadow: 'none' }} onClick={() => onThemeChange('dark')}>
                    Dark Mode
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Default Focus Length (mins)</label>
                  <input type="number" min="5" max="60" className="form-input" value={pomodoroDuration} onChange={(e) => setPomodoroDuration(parseInt(e.target.value) || 25)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Default Break Length (mins)</label>
                  <input type="number" min="1" max="30" className="form-input" value={breakDuration} onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)} />
                </div>
              </div>

              {/* Quiet Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Quiet Hours Start</label>
                  <input type="time" className="form-input" value={quietHoursStart} onChange={(e) => setQuietHoursStart(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Quiet Hours End</label>
                  <input type="time" className="form-input" value={quietHoursEnd} onChange={(e) => setQuietHoursEnd(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)' }}>Browser Notifications</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send timer ending signals in background</p>
                </div>
                <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={loading}>
                Save Preferences
              </button>
            </form>
          )}

          {/* TAB 3: Goals Settings */}
          {activeTab === 'goals' && (
            <form onSubmit={handleGoalsSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', textAlign: 'left' }}>
                Study Goals
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Daily Target (hours)</label>
                <input type="number" min="0.5" max="24" step="0.5" className="form-input" value={dailyGoalHours} onChange={(e) => setDailyGoalHours(parseFloat(e.target.value) || 2)} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Weekly Target (hours)</label>
                <input type="number" min="1" max="168" step="1" className="form-input" value={weeklyGoalHours} onChange={(e) => setWeeklyGoalHours(parseFloat(e.target.value) || 10)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={loading}>
                Save Goals
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
