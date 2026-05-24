import { useAppState } from '../hooks/useAppState';
import { useTimer } from '../hooks/useTimer';
import { Button } from './Button';

export function PomodoroTimer() {
  const { state } = useAppState();
  const { timer, setTimer } = useTimer();
  const openTasks = state.tasks.filter((task) => !task.isCompleted);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Pomodoro</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">Focus timer</h1>
          <p className="mt-2 text-slate-600">Work for 25 minutes, then take a 5 minute break. Completed work sessions are logged automatically.</p>
        </div>

        <TaskPicker tasks={openTasks} subjects={state.subjects} selectedTaskId={timer.taskId} onSelect={(taskId) => setTimer(taskId, 'work')} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <TimerDisplay />
        <TaskProgress />
        <BreakScreen />
        <ControlPanel />
      </section>
    </div>
  );
}

function TaskPicker({ tasks, subjects, selectedTaskId, onSelect }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Choose a task</h2>
      <div className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No open tasks are available. Add a subject and task first.</p>
        ) : (
          tasks.map((task) => {
            const subject = subjects.find((item) => item.id === task.subjectId);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelect(task.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${
                  selectedTaskId === task.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-950">{task.title}</span>
                  <span className="text-sm text-slate-500">{subject?.name || 'No subject'}</span>
                </span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {task.completedSessions}/{task.estimatedSessions}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function TimerDisplay() {
  const { timer, workSeconds, breakSeconds } = useTimer();
  const totalSeconds = timer.type === 'work' ? workSeconds : breakSeconds;
  const progress = ((totalSeconds - timer.timeRemaining) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 88;
  const dash = (circumference * progress) / 100;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative grid h-64 w-64 place-items-center sm:h-72 sm:w-72">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke={timer.type === 'work' ? '#2563eb' : '#16a34a'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{timer.type === 'work' ? 'Work session' : 'Break'}</p>
          <p className="mt-2 text-6xl font-bold tabular-nums text-slate-950">{formatTime(timer.timeRemaining)}</p>
          <p className="mt-2 text-sm text-slate-500">{timer.isRunning ? 'Running' : 'Paused'}</p>
        </div>
      </div>
    </div>
  );
}

export function TaskProgress() {
  const { state } = useAppState();
  const { timer } = useTimer();
  const task = state.tasks.find((item) => item.id === timer.taskId);
  const subject = state.subjects.find((item) => item.id === task?.subjectId);

  if (!task) {
    return (
      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-600">
        Select an open task before starting the timer.
      </div>
    );
  }

  const progress = Math.min(100, (task.completedSessions / task.estimatedSessions) * 100);

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: subject?.color || '#2563eb' }} />
        <div className="min-w-0">
          <h2 className="truncate font-bold text-slate-950">{task.title}</h2>
          <p className="text-sm text-slate-500">{subject?.name || 'No subject'}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm text-slate-600">
          <span>Task progress</span>
          <span>{task.completedSessions} / {task.estimatedSessions}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export function BreakScreen() {
  const { timer } = useTimer();
  if (timer.type !== 'break') return null;

  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
      <h2 className="font-bold text-green-900">Break time</h2>
      <p className="mt-1 text-sm text-green-800">Stretch, hydrate, and rest your eyes before the next session.</p>
    </div>
  );
}

export function ControlPanel() {
  const { timer, startTimer, pauseTimer, stopTimer, skipTimer, resetToWork } = useTimer();
  const canStart = Boolean(timer.taskId) || timer.type === 'break';

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
      {timer.isRunning ? (
        <Button variant="outline" size="lg" onClick={pauseTimer}>Pause</Button>
      ) : (
        <Button variant="success" size="lg" onClick={startTimer} disabled={!canStart}>Start</Button>
      )}
      <Button variant="secondary" size="lg" onClick={skipTimer}>Skip</Button>
      <Button variant="outline" size="lg" onClick={resetToWork}>Reset</Button>
      <Button variant="danger" size="lg" onClick={stopTimer}>Stop</Button>
    </div>
  );
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
