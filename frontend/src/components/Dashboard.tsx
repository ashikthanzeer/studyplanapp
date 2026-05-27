import React, { useState, useEffect } from 'react';
import { getTasks, updateTask, getPomodoroStats, getGamification, getGoals, getPomodoroHistory } from '../api/client';

type ViewType = 'dashboard' | 'tasks' | 'subjects' | 'timer' | 'history' | 'settings';

interface DashboardProps {
  onViewChange: (view: ViewType, tab?: 'profile' | 'preferences' | 'goals') => void;
  setSelectedTaskForTimer: (task: any) => void;
  user: any;
}

const ALL_BADGES = [
  '5-Day Streak', '10-Day Streak', '25-Day Streak', '50-Day Streak',
  '75-Day Streak', '100-Day Streak', '150-Day Streak', '200-Day Streak',
  '250-Day Streak', '300-Day Streak',
  '8-Hour Daily Focus', '10-Hour Daily Focus', '12-Hour Daily Focus',
  '14-Hour Daily Focus', '15-Hour Daily Focus'
];

export default function Dashboard({ onViewChange, setSelectedTaskForTimer, user }: DashboardProps) {
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_minutes: 0,
    session_count: 0,
    by_task: [],
    today_hours: 0.0,
    week_hours: 0.0,
    previous_day_hours: 0.0,
    previous_week_hours: 0.0
  });
  const [gamification, setGamification] = useState<any>({
    streak: 0,
    maxStreak: 0,
    badges: [],
    level: 'Bronze',
    totalBadges: 0
  });
  const [loading, setLoading] = useState(true);
  const [goalProgress, setGoalProgress] = useState(0);
  const [dailyGoalHours, setDailyGoalHours] = useState(2);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(10);
  
  const [comparisonModal, setComparisonModal] = useState<'today' | 'week' | null>(null);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    if (comparisonModal) {
      fetchComparisonData(comparisonModal);
    }
  }, [comparisonModal]);

  async function fetchComparisonData(type: 'today' | 'week') {
    setComparisonLoading(true);
    setComparisonData([]);
    try {
      const now = new Date();
      if (type === 'today') {
        // Fetch sessions from past 7 days
        const dateFrom = new Date();
        dateFrom.setDate(now.getDate() - 6);
        dateFrom.setHours(0, 0, 0, 0);
        
        const data = await getPomodoroHistory({ date_from: dateFrom.toISOString().split('T')[0] });
        const sessions = data.sessions || [];
        
        // Group by day for the past 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          const daySessions = sessions.filter((s: any) => 
            s.status === 'completed' && 
            new Date(s.ended_at).toISOString().split('T')[0] === dateStr
          );
          
          const totalMin = daySessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0);
          const hours = parseFloat((totalMin / 60).toFixed(1));
          
          days.push({
            label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            hours,
            isToday: i === 0
          });
        }
        setComparisonData(days);
      } else {
        // Fetch sessions from past 4 weeks (including current week)
        const dateFrom = new Date();
        const day = dateFrom.getDay();
        const diffToMonday = dateFrom.getDate() - day + (day === 0 ? -6 : 1);
        const currentMonday = new Date(dateFrom.setDate(diffToMonday));
        currentMonday.setHours(0, 0, 0, 0);
        
        const fourWeeksAgoMonday = new Date(currentMonday);
        fourWeeksAgoMonday.setDate(currentMonday.getDate() - 21);
        
        const data = await getPomodoroHistory({ date_from: fourWeeksAgoMonday.toISOString().split('T')[0] });
        const sessions = data.sessions || [];
        
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
          const start = new Date(fourWeeksAgoMonday);
          start.setDate(fourWeeksAgoMonday.getDate() + (3 - i) * 7);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          
          const weekSessions = sessions.filter((s: any) => {
            if (s.status !== 'completed') return false;
            const ended = new Date(s.ended_at);
            return ended >= start && ended <= end;
          });
          
          const totalMin = weekSessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0);
          const hours = parseFloat((totalMin / 60).toFixed(1));
          
          weeks.push({
            label: `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            hours,
            isCurrent: i === 0
          });
        }
        setComparisonData(weeks);
      }
    } catch (e) {
      console.error('Failed to load comparison stats', e);
    } finally {
      setComparisonLoading(false);
    }
  }

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
      }

      // Get Goals
      try {
        const goalsData = await getGoals();
        if (goalsData.goals) {
          const daily = goalsData.goals.find((g: any) => g.period === 'daily');
          if (daily) setDailyGoalHours(parseFloat(daily.target_hours));
          const weekly = goalsData.goals.find((g: any) => g.period === 'weekly');
          if (weekly) setWeeklyGoalHours(parseFloat(weekly.target_hours));
        }
      } catch (err) {
        console.error('Failed to load goals', err);
      }

      // Get Gamification data
      try {
        const gamificationData = await getGamification();
        setGamification(gamificationData);
      } catch (err) {
        console.error('Failed to load gamification stats', err);
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

  function renderComparisonModal() {
    if (!comparisonModal) return null;

    const title = comparisonModal === 'today' ? 'Past 7 Days Focus' : 'Past 4 Weeks Focus';
    const goalText = comparisonModal === 'today' 
      ? `Daily Goal: ${dailyGoalHours} hours` 
      : `Weekly Goal: ${weeklyGoalHours} hours`;
    
    const targetHours = comparisonModal === 'today' ? dailyGoalHours : weeklyGoalHours;
    const maxVal = Math.max(...comparisonData.map(d => d.hours), targetHours, 1);

    return (
      <div className="modal-overlay" onClick={() => setComparisonModal(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{title}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{goalText}</span>
            </div>
            <button className="btn btn-secondary btn-icon" onClick={() => setComparisonModal(null)} style={{ padding: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '12px 0' }}>
            {comparisonLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading focus history...
              </div>
            ) : (
              comparisonData.map((item, idx) => {
                const percentage = (item.hours / maxVal) * 100;
                const isGoalAchieved = item.hours >= targetHours;
                const activeColor = comparisonModal === 'today' ? 'var(--success)' : 'var(--primary)';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: item.isToday || item.isCurrent ? '700' : '500', color: item.isToday || item.isCurrent ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                        {item.label} {(item.isToday || item.isCurrent) && ' (Current)'}
                      </span>
                      <strong style={{ color: isGoalAchieved ? activeColor : 'var(--text-heading)' }}>
                        {item.hours} hrs {isGoalAchieved && '🎯'}
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '14px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percentage}%`, background: isGoalAchieved ? `linear-gradient(90deg, ${activeColor}, hsl(var(--primary-hue), 85%, 70%))` : 'var(--text-muted)', borderRadius: '6px', transition: 'width 0.5s ease-out' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => setComparisonModal(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {renderComparisonModal()}
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary-light), rgba(255,255,255,0))', borderLeft: '5px solid var(--primary)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flexGrow: 1, minWidth: '250px' }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 8px', textAlign: 'left', fontWeight: '800' }}>
            Hey, {user?.name || 'Explorer'}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', textAlign: 'left' }}>
            It's {todayDateStr}. Ready to hit your focus goals today?
          </p>
        </div>
        
        {/* Streak & Level badges */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Level Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-light)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '22px' }}>🏆</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>Rank Level</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>{gamification.level}</div>
            </div>
          </div>

          {/* Streak Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="coral" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse-glow" style={{ animationDuration: '1.5s' }}>
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'coral', fontWeight: '700', textTransform: 'uppercase' }}>Streak</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>{gamification.streak} Days</div>
            </div>
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

        {/* Focus Timer quick start */}
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

        {/* Productivity Analytics Goals */}
        <div className="glass-card widget-small widget-card" style={{ gap: '12px', cursor: 'pointer' }} onClick={() => onViewChange('settings', 'goals')}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '16px' }}>Productivity Goals</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Focus hours progress this week</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '500' }}>Weekly Focus Target</span>
                <strong style={{ color: 'var(--primary)' }}>
                  {stats.week_hours || 0} / {weeklyGoalHours} Hours
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(((stats.week_hours || 0) / weeklyGoalHours) * 100, 100)}%`, background: 'var(--primary)', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '500' }}>Daily Focus Target</span>
                <strong style={{ color: 'var(--accent)' }}>
                  {stats.today_hours || 0} / {dailyGoalHours} Hours
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(((stats.today_hours || 0) / dailyGoalHours) * 100, 100)}%`, background: 'var(--accent)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Focus Hours Card */}
        <div className="glass-card widget-small widget-card" style={{ background: 'linear-gradient(135deg, var(--success-light), rgba(255,255,255,0))', borderLeft: '4px solid var(--success)', gap: '10px', cursor: 'pointer' }} onClick={() => setComparisonModal('today')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)', textTransform: 'uppercase' }}>Focus Today</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-heading)' }}>
              {stats.today_hours || 0.0} hrs
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {(() => {
                const diff = (stats.today_hours || 0) - (stats.previous_day_hours || 0);
                if (diff > 0) return <span style={{ color: 'var(--success)' }}>+{diff.toFixed(1)} hrs</span>;
                if (diff < 0) return <span style={{ color: 'var(--warning)' }}>{diff.toFixed(1)} hrs</span>;
                return 'same';
              })()} vs yesterday
            </div>
          </div>
        </div>

        {/* Weekly Focus Hours Card */}
        <div className="glass-card widget-small widget-card" style={{ background: 'linear-gradient(135deg, var(--primary-light), rgba(255,255,255,0))', borderLeft: '4px solid var(--primary)', gap: '10px', cursor: 'pointer' }} onClick={() => setComparisonModal('week')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>Focus This Week</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-heading)' }}>
              {stats.week_hours || 0.0} hrs
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {(() => {
                const diff = (stats.week_hours || 0) - (stats.previous_week_hours || 0);
                if (diff > 0) return <span style={{ color: 'var(--primary)' }}>+{diff.toFixed(1)} hrs</span>;
                if (diff < 0) return <span style={{ color: 'var(--warning)' }}>{diff.toFixed(1)} hrs</span>;
                return 'same';
              })()} vs last week
            </div>
          </div>
        </div>

      </div>

      {/* Badges Gallery Widget */}
      <div className="glass-card" style={{ padding: '28px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>🏆</span> Earned Badges & Trophies
          <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '11px', textTransform: 'none' }}>
            {gamification.totalBadges} Badges Earned
          </span>
        </h3>
        
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {ALL_BADGES.map((badgeName, index) => {
              const userBadge = gamification.badges.find((b: any) => b.badge_name === badgeName);
              const isEarned = !!userBadge;
              const isStreak = badgeName.includes('Streak');
              const isHours = badgeName.includes('Hour');
              let badgeEmoji = '⭐';
              if (isStreak) badgeEmoji = '🔥';
              else if (isHours) badgeEmoji = '⚡';

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '110px',
                    padding: '16px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: isEarned ? 'rgba(255,255,255,0.02)' : 'rgba(150,150,150,0.05)',
                    border: isEarned ? '1px solid var(--border)' : '1px dashed var(--border)',
                    position: 'relative',
                    opacity: isEarned ? 1 : 0.5,
                    filter: isEarned ? 'none' : 'grayscale(100%)',
                    transition: 'var(--transition-smooth)'
                  }}
                  title={isEarned ? `Earned on ${new Date(userBadge.last_earned_at).toLocaleDateString()}` : 'Locked'}
                >
                  {!isEarned && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0.7, fontSize: '12px' }}>
                      🔒
                    </div>
                  )}
                  <div style={{ fontSize: '32px', marginBottom: '8px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                    {badgeEmoji}
                  </div>
                  
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-heading)', textAlign: 'center', wordBreak: 'break-word', display: 'block', lineHeight: '1.3' }}>
                    {badgeName}
                  </span>
                  
                  {isEarned && userBadge.count > 1 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '9.5px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      x{userBadge.count}
                    </span>
                  )}
                </div>
              );
            })}
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

        <button className="btn btn-secondary" onClick={() => onViewChange('subjects')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
          </svg>
          Manage Subjects
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
