// Types for the app state
export const SUBJECT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
];

export const initialState = {
  subjects: [],
  tasks: [],
  sessions: [],
  streakData: {
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: null,
    studyDates: [],
  },
  currentTimer: {
    taskId: null,
    timeRemaining: 25 * 60,
    isRunning: false,
    type: 'work',
    startedAt: null,
  },
};

// Action types
export const ACTIONS = {
  // Subject actions
  ADD_SUBJECT: 'ADD_SUBJECT',
  UPDATE_SUBJECT: 'UPDATE_SUBJECT',
  DELETE_SUBJECT: 'DELETE_SUBJECT',
  
  // Task actions
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  INCREMENT_TASK_SESSIONS: 'INCREMENT_TASK_SESSIONS',
  TOGGLE_TASK_COMPLETE: 'TOGGLE_TASK_COMPLETE',
  
  // Session actions
  ADD_SESSION: 'ADD_SESSION',
  
  // Timer actions
  SET_TIMER: 'SET_TIMER',
  START_TASK_TIMER: 'START_TASK_TIMER',
  UPDATE_TIME_REMAINING: 'UPDATE_TIME_REMAINING',
  COMPLETE_TIMER: 'COMPLETE_TIMER',
  START_TIMER: 'START_TIMER',
  PAUSE_TIMER: 'PAUSE_TIMER',
  STOP_TIMER: 'STOP_TIMER',
  SKIP_TIMER: 'SKIP_TIMER',
  TRANSITION_TO_BREAK: 'TRANSITION_TO_BREAK',
  TRANSITION_TO_WORK: 'TRANSITION_TO_WORK',
  
  // Streak actions
  UPDATE_STREAK: 'UPDATE_STREAK',
  
  // Load state
  LOAD_STATE: 'LOAD_STATE',
};

export function appReducer(state, action) {
  switch (action.type) {
    // ===== SUBJECT ACTIONS =====
    case ACTIONS.ADD_SUBJECT: {
      return {
        ...state,
        subjects: [
          ...state.subjects,
          {
            id: action.payload.id,
            name: action.payload.name,
            color: action.payload.color,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      };
    }

    case ACTIONS.UPDATE_SUBJECT: {
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.id
            ? { ...s, ...action.payload.updates, updatedAt: Date.now() }
            : s
        ),
      };
    }

    case ACTIONS.DELETE_SUBJECT: {
      const subjectId = action.payload.id;
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== subjectId),
        tasks: state.tasks.filter((t) => t.subjectId !== subjectId),
        sessions: state.sessions.filter((s) => s.subjectId !== subjectId),
        currentTimer:
          state.currentTimer.taskId &&
          state.tasks.some((t) => t.id === state.currentTimer.taskId && t.subjectId === subjectId)
            ? initialState.currentTimer
            : state.currentTimer,
      };
    }

    // ===== TASK ACTIONS =====
    case ACTIONS.ADD_TASK: {
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: action.payload.id,
            subjectId: action.payload.subjectId,
            title: action.payload.title,
            description: action.payload.description || '',
            estimatedSessions: Math.max(1, Number(action.payload.estimatedSessions || 1)),
            completedSessions: 0,
            isCompleted: false,
            createdAt: Date.now(),
            completedAt: null,
          },
        ],
      };
    }

    case ACTIONS.UPDATE_TASK: {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                ...action.payload.updates,
                estimatedSessions: Math.max(1, Number(action.payload.updates.estimatedSessions || t.estimatedSessions)),
              }
            : t
        ),
      };
    }

    case ACTIONS.DELETE_TASK: {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload.id),
        sessions: state.sessions.filter((s) => s.taskId !== action.payload.id),
        currentTimer:
          state.currentTimer.taskId === action.payload.id ? initialState.currentTimer : state.currentTimer,
      };
    }

    case ACTIONS.TOGGLE_TASK_COMPLETE: {
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.payload.id) return t;
          const isCompleted = !t.isCompleted;
          return {
            ...t,
            isCompleted,
            completedSessions: isCompleted ? Math.max(t.completedSessions, t.estimatedSessions) : t.completedSessions,
            completedAt: isCompleted ? Date.now() : null,
          };
        }),
      };
    }

    case ACTIONS.INCREMENT_TASK_SESSIONS: {
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id === action.payload.taskId) {
            const newCompleted = t.completedSessions + 1;
            const isCompleted = newCompleted >= t.estimatedSessions;
            return {
              ...t,
              completedSessions: newCompleted,
              isCompleted,
              completedAt: isCompleted ? Date.now() : null,
            };
          }
          return t;
        }),
      };
    }

    // ===== SESSION ACTIONS =====
    case ACTIONS.ADD_SESSION: {
      return {
        ...state,
        sessions: [
          ...state.sessions,
          {
            id: action.payload.id,
            taskId: action.payload.taskId,
            subjectId: action.payload.subjectId,
            startTime: action.payload.startTime,
            endTime: action.payload.endTime,
            duration: action.payload.duration,
            type: 'work',
            completed: true,
            date: action.payload.date,
          },
        ],
      };
    }

    // ===== TIMER ACTIONS =====
    case ACTIONS.SET_TIMER: {
      const duration = action.payload.type === 'work' ? 25 * 60 : 5 * 60;
      return {
        ...state,
        currentTimer: {
          taskId: action.payload.taskId,
          timeRemaining: duration,
          isRunning: false,
          type: action.payload.type,
          startedAt: null,
        },
      };
    }

    case ACTIONS.START_TASK_TIMER: {
      return {
        ...state,
        currentTimer: {
          taskId: action.payload.taskId,
          timeRemaining: 25 * 60,
          isRunning: true,
          type: 'work',
          startedAt: Date.now(),
        },
      };
    }

    case ACTIONS.UPDATE_TIME_REMAINING: {
      return {
        ...state,
        currentTimer: {
          ...state.currentTimer,
          timeRemaining: action.payload.timeRemaining,
        },
      };
    }

    case ACTIONS.START_TIMER: {
      return {
        ...state,
        currentTimer: {
          ...state.currentTimer,
          isRunning: true,
          startedAt: state.currentTimer.startedAt || Date.now(),
        },
      };
    }

    case ACTIONS.PAUSE_TIMER: {
      return {
        ...state,
        currentTimer: {
          ...state.currentTimer,
          isRunning: false,
        },
      };
    }

    case ACTIONS.STOP_TIMER: {
      return {
        ...state,
        currentTimer: initialState.currentTimer,
      };
    }

    case ACTIONS.SKIP_TIMER: {
      const newType = state.currentTimer.type === 'work' ? 'break' : 'work';
      const duration = newType === 'work' ? 25 * 60 : 5 * 60;
      return {
        ...state,
        currentTimer: {
          ...state.currentTimer,
          type: newType,
          timeRemaining: duration,
          isRunning: false,
          startedAt: null,
        },
      };
    }

    case ACTIONS.TRANSITION_TO_BREAK: {
      return {
        ...state,
        currentTimer: {
          ...state.currentTimer,
          type: 'break',
          timeRemaining: 5 * 60,
          isRunning: false,
          startedAt: null,
        },
      };
    }

    case ACTIONS.TRANSITION_TO_WORK: {
      return {
        ...state,
        currentTimer: {
          ...state.currentTimer,
          type: 'work',
          timeRemaining: 25 * 60,
          isRunning: false,
          startedAt: null,
        },
      };
    }

    case ACTIONS.COMPLETE_TIMER: {
      const timer = state.currentTimer;
      const completedAt = Date.now();

      if (timer.type === 'break') {
        const task = state.tasks.find((t) => t.id === timer.taskId);
        const breakSession =
          task && timer.taskId
            ? {
                id: action.payload.id,
                taskId: timer.taskId,
                subjectId: task.subjectId,
                startTime: timer.startedAt || completedAt - 5 * 60 * 1000,
                endTime: completedAt,
                duration: 5,
                type: 'break',
                completed: true,
                date: new Date().toISOString().split('T')[0],
              }
            : null;

        return {
          ...state,
          sessions: breakSession ? [...state.sessions, breakSession] : state.sessions,
          currentTimer: {
            ...timer,
            type: 'work',
            timeRemaining: 25 * 60,
            isRunning: false,
            startedAt: null,
          },
        };
      }

      const task = state.tasks.find((t) => t.id === timer.taskId);
      const today = new Date().toISOString().split('T')[0];
      const session =
        task && timer.taskId
          ? {
              id: action.payload.id,
              taskId: timer.taskId,
              subjectId: task.subjectId,
              startTime: timer.startedAt || completedAt - 25 * 60 * 1000,
              endTime: completedAt,
              duration: 25,
              type: 'work',
              completed: true,
              date: today,
            }
          : null;

      return {
        ...state,
        sessions: session ? [...state.sessions, session] : state.sessions,
        tasks: task
          ? state.tasks.map((t) => {
              if (t.id !== timer.taskId) return t;
              const completedSessions = t.completedSessions + 1;
              const isCompleted = completedSessions >= t.estimatedSessions;
              return {
                ...t,
                completedSessions,
                isCompleted,
                completedAt: isCompleted ? completedAt : null,
              };
            })
          : state.tasks,
        currentTimer: {
          ...timer,
          type: 'break',
          timeRemaining: 5 * 60,
          isRunning: true,
          startedAt: completedAt,
        },
      };
    }

    // ===== STREAK ACTIONS =====
    case ACTIONS.UPDATE_STREAK: {
      return {
        ...state,
        streakData: action.payload.streakData,
      };
    }

    // ===== LOAD STATE =====
    case ACTIONS.LOAD_STATE: {
      return {
        ...initialState,
        ...action.payload.state,
        currentTimer: {
          ...initialState.currentTimer,
          ...(action.payload.state.currentTimer || {}),
          isRunning: false,
          startedAt: null,
        },
      };
    }

    default:
      return state;
  }
}
