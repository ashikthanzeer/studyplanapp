import React, { useEffect, useState } from 'react';
import { getTasks, deleteTask, updateTask, getSubjects } from '../api/client';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

interface TaskListProps {
  onStartFocus?: (task: any) => void;
}

export default function TaskList({ onStartFocus }: TaskListProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);

  useEffect(() => {
    loadTasks();
    loadSubjects();
  }, [search, priorityFilter, subjectFilter]);

  async function loadTasks() {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (subjectFilter) params.subject_id = subjectFilter;
      
      const data = await getTasks(params);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubjects() {
    try {
      const data = await getSubjects();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks((t) => t.filter((x) => x.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete task');
    }
  }

  async function handleToggleComplete(task: any) {
    const nextStatus = task.status === 'done' ? 'to_do' : 'done';
    try {
      await updateTask(task.id, { ...task, status: nextStatus });
      setTasks((prevTasks) => 
        prevTasks.map((t) => t.id === task.id ? { ...t, status: nextStatus } : t)
      );
    } catch (err) {
      console.error('Failed to toggle complete status', err);
    }
  }

  const todoTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header and Add Task Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Tasks Planner</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Organize and schedule your learning goals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flexGrow: 1, minWidth: '240px', position: 'relative' }}>
          <input type="text" placeholder="Search tasks by title or description..." className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '14px' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Priority Filter */}
        <div style={{ minWidth: '140px' }}>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="form-select">
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div style={{ minWidth: '160px' }}>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="form-select">
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lists display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {loading ? (
          <div style={{ padding: '40px 0', color: 'var(--text-muted)', fontSize: '15px' }}>Loading tasks...</div>
        ) : (
          <>
            {/* Active Tasks (To Do / In Progress) */}
            <div>
              <h3 style={{ fontSize: '16px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Tasks
                <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {todoTasks.length}
                </span>
              </h3>
              {todoTasks.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(120, 120, 120, 0.02)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No active tasks found matching filters.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {todoTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={setTaskToEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} onStartFocus={onStartFocus} />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Completed Tasks
                  <span className="badge" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                    {completedTasks.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={setTaskToEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Task Modal Backdrop */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Create a New Study Task</h3>
            <TaskForm onCreated={() => { setIsAddModalOpen(false); loadTasks(); }} onCancel={() => setIsAddModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Edit Task Modal Backdrop */}
      {taskToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Edit Task Details</h3>
            <TaskForm taskToEdit={taskToEdit} onCreated={() => { setTaskToEdit(null); loadTasks(); }} onCancel={() => setTaskToEdit(null)} />
          </div>
        </div>
      )}

    </div>
  );
}
