import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import FocusTimer from './components/FocusTimer';
import SessionHistory from './components/SessionHistory';
import ProfileSettings from './components/ProfileSettings';
import { getUserProfile, getPreferences, getTasks } from './api/client';

type ViewType = 'dashboard' | 'tasks' | 'kanban' | 'timer' | 'history' | 'settings';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation & Theme
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Deep-linking task focus
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState<any | null>(null);

  useEffect(() => {
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  async function loadUserProfile() {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setUser(data.user);
      
      // Load theme preference
      const prefData = await getPreferences();
      if (prefData.preferences?.theme) {
        setTheme(prefData.preferences.theme as 'light' | 'dark');
      }

      // Check upcoming deadlines on login
      checkDeadlineReminders();
    } catch (err) {
      console.error('Failed to load user profile, logging out', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }

  async function checkDeadlineReminders() {
    try {
      const tasksData = await getTasks();
      const allTasks = tasksData.tasks || [];
      const now = new Date();
      
      allTasks.forEach((task: any) => {
        if (task.status === 'done' || !task.due_date) return;
        
        const dueDate = new Date(task.due_date);
        const diffMs = dueDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        if (diffHours > 0 && diffHours <= 1) {
          sendDeadlineNotification(`Urgent: "${task.title}"`, `Due in less than 1 hour!`);
        } else if (diffHours > 0 && diffHours <= 24) {
          sendDeadlineNotification(`Reminder: "${task.title}"`, `Due tomorrow.`);
        }
      });
    } catch (e) {
      console.log('Error checking deadlines:', e);
    }
  }

  function sendDeadlineNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }

  function handleAuthSuccess(newToken: string) {
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('pomodoro_timer_state');
    setToken(null);
    setUser(null);
    setCurrentView('dashboard');
  }

  function handleThemeChange(newTheme: 'light' | 'dark') {
    setTheme(newTheme);
  }

  function handleStartFocusFromCard(task: any) {
    setSelectedTaskForTimer(task);
    setCurrentView('timer');
  }

  // View Router
  function renderActiveView() {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onViewChange={setCurrentView}
            setSelectedTaskForTimer={setSelectedTaskForTimer}
            user={user}
          />
        );
      case 'tasks':
        return <TaskList onStartFocus={handleStartFocusFromCard} />;
      case 'kanban':
        return <KanbanBoard />;
      case 'timer':
        return (
          <FocusTimer
            selectedTask={selectedTaskForTimer}
            clearSelectedTask={() => setSelectedTaskForTimer(null)}
          />
        );
      case 'history':
        return <SessionHistory />;
      case 'settings':
        return (
          <ProfileSettings
            onThemeChange={handleThemeChange}
            currentTheme={theme}
            refreshUserData={loadUserProfile}
          />
        );
      default:
        return <Dashboard onViewChange={setCurrentView} setSelectedTaskForTimer={setSelectedTaskForTimer} user={user} />;
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <svg className="animate-spin-slow" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <div style={{ fontSize: '15px', fontWeight: '600' }}>Initializing planner environment...</div>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Navigation Shell */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Container */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;
