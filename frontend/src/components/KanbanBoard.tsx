import React, { useState, useEffect } from 'react';
import {
  getKanbanColumns,
  createKanbanColumn,
  updateKanbanColumn,
  deleteKanbanColumn,
  getColumnTasks,
  moveTaskToColumn,
  getTasks,
  getSubjects
} from '../api/client';
import TaskForm from './TaskForm';

export default function KanbanBoard() {
  const [columns, setColumns] = useState<any[]>([]);
  const [columnTasks, setColumnTasks] = useState<Record<number, any[]>>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  
  // Modals
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const [newColName, setNewColName] = useState('');
  const [editingColId, setEditingColId] = useState<number | null>(null);
  const [editingColName, setEditingColName] = useState('');

  useEffect(() => {
    loadBoard();
    loadSubjects();
  }, []);

  async function loadBoard() {
    setLoading(true);
    try {
      const colData = await getKanbanColumns();
      const cols = colData.columns || [];
      setColumns(cols);

      // Load tasks for all columns
      const taskPromises = cols.map(async (col: any) => {
        const res = await getColumnTasks(col.id);
        return { colId: col.id, tasks: res.tasks || [] };
      });

      const results = await Promise.all(taskPromises);
      const taskMap: Record<number, any[]> = {};
      results.forEach((r) => {
        taskMap[r.colId] = r.tasks;
      });
      setColumnTasks(taskMap);
    } catch (err) {
      console.error('Failed to load Kanban board', err);
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

  // Column Actions
  async function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColName.trim()) return;
    try {
      const res = await createKanbanColumn({ name: newColName });
      setColumns([...columns, res.column]);
      setColumnTasks({ ...columnTasks, [res.column.id]: [] });
      setNewColName('');
    } catch (err) {
      console.error('Failed to create column', err);
    }
  }

  async function handleRenameColumn(id: number) {
    if (!editingColName.trim()) return;
    try {
      await updateKanbanColumn(id, { name: editingColName });
      setColumns(columns.map((c) => (c.id === id ? { ...c, name: editingColName } : c)));
      setEditingColId(null);
      setEditingColName('');
    } catch (err) {
      console.error('Failed to rename column', err);
    }
  }

  async function handleDeleteColumn(id: number) {
    if (!confirm('Are you sure you want to delete this column? Tasks in this column will be unassigned.')) return;
    try {
      await deleteKanbanColumn(id);
      setColumns(columns.filter((c) => c.id !== id));
      const updatedTasks = { ...columnTasks };
      delete updatedTasks[id];
      setColumnTasks(updatedTasks);
    } catch (err) {
      console.error('Failed to delete column', err);
    }
  }

  // Drag and Drop Logic
  function handleDragStart(e: React.DragEvent, taskId: number, sourceColId: number) {
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.setData('sourceColId', sourceColId.toString());
  }

  async function handleDrop(e: React.DragEvent, targetColId: number) {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const sourceColIdStr = e.dataTransfer.getData('sourceColId');
    if (!taskIdStr || !sourceColIdStr) return;

    const taskId = parseInt(taskIdStr);
    const sourceColId = parseInt(sourceColIdStr);

    if (sourceColId === targetColId) return;

    // Optimistic Update
    const sourceTasks = [...(columnTasks[sourceColId] || [])];
    const targetTasks = [...(columnTasks[targetColId] || [])];
    const draggedTask = sourceTasks.find((t) => t.id === taskId);

    if (!draggedTask) return;

    // Remove from source, add to target
    const newSourceTasks = sourceTasks.filter((t) => t.id !== taskId);
    const newTargetTasks = [...targetTasks, draggedTask];

    setColumnTasks({
      ...columnTasks,
      [sourceColId]: newSourceTasks,
      [targetColId]: newTargetTasks
    });

    try {
      await moveTaskToColumn({
        columnId: targetColId,
        taskId,
        position: newTargetTasks.length - 1
      });
    } catch (err) {
      console.error('Failed to move task on backend', err);
      // Revert on error
      loadBoard();
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  // Helper to format due date
  function formatCardDate(dateStr?: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Priority Dot colors
  const priorityDots: Record<string, string> = {
    high: 'var(--warning)',
    medium: 'var(--primary)',
    low: 'var(--text-muted)'
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Kanban Workspace</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Drag and drop cards to update task status</p>
        </div>

        {/* Quick Add Column Form */}
        <form onSubmit={handleAddColumn} style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="New Column Name..." className="form-input" value={newColName} onChange={(e) => setNewColName(e.target.value)} style={{ width: '180px' }} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
            Add Column
          </button>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flexGrow: 1, minWidth: '200px', position: 'relative' }}>
          <input type="text" placeholder="Filter cards..." className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '38px', paddingBlock: '8px' }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '12px' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="form-select" style={{ paddingBlock: '8px', fontSize: '13px' }}>
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="form-select" style={{ paddingBlock: '8px', fontSize: '13px' }}>
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Columns List */}
      {loading ? (
        <div style={{ padding: '40px 0', color: 'var(--text-muted)' }}>Loading board...</div>
      ) : (
        <div className="kanban-columns-container">
          {columns.map((col) => {
            const rawTasks = columnTasks[col.id] || [];
            
            // Apply client-side search & filters on cards in columns
            const filteredTasks = rawTasks.filter((task) => {
              if (search && !task.title.toLowerCase().includes(search.toLowerCase()) && !(task.description || '').toLowerCase().includes(search.toLowerCase())) return false;
              if (priorityFilter && task.priority !== priorityFilter) return false;
              if (subjectFilter && task.subject_id !== parseInt(subjectFilter)) return false;
              return true;
            });

            return (
              <div key={col.id} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
                {/* Column Header */}
                <div className="kanban-column-header">
                  {editingColId === col.id ? (
                    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                      <input type="text" className="form-input" style={{ padding: '4px 8px', fontSize: '13px' }} value={editingColName} onChange={(e) => setEditingColName(e.target.value)} required />
                      <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleRenameColumn(col.id)}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {col.name}
                        <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px' }}>
                          {filteredTasks.length}
                        </span>
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {/* Edit Column */}
                        <button className="btn btn-secondary" style={{ padding: '4px', background: 'transparent' }} onClick={() => { setEditingColId(col.id); setEditingColName(col.name); }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        
                        {/* Delete Column */}
                        <button className="btn btn-secondary" style={{ padding: '4px', background: 'transparent', color: 'var(--warning)' }} onClick={() => handleDeleteColumn(col.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Cards List */}
                <div className="kanban-cards-list">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, task.id, col.id)} onClick={() => setTaskToEdit(task)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-heading)', textAlign: 'left', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {task.title}
                        </strong>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: priorityDots[task.priority] || 'var(--primary)', flexShrink: 0, marginTop: '5px' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          {task.subject_name || 'STUDY'}
                        </span>
                        
                        {task.due_date && (
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {formatCardDate(task.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Card Details/Edit Modal Backdrop */}
      {taskToEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '28px', animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Modify Kanban Task</h3>
            <TaskForm taskToEdit={taskToEdit} onCreated={() => { setTaskToEdit(null); loadBoard(); }} onCancel={() => setTaskToEdit(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
