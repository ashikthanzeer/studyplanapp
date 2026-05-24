# Study Planner + Pomodoro Timer - Design

## Tech Stack
- **Framework**: React 18+
- **Styling**: CSS Modules or Tailwind CSS
- **State Management**: React Context API + useReducer
- **Storage**: localStorage API
- **Build Tool**: Vite or Create React App
- **Notifications**: Browser API (Audio, Notification API)

## Data Model

### Subject
```typescript
interface Subject {
  id: string;           // UUID
  name: string;         // "Math", "Biology", etc.
  color: string;        // Hex color for UI
  createdAt: number;    // Timestamp
  updatedAt: number;    // Timestamp
}
```

### Task
```typescript
interface Task {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  estimatedSessions: number;  // How many Pomodoros needed
  completedSessions: number;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
}
```

### Session
```typescript
interface Session {
  id: string;
  taskId: string;
  subjectId: string;
  startTime: number;
  endTime: number;
  duration: number;     // in minutes
  type: 'work' | 'break';
  completed: boolean;
  date: string;         // YYYY-MM-DD for streak tracking
}
```

### Streak
```typescript
interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string;  // YYYY-MM-DD
  studyDates: string[];   // All dates with study sessions
}
```

### AppState
```typescript
interface AppState {
  subjects: Subject[];
  tasks: Task[];
  sessions: Session[];
  streakData: StreakData;
  currentTimer: {
    taskId?: string;
    timeRemaining: number;
    isRunning: boolean;
    type: 'work' | 'break';
  };
}
```

## Component Structure

```
App/
├── Providers/
│   └── AppStateProvider (Context + Reducer)
├── Layout/
│   ├── Header
│   ├── Sidebar
│   └── MainContent
├── Pages/
│   ├── Dashboard
│   │   ├── StreakCard
│   │   ├── SessionStats
│   │   └── WeeklySummary
│   ├── TaskManager
│   │   ├── SubjectList
│   │   │   └── SubjectCard
│   │   │       └── TaskList
│   │   │           └── TaskCard
│   │   └── AddSubjectModal
│   │   └── AddTaskModal
│   └── Timer
│       ├── TimerDisplay
│       ├── TaskProgress
│       ├── ControlPanel
│       └── BreakScreen
├── Components/
│   ├── Button
│   ├── Modal
│   ├── Input
│   ├── Select
│   └── Badge
└── Hooks/
    ├── useAppState
    ├── useTimer
    ├── useStreak
    └── useLocalStorage
```

## Key Hooks

### useTimer
- Manages Pomodoro timer state (work/break cycles)
- Handles pause, resume, skip
- Triggers notifications on completion
- Auto-transitions between work and break

### useStreak
- Calculates current and best streak
- Detects streak breaks
- Updates streak data on new study day

### useAppState
- Global state management via Context
- Dispatch actions for CRUD operations
- Auto-sync to localStorage

### useLocalStorage
- Wrapper for localStorage with serialization
- Handles data migrations
- Provides undo functionality (future)

## Storage Schema (localStorage)

```
localStorage:
{
  "appState": {
    "subjects": [...],
    "tasks": [...],
    "sessions": [...],
    "streakData": {...}
  },
  "appVersion": "1.0.0"
}
```

## UI/UX Flow

### Initial Load
1. Check localStorage for saved data
2. Load or initialize empty state
3. Display dashboard (or onboarding if new user)

### Study Session Flow
1. User selects task from Task Manager
2. Click "Start Session" → Timer begins (25 min)
3. At 25 min: Alert & sound → Suggest break
4. Break timer (5 min) runs automatically
5. After break: Ready for next session or return to tasks
6. Session logged to history with timestamp

### End of Day
- Streak updates automatically (based on last study time)
- Next day: Streak continues if user studies, resets if not

## Responsive Design
- **Desktop**: Sidebar + main content layout
- **Tablet**: Collapsible sidebar, stacked components
- **Mobile**: Bottom navigation, full-width cards, large buttons

## Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Color contrast meets WCAG AA
- Sound + visual notifications for timers
