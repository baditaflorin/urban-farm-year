import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UserState } from '../features/garden/types';
import { loadUserState, resetUserState, saveUserState } from './storage';
import { defaultState } from './stateSchema';

export function useGardenStore() {
  const [state, setState] = useState<UserState>(defaultState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadUserState()
      .then((loaded) => {
        if (active) {
          setState(loaded);
          setReady(true);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load local garden data.');
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const updateState = useCallback((recipe: (current: UserState) => UserState) => {
    setState((current) => {
      const next = recipe(current);
      void saveUserState(next).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unable to save local garden data.');
      });
      return next;
    });
  }, []);

  const reset = useCallback(async () => {
    const next = await resetUserState();
    setState(next);
  }, []);

  return useMemo(
    () => ({ state, ready, error, updateState, reset }),
    [state, ready, error, updateState, reset],
  );
}
