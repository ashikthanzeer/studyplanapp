import React, { useState, useEffect } from 'react';
import {
  getStudentProfile,
  updateStudentProfile,
  getPreferences,
  updatePreferences,
  getSubjects,
  createSubject,
  deleteSubject
} from '../api/client';

interface ProfileSettingsProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentTheme: 'light' | 'dark';
  refreshUserData: () => void;
}

type TabType = 'profile' | 'preferences' | 'subjects';

export default function ProfileSettings({ onThemeChange, currentTheme, refreshUserData }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');

  // Tab 1: Profile State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Tab 2: Preferences State
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  
  // Tab 3: Subjects State
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#aa3bff');

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
    loadSubjects();
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

  async function loadSubjects() {
    try {
      const data = await getSubjects();
      setSubjects(data.subjects || []);
    } catch (e) {
      console.error('Failed to load subjects', e);
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

  // Subject Actions
  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubName.trim()) return;
    try {
      const res = await createSubject({ name: newSubName, color: newSubColor });
      setSubjects([...subjects, res.subject]);
      setNewSubName('');
      flashMessage('Subject added successfully!');
    } catch (err: any) {
      flashError(err.response?.data?.error || 'Failed to add subject.');
    }
  }

  async function handleDeleteSubject(id: number) {
    if (!confirm('Delete subject? Existing tasks will remain but will be unassigned.')) return;
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
      flashMessage('Subject deleted successfully!');
    } catch (err) {
      flashError('Failed to delete subject.');
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
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'flex-start' }} className="dashboard-grid">
        
        {/* Settings Tab Sidebar */}
        <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setActiveTab('profile')}>
            Student Profile
          </div>
          <div className={`sidebar-item ${activeTab === 'preferences' ? 'active' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setActiveTab('preferences')}>
            Study Preferences
          </div>
          <div className={`sidebar-item ${activeTab === 'subjects' ? 'active' : ''}`} style={{ padding: '10px 14px' }} onClick={() => setActiveTab('subjects')}>
            Subject Manager
          </div>
        </div>

        {/* Settings Active View */}
        <div className="glass-card" style={{ padding: '32px' }}>
          
          {/* TAB 1: Profile Settings */}
          {activeTab === 'profile' && (
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

          {/* TAB 3: Subject Management */}
          {activeTab === 'subjects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', textAlign: 'left' }}>
                Subject Manager
              </h3>

              {/* Add Subject Inline Form */}
              <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(120, 120, 120, 0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, minWidth: '180px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Subject Title</label>
                  <input type="text" placeholder="e.g. Organic Chemistry" className="form-input" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '90px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Color Badge</label>
                  <input type="color" className="form-input" style={{ padding: '2px', height: '38px', cursor: 'pointer' }} value={newSubColor} onChange={(e) => setNewSubColor(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ paddingBlock: '10px' }}>
                  Add Subject
                </button>
              </form>

              {/* List of Subjects */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subjects.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No subjects added yet.</p>
                ) : (
                  subjects.map((sub) => (
                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: sub.color || 'var(--primary)' }} />
                        <strong style={{ fontSize: '14px', color: 'var(--text-heading)' }}>{sub.name}</strong>
                      </div>
                      
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--warning)' }} onClick={() => handleDeleteSubject(sub.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
