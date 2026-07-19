import { useEffect, useState } from 'react';

const PREFIX = 'missionfauj:';

function readStorage<T>(key: string, initial: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
}

/** useState backed by localStorage, namespaced under a fixed app prefix. */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial));

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode, quota) — state still works in-memory
    }
  }, [key, value]);

  return [value, setValue] as const;
}
