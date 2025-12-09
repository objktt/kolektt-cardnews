import { useState, useCallback, useRef, useEffect } from 'react';

interface UseHistoryOptions {
  maxHistory?: number;
  debounceMs?: number;
}

interface UseHistoryReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
}

export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions = {}
): UseHistoryReturn<T> {
  const { maxHistory = 50, debounceMs = 500 } = options;

  // Use refs to store history and index to avoid stale closures
  const historyRef = useRef<T[]>([initialState]);
  const historyIndexRef = useRef(0);
  
  // Current working state (may differ from history during edits)
  const [currentState, setCurrentState] = useState<T>(initialState);
  
  // Track canUndo/canRedo for UI
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Track the last committed state to avoid duplicate pushes
  const lastCommittedRef = useRef<string>(JSON.stringify(initialState));
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update can undo/redo flags
  const updateFlags = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  // Commit current state to history
  const commitToHistory = useCallback((stateToCommit: T) => {
    const stateStr = JSON.stringify(stateToCommit);

    // Don't commit if nothing changed since last commit
    if (stateStr === lastCommittedRef.current) {
      return;
    }

    lastCommittedRef.current = stateStr;

    // Remove any future states (redo history) when making a new change
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(stateToCommit);

    // Limit history size
    if (newHistory.length > maxHistory) {
      historyRef.current = newHistory.slice(-maxHistory);
      historyIndexRef.current = maxHistory - 1;
    } else {
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
    }

    updateFlags();
  }, [maxHistory, updateFlags]);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setCurrentState(prev => {
      const resolvedState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(prev)
        : newState;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Schedule commit to history
      debounceTimerRef.current = setTimeout(() => {
        commitToHistory(resolvedState);
      }, debounceMs);

      return resolvedState;
    });
  }, [commitToHistory, debounceMs]);

  const undo = useCallback(() => {
    // Clear any pending commit
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevState = historyRef.current[historyIndexRef.current];
      setCurrentState(prevState);
      lastCommittedRef.current = JSON.stringify(prevState);
      updateFlags();
    }
  }, [updateFlags]);

  const redo = useCallback(() => {
    // Clear any pending commit
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextState = historyRef.current[historyIndexRef.current];
      setCurrentState(nextState);
      lastCommittedRef.current = JSON.stringify(nextState);
      updateFlags();
    }
  }, [updateFlags]);

  const reset = useCallback((newState: T) => {
    // Clear any pending commit
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    historyRef.current = [newState];
    historyIndexRef.current = 0;
    setCurrentState(newState);
    lastCommittedRef.current = JSON.stringify(newState);
    updateFlags();
  }, [updateFlags]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
