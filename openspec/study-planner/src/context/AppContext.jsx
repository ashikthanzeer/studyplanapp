import { useReducer, useEffect } from 'react';
import { appReducer, initialState } from '../reducer';
import { loadStoredState, useLocalStorage } from '../hooks/useLocalStorage';
import { AppContext } from './AppContextValue';

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState, getInitialState);
  const { saveState } = useLocalStorage();

  useEffect(() => {
    saveState(state);
  }, [state, saveState]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

function getInitialState() {
  const savedState = loadStoredState();
  if (!savedState) return initialState;
  return appReducer(initialState, { type: 'LOAD_STATE', payload: { state: savedState } });
}
