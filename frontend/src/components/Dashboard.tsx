import React, { useState, useEffect } from 'react';
import { getTasks, updateTask, getPomodoroStats } from '../api/client';

type ViewType = 'dashboard' | 'tasks' | 'kanban' | 'timer' | 'history' | 'settings';

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
  setSelectedTaskForTimer: (task: any) => void;
  user: any;
}

export default function Dashboard({ onViewChange, setSelectedTaskForTimer, user }: DashboardProps) {
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_minutes: 0, session_count: 0, by_task: [] });
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0); // Mock streak or calculated from localStorage
  const [goalProgress, setGoalProgress] = useState(70); // Mock weekly goal progress percentage

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Get today's/overdue tasks
      const tasksData = await getTasks();
      const allTasks = tasksData.tasks || [];
      const todayStr = new Date().toISOString().split('T')[0];
      
      const filtered = allTasks.filter((task: any) => {
        if (task.status === 'done') return false;
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date).toISOString().split('T')[0];
        return taskDate <= todayStr; // today or overdue
      });
      
      // Sort: overdue first, then by priority (high -> medium -> low)
      filtered.sort((a: any, b: any) => {
        const dateA = a.due_date || '';
        const dateB = b.due_date || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        const priorities: Record<string, number> = { high: 3, medium: 2, low: 1 };
        return (priorities[b.priority] || 0) - (priorities[a.priority] || 0);
      });
      
      setTodayTasks(filtered.slice(0, 5)); // show top 5 tasks

      // Get Pomodoro Stats
      const statsData = await getPomodoroStats();
      if (statsData.stats) {
        setStats(statsData.stats);
        if (typeof statsData.stats.streak === 'number') {
          setStreak(statsData.stats.streak);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTaskComplete(task: any) {
    try {
      await updateTask(task.id, { ...task, status: 'done' });
      setTodayTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  }

  function handleQuickStart(task?: any) {
    if (task) {
      setSelectedTaskForTimer(task);
    }
    onViewChange('timer');
  }

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-light), rgba(255,255,255,0))', borderLeft: '5px solid var(--primary)', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px', textAlign: 'left', fontWeight: '800' }}>
            Hey, {user?.name || 'Explorer'}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', textAlign: 'left' }}>
            It's {todayDateStr}. Ready to hit your focus goals today?
          </p>
        </div>
        
        {/* Streak Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="coral" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-glow" style={{ animationDuration: '1.5s' }}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: 'coral', fontWeight: '700', textTransform: 'uppercase' }}>Study Streak</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-heading)' }}>{streak} Days Active</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Today's Focus List */}
        <div className="glass-card widget-large widget-card">
          <div className="widget-header">
            <h3>Today's Focus List</h3>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => onViewChange('tasks')}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>Loading tasks...</div>
            ) : todayTasks.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(120, 120, 120, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '14px' }}>No focus tasks due today!</p>
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => onViewChange('tasks')}>
                  Add New Task
                </button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', transition: 'var(--transition-smooth)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexGrow: 1, minWidth: 0 }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }} onChange={() => toggleTaskComplete(task)} />
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-heading)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </strong>
                      <span style={{ fontSize: '11px', color: task.priority === 'high' ? 'var(--warning)' : 'var(--text-muted)', fontWeight: '600' }}>
                        {task.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--warning)', background: 'var(--warning-light)', padding: '3px 8px', borderRadius: '4px', fontWeight: '500' }}>
                      Overdue
                    </span>
                    <button className="btn btn-primary btn-icon" style={{ padding: '6px' }} onClick={() => handleQuickStart(task)} title="Start Pomodoro focus session">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pomodoro Quick Start Widget */}
        <div className="glass-card widget-small widget-card" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(to bottom, rgba(168,85,247,0.03), rgba(255,255,255,0))' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="264" strokeDashoffset={264 - (264 * goalProgress) / 100} strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-heading)' }}>
              25m
            </div>
          </div>
          
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Focus Timer</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '180px', marginBottom: '12px' }}>
            Start a 25-minute Pomodoro focus session right now.
          </p>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }} onClick={() => handleQuickStart()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Session
          </button>
        </div>

        {/* Productivity Analytics Cards */}
        <div className="glass-card widget-small widget-card" style={{ gap: '12px' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '16px' }}>Productivity Goals</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Focus hours progress this week</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '500' }}>Study Duration Goal</span>
                <strong style={{ color: 'var(--primary)' }}>
                  {Math.round((stats.total_minutes || 0) / 60)} / 10 Hours
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(((stats.total_minutes || 0) / 600) * 100, 100)}%`, background: 'var(--primary)', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '500' }}>Focus Sessions Target</span>
                <strong style={{ color: 'var(--accent)' }}>
                  {stats.session_count || 0} / 24 Sessions
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(((stats.session_count || 0) / 24) * 100, 100)}%`, background: 'var(--accent)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Total Time Tracked Card */}
        <div className="glass-card widget-small widget-card" style={{ background: 'linear-gradient(135deg, var(--accent-light), rgba(255,255,255,0))', borderLeft: '4px solid var(--accent)', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase' }}>Focus Duration</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-heading)' }}>
              {stats.total_minutes || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>total minutes focus time logged</div>
          </div>
        </div>

        {/* Sessions Completed Card */}
        <div className="glass-card widget-small widget-card" style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(255,255,255,0))', borderLeft: '4px solid var(--primary)', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>Sessions</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-heading)' }}>
              {stats.session_count || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>completed Pomodoro sessions</div>
          </div>
        </div>

      </div>

      {/* Quick Actions Shortcuts */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => onViewChange('tasks')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Manage Tasks
        </button>
        <button className="btn btn-secondary" onClick={() => onViewChange('kanban')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5v5h16zM5 12v5h16v-5H5z" />
          </svg>
          Kanban Board
        </button>
        <button className="btn btn-secondary" onClick={() => onViewChange('history')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M3 20h9M3 4h18" />
            <path d="M3 8h12M3 12h12M3 16h18" />
          </svg>
          Session History
        </button>
      </div>
    </div>
  );
}
