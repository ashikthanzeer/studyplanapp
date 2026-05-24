import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useTimer } from '../hooks/useTimer';
import { ACTIONS } from '../reducer';
import { Button } from './Button';
import { Badge } from './Badge';
import { Modal } from './Modal';
import { Input } from './Input';

export function TaskList({ subjectId, tasks, subject, addOpen = false, onAddHandled, onStartTask }) {
  const [editingTask, setEditingTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('open');
  const [sortBy, setSortBy] = useState('created');
  const { dispatch } = useAppState();
  const { startTaskTimer } = useTimer();
  const subjectTasks = tasks
    .filter((task) => task.subjectId === subjectId)
    .filter((task) => {
      if (statusFilter === 'completed') return task.isCompleted;
      if (statusFilter === 'open') return !task.isCompleted;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'progress') {
        return b.completedSessions / b.estimatedSessions - a.completedSessions / a.estimatedSessions;
      }
      return b.createdAt - a.createdAt;
    });

  const closeModal = () => {
    setEditingTask(null);
    setShowAddModal(false);
    onAddHandled?.();
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      dispatch({
        type: ACTIONS.UPDATE_TASK,
        payload: { id: editingTask.id, updates: taskData },
      });
    } else {
      dispatch({
        type: ACTIONS.ADD_TASK,
        payload: {
          id: createId(),
          subjectId,
          ...taskData,
        },
      });
    }
    closeModal();
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Open tasks</option>
            <option value="completed">Completed tasks</option>
            <option value="all">All tasks</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Sort
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created">Newest first</option>
            <option value="title">Title</option>
            <option value="progress">Most progress</option>
          </select>
        </label>
      </div>

      {subjectTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          No tasks match this view.
        </div>
      ) : (
        subjectTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            subject={subject}
            onEdit={() => {
              setEditingTask(task);
              setShowAddModal(true);
            }}
            onDelete={() => dispatch({ type: ACTIONS.DELETE_TASK, payload: { id: task.id } })}
            onToggleComplete={() => dispatch({ type: ACTIONS.TOGGLE_TASK_COMPLETE, payload: { id: task.id } })}
            onStartSession={() => {
              startTaskTimer(task.id);
              onStartTask?.();
            }}
          />
        ))
      )}

      {(showAddModal || addOpen) && (
        <TaskModal
          isOpen
          task={editingTask}
          onClose={closeModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

function TaskCard({ task, subject, onEdit, onDelete, onToggleComplete, onStartSession }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const progressPercent = Math.min(100, (task.completedSessions / task.estimatedSessions) * 100);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: subject?.color || '#2563eb' }}
              aria-hidden="true"
            />
            <h4 className="truncate font-semibold text-slate-950">{task.title}</h4>
          </div>
          {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onEdit} className="rounded-md px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            Edit
          </button>
          <button type="button" onClick={() => setShowConfirm(true)} className="rounded-md px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Pomodoros completed</span>
          <span>{task.completedSessions} / {task.estimatedSessions}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        {task.isCompleted ? (
          <Badge color="green" size="sm">Completed</Badge>
        ) : (
          <Button variant="success" size="sm" onClick={onStartSession} className="sm:w-auto">
            Start session
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onToggleComplete} className="sm:w-auto">
          {task.isCompleted ? 'Reopen task' : 'Mark complete'}
        </Button>
      </div>

      {showConfirm && (
        <Modal
          isOpen
          title="Delete task?"
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            onDelete();
            setShowConfirm(false);
          }}
          confirmText="Delete"
        >
          <p className="text-slate-600">This removes "{task.title}" and its logged sessions.</p>
        </Modal>
      )}
    </article>
  );
}

function TaskModal({ isOpen, task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [estimatedSessions, setEstimatedSessions] = useState(task?.estimatedSessions || 1);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      estimatedSessions: Math.max(1, Number(estimatedSessions || 1)),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={task ? 'Edit task' : 'Add task'}
      onClose={onClose}
      onConfirm={handleSave}
      confirmText={task ? 'Update' : 'Add'}
    >
      <Input label="Task title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Chapter 3 practice problems" />
      <Input label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional notes" />
      <Input
        label="Estimated Pomodoros"
        type="number"
        value={estimatedSessions}
        onChange={(event) => setEstimatedSessions(event.target.value)}
        min="1"
        max="12"
      />
    </Modal>
  );
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
