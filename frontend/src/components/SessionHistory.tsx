import React, { useState, useEffect } from 'react';
import { getPomodoroHistory, getTasks } from '../api/client';

export default function SessionHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('7'); // default last 7 days
  const [taskFilter, setTaskFilter] = useState('');
  
  // Custom Daily Chart Data
  const [chartData, setChartData] = useState<{ dayName: string, minutes: number }[]>([]);

  useEffect(() => {
    loadHistory();
    loadTasks();
  }, [dateFilter, taskFilter]);

  async function loadTasks() {
    try {
      const data = await getTasks();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadHistory() {
    setLoading(true);
    try {
      const params: any = {};
      if (taskFilter) params.task_id = taskFilter;
      
      // Calculate date_from based on filter selection
      if (dateFilter !== 'all') {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - parseInt(dateFilter));
        params.date_from = dateFrom.toISOString().split('T')[0];
      }

      const res = await getPomodoroHistory(params);
      const list = res.sessions || [];
      setSessions(list);

      // Process stats for the last 7 days to display in the custom bar chart
      buildChartData(list);
    } catch (err) {
      console.error('Failed to load session history', err);
    } finally {
      setLoading(false);
    }
  }

  function buildChartData(sessionsList: any[]) {
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const grouped = last7Days.map((dateStr) => {
      const date = new Date(dateStr);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const totalMin = sessionsList
        .filter((s) => s.status === 'completed' && s.started_at.split('T')[0] === dateStr)
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        
      return { dayName, minutes: totalMin };
    });

    setChartData(grouped);
  }

  // Export Data to CSV
  function exportCSV() {
    const headers = ['Session ID', 'Task Title', 'Duration (mins)', 'Break (mins)', 'Status', 'Started At', 'Ended At'];
    const rows = sessions.map((s) => {
      const associatedTask = tasks.find((t) => t.id === s.task_id);
      return [
        s.id,
        associatedTask ? `"${associatedTask.title.replace(/"/g, '""')}"` : 'General Focus',
        s.duration_minutes,
        s.break_duration_minutes,
        s.status,
        s.started_at,
        s.ended_at || ''
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'study_planner_pomodoro_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export Data to JSON
  function exportJSON() {
    const exportData = sessions.map((s) => {
      const associatedTask = tasks.find((t) => t.id === s.task_id);
      return {
        id: s.id,
        task: associatedTask ? associatedTask.title : 'General Study',
        duration_minutes: s.duration_minutes,
        break_duration_minutes: s.break_duration_minutes,
        status: s.status,
        started_at: s.started_at,
        ended_at: s.ended_at
      };
    });

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'study_planner_pomodoro_history.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Calculate stats summaries
  const totalCompletedTime = sessions.filter((s) => s.status === 'completed').reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const totalCompletedSessions = sessions.filter((s) => s.status === 'completed').length;
  const completionRate = sessions.length ? Math.round((totalCompletedSessions / sessions.length) * 100) : 0;

  // Chart layout specs
  const chartHeight = 160;
  const chartWidth = 400;
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 60); // min scale is 60 mins

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Study History & Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review your session records and productivity statistics</p>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={exportJSON}>
            Export JSON
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Analytics Overview Charts Grid */}
      <div className="dashboard-grid">
        
        {/* Custom SVG Bar Chart */}
        <div className="glass-card widget-large widget-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'left' }}>Weekly Focus Activity (Minutes)</h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} style={{ width: '100%', maxWidth: '500px', height: 'auto' }}>
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartHeight - ratio * chartHeight;
                const value = Math.round(ratio * maxMinutes);
                return (
                  <g key={ratio}>
                    <line x1="40" y1={y} x2={chartWidth} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
                    <text x="30" y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">{value}m</text>
                  </g>
                );
              })}

              {/* Bar Columns */}
              {chartData.map((data, index) => {
                const barWidth = 32;
                const gap = (chartWidth - 40 - (7 * barWidth)) / 6;
                const x = 45 + index * (barWidth + gap);
                const height = (data.minutes / maxMinutes) * chartHeight;
                const y = chartHeight - height;

                return (
                  <g key={index}>
                    {/* Background track */}
                    <rect x={x} y="0" width={barWidth} height={chartHeight} fill="rgba(120,120,120,0.03)" rx="3" />
                    {/* Active Bar */}
                    <rect x={x} y={y} width={barWidth} height={height} fill="var(--primary)" rx="3" className="animate-pulse-glow" style={{ animationDuration: '3s', transition: 'y 0.5s ease, height 0.5s ease' }} />
                    {/* Hover text label */}
                    {data.minutes > 0 && (
                      <text x={x + barWidth / 2} y={y - 6} fill="var(--text-heading)" fontSize="9" fontWeight="700" textAnchor="middle">
                        {data.minutes}m
                      </text>
                    )}
                    {/* Day label */}
                    <text x={x + barWidth / 2} y={chartHeight + 20} fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">
                      {data.dayName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Analytics Highlights summary card */}
        <div className="glass-card widget-small widget-card" style={{ gap: '20px' }}>
          <h3 style={{ fontSize: '16px', textAlign: 'left' }}>Session Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Focus Duration</span>
              <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>
                {Math.round(totalCompletedTime)} Min
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Completed Sessions</span>
              <strong style={{ fontSize: '18px', color: 'var(--accent)' }}>
                {totalCompletedSessions} Sessions
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Completion Rate</span>
              <strong style={{ fontSize: '18px', color: 'var(--success)' }}>
                {completionRate}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)' }}>History Log</h4>
        
        <div style={{ flexGrow: 1 }} />

        {/* Time Span Filter */}
        <div style={{ minWidth: '150px' }}>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="form-select" style={{ paddingBlock: '8px', fontSize: '13px' }}>
            <option value="1">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="all">All-Time History</option>
          </select>
        </div>

        {/* Task Filter */}
        <div style={{ minWidth: '180px' }}>
          <select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)} className="form-select" style={{ paddingBlock: '8px', fontSize: '13px' }}>
            <option value="">All Associated Tasks</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Session Log Table */}
      <div className="glass-card" style={{ overflowX: 'auto', width: '100%' }}>
        {loading ? (
          <div style={{ padding: '40px 0', color: 'var(--text-muted)' }}>Loading records...</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '40px', color: 'var(--text-muted)' }}>No focus sessions logged in this timeframe.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(120, 120, 120, 0.02)' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--text-heading)' }}>Date & Time</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--text-heading)' }}>Associated Task</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--text-heading)' }}>Focus Length</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--text-heading)' }}>Break Length</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--text-heading)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const date = new Date(s.started_at).toLocaleString();
                const associatedTask = tasks.find((t) => t.id === s.task_id);
                
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(120, 120, 120, 0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px', color: 'var(--text-heading)' }}>{date}</td>
                    <td style={{ padding: '14px 20px', fontWeight: '600' }}>
                      {associatedTask ? associatedTask.title : <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>General Focus</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>{s.duration_minutes} Minutes</td>
                    <td style={{ padding: '14px 20px' }}>{s.break_duration_minutes} Minutes</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge" style={{ fontSize: '10px', backgroundColor: s.status === 'completed' ? 'var(--success-light)' : 'var(--warning-light)', color: s.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
