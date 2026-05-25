import React, { useState, useEffect } from 'react';
import {
  getSubjects,
  createSubject,
  deleteSubject,
  getTasks,
  updateTask,
  createTask
} from '../api/client';

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Form states
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#a855f7');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSub) {
      loadTasksForSubject(selectedSub.id);
    } else {
      setTasks([]);
    }
  }, [selectedSub]);

  async function loadSubjects() {
    setLoadingSubjects(true);
    try {
      const data = await getSubjects();
      const subs = data.subjects || [];
      setSubjects(subs);
      if (subs.length > 0 && !selectedSub) {
        setSelectedSub(subs[0]);
      }
    } catch (e) {
      console.error('Failed to load subjects', e);
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function loadTasksForSubject(subjectId: number) {
    setLoadingTasks(true);
    try {
      const data = await getTasks({ subject_id: subjectId });
      setTasks(data.tasks || []);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoadingTasks(false);
    }
  }

  function flashMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }

  function flashError(msg: string) {
    setErrMessage(msg);
    setTimeout(() => setErrMessage(''), 3000);
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubName.trim()) return;
    try {
      const res = await createSubject({ name: newSubName, color: newSubColor });
      const newSubject = res.subject;
      setSubjects([...subjects, newSubject]);
      setNewSubName('');
      setSelectedSub(newSubject);
      flashMessage('Subject added successfully!');
    } catch (err: any) {
      flashError(err.response?.data?.error || 'Failed to add subject.');
    }
  }

  async function handleDeleteSubject(sub: any) {
    if (!confirm(`Delete subject "${sub.name}"? Tasks associated with it will remain but will be unassigned.`)) return;
    try {
      await deleteSubject(sub.id);
      const updated = subjects.filter((s) => s.id !== sub.id);
      setSubjects(updated);
      flashMessage('Subject deleted.');
      if (selectedSub?.id === sub.id) {
        setSelectedSub(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      flashError('Failed to delete subject.');
    }
  }

  async function handleToggleTaskComplete(task: any) {
    const nextStatus = task.status === 'done' ? 'to_do' : 'done';
    try {
      await updateTask(task.id, { ...task, status: nextStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    } catch (e) {
      console.error('Failed to update task', e);
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedSub) return;

    try {
      const payload = {
        title: newTaskTitle,
        description: '',
        priority: 'medium',
        subject_id: selectedSub.id
      };
      const res = await createTask(payload);
      setTasks([res.task, ...tasks]);
      setNewTaskTitle('');
      flashMessage('Task created!');
    } catch (err) {
      flashError('Failed to create task.');
    }
  }

  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Subjects Center</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage academic modules and focus on specific course tasks</p>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ padding: '8px 16px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '600' }}>
          {message}
        </div>
      )}
      {errMessage && (
        <div style={{ padding: '8px 16px', background: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '600' }}>
          {errMessage}
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'flex-start' }} className="dashboard-grid">
        
        {/* Left Column: Subjects list & form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Add Subject Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '700', textAlign: 'left' }}>Create Subject</h3>
            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Subject Title</label>
                <input type="text" placeholder="e.g. Mathematics" className="form-input" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Theme Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" className="form-input" style={{ padding: '2px', height: '38px', width: '60px', cursor: 'pointer' }} value={newSubColor} onChange={(e) => setNewSubColor(e.target.value)} />
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{newSubColor.toUpperCase()}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '4px', width: '100%' }}>
                Create Subject
              </button>
            </form>
          </div>

          {/* Subjects List Glass Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '700', textAlign: 'left' }}>My Subjects</h3>
            {loadingSubjects ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No subjects added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subjects.map((sub) => {
                  const isActive = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'var(--primary-light)' : 'rgba(255,255,255,0.02)',
                        border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: sub.color || 'var(--primary)' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: isActive ? 'var(--text-heading)' : 'var(--text-main)' }}>
                          {sub.name}
                        </span>
                      </div>
                      
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(sub);
                        }}
                        style={{
                          padding: '3px 6px',
                          fontSize: '10px',
                          background: 'transparent',
                          color: 'var(--warning)',
                          border: 'none',
                          boxShadow: 'none'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Tasks filtered by active subject */}
        <div className="glass-card" style={{ padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedSub ? (
            <>
              {/* Header inside task panel */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: selectedSub.color || 'var(--primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{selectedSub.name} Tasks</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      {tasks.length} total tasks assigned to this module
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Add Task for Subject Form */}
              <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder={`Add a new task for ${selectedSub.name}...`}
                  className="form-input"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Quick Add
                </button>
              </form>

              {/* Tasks Lists */}
              {loadingTasks ? (
                <div style={{ color: 'var(--text-muted)', padding: '24px 0' }}>Loading subject tasks...</div>
              ) : tasks.length === 0 ? (
                <div style={{ padding: '60px 0', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(120, 120, 120, 0.02)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No tasks assigned to {selectedSub.name} yet.</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Create one above to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                  
                  {/* Active tasks */}
                  {activeTasks.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        To Do ({activeTasks.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeTasks.map((t) => (
                          <div
                            key={t.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              background: 'var(--bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleToggleTaskComplete(t)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-heading)' }}>
                                {t.title}
                              </span>
                              {t.due_date && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Due: {new Date(t.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <span
                              className="badge"
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                backgroundColor: t.priority === 'high' ? 'var(--warning-light)' : t.priority === 'medium' ? 'var(--primary-light)' : 'rgba(0,0,0,0.04)',
                                color: t.priority === 'high' ? 'var(--warning)' : t.priority === 'medium' ? 'var(--primary)' : 'var(--text-muted)'
                              }}
                            >
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed tasks */}
                  {completedTasks.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Completed ({completedTasks.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {completedTasks.map((t) => (
                          <div
                            key={t.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              background: 'var(--bg-app)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              opacity: 0.65
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => handleToggleTaskComplete(t)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-muted)', flexGrow: 1 }}>
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifySelf: 'center', alignSelf: 'center', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
              </svg>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>No Subject Selected</h3>
              <p style={{ fontSize: '13px', maxWidth: '300px' }}>
                Create a subject on the left or select an existing one to manage its tasks.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
