import { useEffect } from 'react';
import { useAppState } from './useAppState';
import { ACTIONS } from '../reducer';

export function useStreak() {
  const { state, dispatch } = useAppState();
  const { streakData } = state;
  const sessions = state.sessions;

  // Update streak when a new session is completed
  useEffect(() => {
    if (sessions.length === 0) return;

    const lastSession = sessions[sessions.length - 1];
    const lastSessionDate = lastSession?.date;
    const studyDates = Array.from(new Set(sessions.filter((s) => s.type === 'work' && s.completed).map((s) => s.date))).sort();
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayKey = toDateKey(today);
    const yesterdayKey = toDateKey(yesterday);
    const startKey = studyDates.includes(todayKey)
      ? todayKey
      : studyDates.includes(yesterdayKey)
        ? yesterdayKey
        : null;

    let currentStreak = 0;
    let checkDate = startKey ? new Date(`${startKey}T00:00:00`) : null;

    while (checkDate && studyDates.includes(toDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let bestStreak = 0;
    let tempStreak = 0;
    let previousDate = null;

    for (const dateStr of studyDates) {
      const date = new Date(`${dateStr}T00:00:00`);
      if (previousDate && daysBetween(previousDate, date) === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
      previousDate = date;
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    const newStreakData = {
      currentStreak,
      bestStreak,
      lastStudyDate: lastSessionDate,
      studyDates,
    };

    if (
      newStreakData.currentStreak !== streakData.currentStreak ||
      newStreakData.bestStreak !== streakData.bestStreak ||
      newStreakData.lastStudyDate !== streakData.lastStudyDate ||
      newStreakData.studyDates.length !== streakData.studyDates.length
    ) {
      dispatch({ type: ACTIONS.UPDATE_STREAK, payload: { streakData: newStreakData } });
    }
  }, [dispatch, sessions, streakData.bestStreak, streakData.currentStreak, streakData.lastStudyDate, streakData.studyDates.length]);

  return streakData;
}

function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

function daysBetween(a, b) {
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}
