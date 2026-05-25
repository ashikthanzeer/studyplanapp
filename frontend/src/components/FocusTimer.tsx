import React, { useState, useEffect, useRef } from 'react';
import {
  startPomodoroSession,
  completePomodoroSession,
  abandonPomodoroSession,
  getTasks,
  getPreferences
} from '../api/client';

interface FocusTimerProps {
  selectedTask?: any;
  clearSelectedTask?: () => void;
  onSessionComplete?: () => void;
}

type TimerMode = 'focus' | 'short_break' | 'long_break';

export default function FocusTimer({ selectedTask, clearSelectedTask, onSessionComplete }: FocusTimerProps) {
  // Configs (default preferences)
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [longBreakLength, setLongBreakLength] = useState(15);
  
  // Timer States
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [focusCount, setFocusCount] = useState(0); // count focus sessions to trigger long break
  
  // Task Association
  const [tasks, setTasks] = useState<any[]>([]);
  const [associatedTaskId, setAssociatedTaskId] = useState<string>('');
  
  // Audio alarm reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadPreferences();
    loadTasks();
    restoreTimerState();
    
    // Create audio notification
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav'); // soft digital chime
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Sync prop selectedTask
  useEffect(() => {
    if (selectedTask) {
      setAssociatedTaskId(selectedTask.id.toString());
      setMode('focus');
      const seconds = focusLength * 60;
      setTimeLeft(seconds);
      setTotalDuration(seconds);
      setIsActive(false);
      setIsPaused(false);
    }
  }, [selectedTask, focusLength]);

  async function loadPreferences() {
    try {
      const data = await getPreferences();
      if (data.preferences) {
        const p = data.preferences;
        setFocusLength(p.pomodoro_duration || 25);
        setBreakLength(p.break_duration || 5);
        // Default values if not in preferences
        setTimeLeft((p.pomodoro_duration || 25) * 60);
        setTotalDuration((p.pomodoro_duration || 25) * 60);
      }
    } catch (err) {
      console.error('Failed to load user preferences', err);
    }
  }

  async function loadTasks() {
    try {
      const data = await getTasks();
      const allTasks = data.tasks || [];
      setTasks(allTasks.filter((t: any) => t.status !== 'done'));
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  }

  // Restore state from LocalStorage on mount
  function restoreTimerState() {
    const saved = localStorage.getItem('pomodoro_timer_state');
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - state.timestamp) / 1000);
      
      setMode(state.mode);
      setFocusCount(state.focusCount || 0);
      setAssociatedTaskId(state.associatedTaskId || '');
      setSessionId(state.sessionId || null);

      if (state.isActive && !state.isPaused) {
        const remaining = state.timeLeft - elapsedSeconds;
        if (remaining > 0) {
          setTimeLeft(remaining);
          setTotalDuration(state.totalDuration);
          setIsActive(true);
          setIsPaused(false);
          startTimerLoop(remaining, state.totalDuration);
        } else {
          // Timer finished while tab was closed
          setTimeLeft(0);
          setTotalDuration(state.totalDuration);
          handleTimerComplete(state.mode, state.sessionId, state.focusCount);
        }
      } else {
        setTimeLeft(state.timeLeft);
        setTotalDuration(state.totalDuration);
        setIsActive(state.isActive);
        setIsPaused(state.isPaused);
      }
    } catch (e) {
      console.error('Failed to restore timer state', e);
    }
  }

  // Save state to LocalStorage
  function saveTimerState(timeLeftValue: number, active: boolean, paused: boolean, sessId: number | null) {
    const state = {
      mode,
      timeLeft: timeLeftValue,
      totalDuration,
      isActive: active,
      isPaused: paused,
      sessionId: sessId,
      focusCount,
      associatedTaskId,
      timestamp: Date.now()
    };
    localStorage.setItem('pomodoro_timer_state', JSON.stringify(state));
  }

  function clearTimerState() {
    localStorage.removeItem('pomodoro_timer_state');
  }

  // Request Notification Permissions
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Send Notification
  async function sendNotification(title: string, body: string) {
    // Check quiet hours
    try {
      const prefData = await getPreferences();
      const p = prefData.preferences;
      if (p && p.quiet_hours_start && p.quiet_hours_end) {
        const now = new Date();
        const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const start = p.quiet_hours_start.slice(0, 5);
        const end = p.quiet_hours_end.slice(0, 5);
        
        let isQuiet = false;
        if (start < end) {
          isQuiet = currentTimeStr >= start && currentTimeStr <= end;
        } else {
          // quiet hours span across midnight (e.g. 22:00 to 08:00)
          isQuiet = currentTimeStr >= start || currentTimeStr <= end;
        }
        
        if (isQuiet) {
          console.log('Notification suppressed during quiet hours');
          return;
        }
      }
    } catch (e) {
      console.error('Error checking quiet hours:', e);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      // In-app fallback toast (simple alert)
      showToast(`${title}: ${body}`);
    }
  }

  const [toastMessage, setToastMessage] = useState('');
  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  }

  // Timer Loop
  function startTimerLoop(startSeconds: number, totalSecs: number) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    let currentSeconds = startSeconds;
    intervalRef.current = setInterval(() => {
      currentSeconds -= 1;
      setTimeLeft(currentSeconds);
      
      // Save state on every tick
      saveTimerState(currentSeconds, true, false, sessionId);

      if (currentSeconds <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleTimerComplete(mode, sessionId, focusCount);
      }
    }, 1000) as any;
  }

  async function handleTimerComplete(currentMode: TimerMode, activeSessionId: number | null, count: number) {
    setIsActive(false);
    setIsPaused(false);
    clearTimerState();

    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.log('Audio playback blocked'));
    }

    if (currentMode === 'focus') {
      const nextCount = count + 1;
      setFocusCount(nextCount);
      
      // Complete Pomodoro Session in Database
      if (activeSessionId) {
        try {
          await completePomodoroSession(activeSessionId);
        } catch (e) {
          console.error('Failed to log completion on backend', e);
        }
      }

      sendNotification('Focus Session Complete!', 'Time for a break.');

      // Determine next break mode
      if (nextCount % 4 === 0) {
        setMode('long_break');
        setTimeLeft(longBreakLength * 60);
        setTotalDuration(longBreakLength * 60);
      } else {
        setMode('short_break');
        setTimeLeft(breakLength * 60);
        setTotalDuration(breakLength * 60);
      }
      
      if (onSessionComplete) onSessionComplete();
    } else {
      // Break session end
      sendNotification('Break Over!', 'Ready for the next focus session?');
      setMode('focus');
      setTimeLeft(focusLength * 60);
      setTotalDuration(focusLength * 60);
    }
    setSessionId(null);
    if (clearSelectedTask) clearSelectedTask();
  }

  // Start Action
  async function handleStart() {
    requestNotificationPermission();
    let activeSessId = sessionId;

    if (mode === 'focus' && !activeSessId) {
      try {
        const taskId = associatedTaskId ? parseInt(associatedTaskId) : undefined;
        const res = await startPomodoroSession({
          task_id: taskId,
          duration_minutes: focusLength
        });
        activeSessId = res.session.id;
        setSessionId(activeSessId);
      } catch (err) {
        console.error('Failed to start session on backend', err);
      }
    }

    setIsActive(true);
    setIsPaused(false);
    startTimerLoop(timeLeft, totalDuration);
    saveTimerState(timeLeft, true, false, activeSessId);
  }

  // Pause Action
  function handlePause() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPaused(true);
    saveTimerState(timeLeft, true, true, sessionId);
  }

  // Skip Action
  async function handleSkip() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Abandon session on backend if focus is skipped
    if (mode === 'focus' && sessionId) {
      try {
        await abandonPomodoroSession(sessionId);
      } catch (e) {
        console.error(e);
      }
    }

    clearTimerState();
    setSessionId(null);
    setIsActive(false);
    setIsPaused(false);

    if (mode === 'focus') {
      const nextCount = focusCount + 1;
      setFocusCount(nextCount);
      if (nextCount % 4 === 0) {
        setMode('long_break');
        setTimeLeft(longBreakLength * 60);
        setTotalDuration(longBreakLength * 60);
      } else {
        setMode('short_break');
        setTimeLeft(breakLength * 60);
        setTotalDuration(breakLength * 60);
      }
    } else {
      setMode('focus');
      setTimeLeft(focusLength * 60);
      setTotalDuration(focusLength * 60);
    }
    if (clearSelectedTask) clearSelectedTask();
  }

  // Reset Action
  async function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (mode === 'focus' && sessionId) {
      try {
        await abandonPomodoroSession(sessionId);
      } catch (e) {
        console.error(e);
      }
    }

    clearTimerState();
    setSessionId(null);
    setIsActive(false);
    setIsPaused(false);
    
    if (mode === 'focus') {
      setTimeLeft(focusLength * 60);
      setTotalDuration(focusLength * 60);
    } else if (mode === 'short_break') {
      setTimeLeft(breakLength * 60);
      setTotalDuration(breakLength * 60);
    } else {
      setTimeLeft(longBreakLength * 60);
      setTotalDuration(longBreakLength * 60);
    }
    if (clearSelectedTask) clearSelectedTask();
  }

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // SVG Progress Stroke
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.3
  const strokeDashoffset = circumference - (circumference * timeLeft) / totalDuration;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Toast Notification Popup */}
      {toastMessage && <div className="inapp-toast">{toastMessage}</div>}

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Focus Studio</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Boost your productivity using structured Pomodoro cycles</p>
      </div>

      <div className="glass-card timer-container">
        
        {/* Task Selection Dropdown */}
        {mode === 'focus' && !isActive && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>
              Associate Focus Task
            </label>
            <select value={associatedTaskId} onChange={(e) => setAssociatedTaskId(e.target.value)} className="form-select">
              <option value="">No Associated Task (General Study)</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  [{task.priority.toUpperCase()}] {task.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selected Active Task info */}
        {mode === 'focus' && isActive && (
          <div style={{ fontSize: '14px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '10px 18px', borderRadius: 'var(--radius-sm)', width: '100%', fontWeight: '600' }}>
            {associatedTaskId 
              ? `Focusing on: ${tasks.find(t => t.id.toString() === associatedTaskId)?.title || 'Task'}` 
              : 'General Study Focus Session'
            }
          </div>
        )}

        {/* Break mode banner */}
        {mode !== 'focus' && (
          <div style={{ fontSize: '14px', background: 'var(--success-light)', color: 'var(--success)', padding: '10px 18px', borderRadius: 'var(--radius-sm)', width: '100%', fontWeight: '600' }}>
            Relax! Enjoy your {mode === 'short_break' ? 'short' : 'long'} break.
          </div>
        )}

        {/* Circular Display */}
        <div className="timer-circle-wrap">
          <svg className="timer-circle-svg" viewBox="0 0 100 100">
            {/* Background Track Circle */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="3" />
            {/* Foreground Progress Circle */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke={mode === 'focus' ? 'var(--primary)' : 'var(--success)'} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          
          <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="timer-time-display">{timeDisplay}</div>
            <div className="timer-status-text" style={{ color: mode === 'focus' ? 'var(--primary)' : 'var(--success)' }}>
              {mode === 'focus' ? 'Focus Session' : mode === 'short_break' ? 'Short Break' : 'Long Break'}
            </div>
          </div>
        </div>

        {/* Timer Control Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
          {!isActive ? (
            <button className="btn btn-primary" style={{ flexGrow: 1, padding: '12px' }} onClick={handleStart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Focus
            </button>
          ) : isPaused ? (
            <button className="btn btn-primary" style={{ flexGrow: 1, padding: '12px' }} onClick={handleStart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Resume
            </button>
          ) : (
            <button className="btn btn-primary" style={{ flexGrow: 1, padding: '12px', backgroundColor: 'var(--text-muted)' }} onClick={handlePause}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              Pause
            </button>
          )}

          {(isActive || isPaused || mode !== 'focus') && (
            <button className="btn btn-secondary" style={{ padding: '12px 18px' }} onClick={handleSkip} title="Skip current state">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>
          )}

          <button className="btn btn-secondary" style={{ padding: '12px 18px' }} onClick={handleReset} title="Reset Timer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>

      </div>

      {/* Manual Configuration inputs */}
      {!isActive && (
        <div className="glass-card" style={{ padding: '20px 24px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '16px', fontWeight: '700', textAlign: 'left' }}>Custom Interval Lengths</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'left' }}>Focus Duration (m)</label>
              <input type="number" min="5" max="60" className="form-input" value={focusLength} onChange={(e) => {
                const val = Math.max(5, parseInt(e.target.value) || 25);
                setFocusLength(val);
                if (mode === 'focus') { setTimeLeft(val * 60); setTotalDuration(val * 60); }
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'left' }}>Break Duration (m)</label>
              <input type="number" min="1" max="30" className="form-input" value={breakLength} onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 5);
                setBreakLength(val);
                if (mode === 'short_break') { setTimeLeft(val * 60); setTotalDuration(val * 60); }
              }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
