import { useEffect, useCallback } from 'react';
import { useAppState } from './useAppState';
import { ACTIONS } from '../reducer';

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function useTimer() {
  const { state, dispatch } = useAppState();
  const timer = state.currentTimer;

  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      const newTime = timer.timeRemaining - 1;
      
      if (newTime <= 0) {
        clearInterval(interval);
        playNotificationSound();
        showNotification(timer.type);
        dispatch({ type: ACTIONS.COMPLETE_TIMER, payload: { id: createId() } });
      } else {
        dispatch({ type: ACTIONS.UPDATE_TIME_REMAINING, payload: { timeRemaining: newTime } });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, timer.isRunning, timer.timeRemaining, timer.type]);

  const startTimer = useCallback(() => {
    dispatch({ type: ACTIONS.START_TIMER });
  }, [dispatch]);

  const pauseTimer = useCallback(() => {
    dispatch({ type: ACTIONS.PAUSE_TIMER });
  }, [dispatch]);

  const stopTimer = useCallback(() => {
    dispatch({ type: ACTIONS.STOP_TIMER });
  }, [dispatch]);

  const skipTimer = useCallback(() => {
    dispatch({ type: ACTIONS.SKIP_TIMER });
  }, [dispatch]);

  const setTimer = useCallback((taskId, timerType = 'work') => {
    dispatch({ type: ACTIONS.SET_TIMER, payload: { taskId, type: timerType } });
  }, [dispatch]);

  const startTaskTimer = useCallback((taskId) => {
    dispatch({ type: ACTIONS.START_TASK_TIMER, payload: { taskId } });
  }, [dispatch]);

  const resetToWork = useCallback(() => {
    dispatch({ type: ACTIONS.SET_TIMER, payload: { taskId: timer.taskId, type: 'work' } });
  }, [dispatch, timer.taskId]);

  return {
    timer,
    workSeconds: WORK_SECONDS,
    breakSeconds: BREAK_SECONDS,
    startTimer,
    pauseTimer,
    stopTimer,
    skipTimer,
    setTimer,
    startTaskTimer,
    resetToWork,
  };
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch {
    console.log('Timer completed');
  }
}

function showNotification(type) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const title = type === 'work' ? 'Focus session complete' : 'Break complete';
  const body = type === 'work' ? 'Nice work. Take a 5 minute break.' : 'Ready for another study session?';
  new Notification(title, { body });
}
