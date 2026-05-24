import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { ACTIONS, SUBJECT_COLORS } from '../reducer';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input } from './Input';
import { TaskList } from './TaskList';

export function SubjectList({ onOpenTimer }) {
  const { state, dispatch } = useAppState();
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [taskModalSubjectId, setTaskModalSubjectId] = useState(null);

  const saveSubject = (subjectData) => {
    if (editingSubject) {
      dispatch({
        type: ACTIONS.UPDATE_SUBJECT,
        payload: { id: editingSubject.id, updates: subjectData },
      });
    } else {
      dispatch({
        type: ACTIONS.ADD_SUBJECT,
        payload: { id: createId(), ...subjectData },
      });
    }
    setEditingSubject(null);
    setShowSubjectModal(false);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Tasks</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">Subjects and study tasks</h1>
          <p className="mt-2 text-slate-600">Create subjects, break them into Pomodoro-sized tasks, and start a session when ready.</p>
        </div>
        <Button variant="primary" onClick={() => setShowSubjectModal(true)}>
          Add subject
        </Button>
      </section>

      <section className="space-y-4">
        {state.subjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">No subjects yet</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">Add your first subject, then create tasks with estimated Pomodoro counts.</p>
            <Button variant="primary" onClick={() => setShowSubjectModal(true)} className="mt-5">
              Create first subject
            </Button>
          </div>
        ) : (
          state.subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              tasks={state.tasks}
              addTaskOpen={taskModalSubjectId === subject.id}
              onAddHandled={() => setTaskModalSubjectId(null)}
              onEdit={() => {
                setEditingSubject(subject);
                setShowSubjectModal(true);
              }}
              onDelete={() => dispatch({ type: ACTIONS.DELETE_SUBJECT, payload: { id: subject.id } })}
              onAddTask={() => setTaskModalSubjectId(subject.id)}
              onStartTask={onOpenTimer}
            />
          ))
        )}
      </section>

      {showSubjectModal && (
        <SubjectModal
          isOpen
          subject={editingSubject}
          onClose={() => {
            setEditingSubject(null);
            setShowSubjectModal(false);
          }}
          onSave={saveSubject}
        />
      )}
    </div>
  );
}

function SubjectCard({ subject, tasks, addTaskOpen, onAddHandled, onEdit, onDelete, onAddTask, onStartTask }) {
  const [expanded, setExpanded] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const subjectTasks = tasks.filter((task) => task.subjectId === subject.id);
  const completeCount = subjectTasks.filter((task) => task.isCompleted).length;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={expanded}
        >
          <span className="h-5 w-5 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold text-slate-950">{subject.name}</span>
            <span className="text-sm text-slate-500">{completeCount} of {subjectTasks.length} tasks complete</span>
          </span>
        </button>

        <div className="flex flex-wrap gap-2">
          <Button variant="success" size="sm" onClick={onAddTask}>Add task</Button>
          <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>Delete</Button>
          <Button variant="secondary" size="sm" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <TaskList
            subjectId={subject.id}
            tasks={tasks}
            subject={subject}
            addOpen={addTaskOpen}
            onAddHandled={onAddHandled}
            onStartTask={onStartTask}
          />
        </div>
      )}

      {showConfirm && (
        <Modal
          isOpen
          title="Delete subject?"
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            onDelete();
            setShowConfirm(false);
          }}
          confirmText="Delete"
        >
          <p className="text-slate-600">This removes "{subject.name}", its tasks, and matching session history.</p>
        </Modal>
      )}
    </article>
  );
}

function SubjectModal({ isOpen, subject, onClose, onSave }) {
  const [name, setName] = useState(subject?.name || '');
  const [color, setColor] = useState(subject?.color || SUBJECT_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={subject ? 'Edit subject' : 'Add subject'}
      onClose={onClose}
      onConfirm={handleSave}
      confirmText={subject ? 'Update' : 'Add'}
    >
      <Input label="Subject name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Mathematics" />
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Color</label>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_COLORS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setColor(item)}
              className={`h-9 w-9 rounded-full border-2 ${color === item ? 'border-slate-950' : 'border-white'} shadow-sm ring-1 ring-slate-200`}
              style={{ backgroundColor: item }}
              aria-label={`Select ${item}`}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
