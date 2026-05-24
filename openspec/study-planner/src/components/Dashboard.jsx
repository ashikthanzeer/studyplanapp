import { useAppState } from '../hooks/useAppState';
import { useStreak } from '../hooks/useStreak';

export function Dashboard() {
  const { state } = useAppState();
  const streakData = useStreak();
  const today = getDateKey(new Date());
  const workSessions = state.sessions.filter((session) => session.type === 'work' && session.completed);
  const todaySessions = workSessions.filter((session) => session.date === today);
  const totalMinutes = workSessions.reduce((sum, session) => sum + session.duration, 0);
  const completedTasks = state.tasks.filter((task) => task.isCompleted).length;
  const activeTasks = state.tasks.length - completedTasks;
  const recentSessions = [...workSessions].slice(-5).reverse();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">Today's study command center</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            See your streak, logged focus sessions, task progress, and the shape of the last week.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Current streak</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-5xl font-bold text-orange-600">{streakData.currentStreak}</span>
            <span className="pb-2 text-slate-600">days</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Best streak: <span className="font-semibold text-slate-950">{streakData.bestStreak}</span> days
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sessions today" value={todaySessions.length} />
        <StatCard label="Total study time" value={formatMinutes(totalMinutes)} />
        <StatCard label="Active tasks" value={activeTasks} />
        <StatCard label="Completed tasks" value={completedTasks} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <WeeklySummary sessions={workSessions} />
        <RecentSessions sessions={recentSessions} tasks={state.tasks} subjects={state.subjects} />
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function WeeklySummary({ sessions }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = getDateKey(date);
    const minutes = sessions
      .filter((session) => session.date === key)
      .reduce((sum, session) => sum + session.duration, 0);

    return {
      key,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes,
    };
  });
  const maxMinutes = Math.max(25, ...days.map((day) => day.minutes));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">Weekly summary</h2>
        <span className="text-sm text-slate-500">minutes studied</span>
      </div>
      <div className="mt-5 flex h-52 items-end gap-2 sm:gap-3">
        {days.map((day) => (
          <div key={day.key} className="flex h-full flex-1 flex-col justify-end">
            <div className="mb-2 text-center text-xs font-medium text-slate-500">{day.minutes}</div>
            <div
              className="min-h-2 rounded-t bg-blue-600"
              style={{ height: `${Math.max(6, (day.minutes / maxMinutes) * 100)}%` }}
              aria-label={`${day.label}: ${day.minutes} minutes`}
            />
            <div className="mt-2 text-center text-xs font-semibold text-slate-600">{day.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentSessions({ sessions, tasks, subjects }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Recent sessions</h2>
      <div className="mt-4 space-y-3">
        {sessions.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Completed focus sessions will appear here.
          </p>
        ) : (
          sessions.map((session) => {
            const task = tasks.find((item) => item.id === session.taskId);
            const subject = subjects.find((item) => item.id === session.subjectId);
            return (
              <div key={session.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{task?.title || 'Deleted task'}</p>
                  <p className="text-sm text-slate-500">{subject?.name || 'No subject'} · {session.date}</p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                  {session.duration}m
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getDateKey(date) {
  return date.toISOString().split('T')[0];
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining}m`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}
