import React from 'react';

type Props = {
  task: any;
  onEdit?: (task: any) => void;
  onDelete?: (id: number) => void;
  onToggleComplete?: (task: any) => void;
  onStartFocus?: (task: any) => void;
};

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete, onStartFocus }: Props) {
  const isCompleted = task.status === 'done';
  
  // Format due date
  const isOverdue = task.due_date && new Date(task.due_date).toISOString().split('T')[0] < new Date().toISOString().split('T')[0] && !isCompleted;
  const formattedDate = task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  // Priority Styles
  const priorityColors: Record<string, { bg: string, text: string }> = {
    high: { bg: 'var(--warning-light)', text: 'var(--warning)' },
    medium: { bg: 'rgba(168, 85, 247, 0.12)', text: 'var(--primary)' },
    low: { bg: 'rgba(100, 116, 139, 0.12)', text: 'var(--text-muted)' }
  };
  const priorityStyle = priorityColors[task.priority || 'medium'];

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: isCompleted ? '4px solid var(--success)' : `4px solid ${task.priority === 'high' ? 'var(--warning)' : 'var(--primary)'}`, opacity: isCompleted ? 0.75 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexGrow: 1, minWidth: 0 }}>
          {onToggleComplete && (
            <input type="checkbox" checked={isCompleted} style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer', accentColor: 'var(--success)' }} onChange={() => onToggleComplete(task)} />
          )}
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-heading)', textDecoration: isCompleted ? 'line-through' : 'none', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {task.title}
            </h4>
            {task.description && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <span className="badge" style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text, fontSize: '10px', padding: '2px 8px' }}>
          {task.priority}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Subject Badge */}
          {task.subject_name && (
            <span style={{ fontSize: '11px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
              {task.subject_name}
            </span>
          )}

          {/* Due Date Indicator */}
          {task.due_date && (
            <span style={{ fontSize: '11px', color: isOverdue ? 'var(--warning)' : 'var(--text-muted)', background: isOverdue ? 'var(--warning-light)' : 'transparent', padding: isOverdue ? '2px 6px' : '0', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: isOverdue ? '700' : '500' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {isOverdue ? 'Overdue: ' : ''}{formattedDate}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isCompleted && onStartFocus && (
            <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }} onClick={() => onStartFocus(task)} title="Focus on this task">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Focus
            </button>
          )}
          {onEdit && (
            <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => onEdit(task)} title="Edit Task">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button className="btn btn-secondary" style={{ padding: '6px', color: 'var(--warning)' }} onClick={() => onDelete(task.id)} title="Delete Task">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
