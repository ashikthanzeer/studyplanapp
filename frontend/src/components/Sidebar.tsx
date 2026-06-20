import React from 'react';

type ViewType = 'dashboard' | 'tasks' | 'subjects' | 'timer' | 'history' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType, tab?: 'profile' | 'preferences' | 'goals') => void;
  user: any;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentView, onViewChange, user, onLogout, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as ViewType,
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    },
    {
      id: 'tasks' as ViewType,
      label: 'Tasks',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },

    {
      id: 'subjects' as ViewType,
      label: 'Subjects',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
        </svg>
      )
    },
    {
      id: 'timer' as ViewType,
      label: 'Focus Timer',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      id: 'history' as ViewType,
      label: 'History',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <polyline points="3 3 3 8 8 8" />
          <line x1="12" y1="7" x2="12" y2="12" />
          <line x1="12" y1="12" x2="16" y2="14" />
        </svg>
      )
    },
    {
      id: 'settings' as ViewType,
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.5 1z" />
        </svg>
      )
    }
  ];

  // Helper to get initials
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST';

  return (
    <>
      {/* Desktop Sidebar Nav */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="sidebar-logo-container">
            <div className="sidebar-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>StudyPlanner</span>
            </div>
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close navigation menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <nav>
            <ul className="sidebar-menu">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <div className={`sidebar-item ${currentView === item.id ? 'active' : ''}`} onClick={() => onViewChange(item.id)}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Download button for Android */}
          <a 
            href="/download"
            download="study-planner.apk"
            className="android-download-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.61 15.15c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1-1.1.49-1.1 1.1.49 1.1 1.1 1.1m-9.22 0c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1-1.1.49-1.1 1.1.49 1.1 1.1 1.1m9.67-5.57l1.7-2.95a.365.365 0 0 0-.13-.5.365.365 0 0 0-.5.13l-1.73 3a10.02 10.02 0 0 0-7.8 0l-1.73-3a.365.365 0 0 0-.5-.13.365.365 0 0 0-.13.5l1.7 2.95C5.07 10.96 2.87 13.97 2.87 17.5h18.26c0-3.53-2.2-6.54-5.3-7.92M6.5 22h2v-2h-2zm9 0h2v-2h-2z" />
            </svg>
            <span>Download for Android</span>
          </a>

          <div className="sidebar-profile" style={{ cursor: 'pointer' }} onClick={() => onViewChange('settings', 'profile')}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar">{initials}</div>
            )}
            <div className="profile-info">
              <div className="profile-name">{user?.name || 'Student'}</div>
              <div className="profile-role">{user?.email || 'User'}</div>
            </div>
          </div>
          
          <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px', width: '100%' }} onClick={onLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {menuItems.map((item) => (
          <div key={item.id} className={`mobile-nav-item ${currentView === item.id ? 'active' : ''}`} onClick={() => onViewChange(item.id)}>
            {item.icon}
            <span style={{ fontSize: '10px' }}>{item.label.split(' ')[0]}</span>
          </div>
        ))}
      </nav>
    </>
  );
}
