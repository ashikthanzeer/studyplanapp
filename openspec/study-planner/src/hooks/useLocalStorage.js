import { useCallback } from 'react';

const STATE_KEY = 'appState';
const VERSION_KEY = 'appVersion';
const LEGACY_STATE_KEY = 'study-planner-state';
const APP_VERSION = '1.0.0';

export function saveStoredState(state) {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STATE_KEY, serialized);
    localStorage.setItem(VERSION_KEY, APP_VERSION);
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

export function loadStoredState() {
  try {
    const serialized = localStorage.getItem(STATE_KEY) || localStorage.getItem(LEGACY_STATE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

export function clearStoredState() {
  try {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(VERSION_KEY);
    localStorage.removeItem(LEGACY_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
}

export function useLocalStorage() {
  const saveState = useCallback((state) => {
    saveStoredState(state);
  }, []);

  const loadState = useCallback(() => {
    return loadStoredState();
  }, []);

  const clearState = useCallback(() => {
    clearStoredState();
  }, []);

  return { saveState, loadState, clearState };
}
