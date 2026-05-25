import React, { useState, useEffect } from 'react';
import { createTask, updateTask, getSubjects } from '../api/client';

interface TaskFormProps {
  taskToEdit?: any;
  onCreated?: () => void;
  onCancel?: () => void;
}

export default function TaskForm({ taskToEdit, onCreated, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : '');
      setPriority(taskToEdit.priority || 'medium');
      setSubjectId(taskToEdit.subject_id || '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setSubjectId('');
    }
  }, [taskToEdit]);

  async function loadSubjects() {
    try {
      const data = await getSubjects();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const payload = {
      title,
      description,
      due_date: dueDate || null,
      priority,
      subject_id: subjectId ? parseInt(subjectId) : null,
    };

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, payload);
      } else {
        await createTask(payload);
      }
      
      // Reset form if not editing
      if (!taskToEdit) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority('medium');
        setSubjectId('');
      }
      
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Task submission failed', err);
      alert('Failed to save task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Task Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be studied?" className="form-input" required />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Description (Optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details or notes..." className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'left' }}>Subject</label>
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="form-select">
          <option value="">No Subject Assigned</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
