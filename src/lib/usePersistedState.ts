import { useEffect, useRef, useState } from 'react';

const PREFIX = 'missionfauj:';
const MIGRATION_FLAG = 'storageScopeMigratedAt';

export function readPersisted<T>(key: string, initial: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
}

/**
 * useState backed by localStorage, namespaced under a fixed app prefix.
 *
 * The key is allowed to change at runtime: per-candidate state is stored under
 * a key scoped to the signed-in phone, so a different candidate signing in on
 * the same device re-points every one of these hooks at a different bucket.
 * When that happens the hook re-reads during render rather than in an effect,
 * so the persist effect below can never write the previous candidate's value
 * under the new candidate's key.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readPersisted(key, initial));
  const activeKey = useRef(key);

  if (activeKey.current !== key) {
    activeKey.current = key;
    setValue(readPersisted(key, initial));
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode, quota) — state still works in-memory
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/**
 * One-time upgrade for devices written before per-candidate state was scoped
 * by phone, when every candidate shared one flat set of keys. Moves those
 * values into the signed-in candidate's bucket and deletes the originals, so
 * the next candidate to sign in on this device cannot inherit them.
 *
 * `toScoped` is null when nobody is signed in at upgrade time. That data can't
 * be attributed to a phone, so it is deliberately left where it is — unread by
 * anything from here on — rather than guessed at and handed to whoever signs in
 * next. The flag is still set, making this strictly a one-shot: the cost is
 * that a candidate who happened to be signed out during the upgrade redoes
 * onboarding, which is the right trade against ever leaking one candidate's
 * profile to another.
 */
export function migrateUnscopedKeys(bareKeys: string[], toScoped: ((bare: string) => string) | null) {
  try {
    if (window.localStorage.getItem(PREFIX + MIGRATION_FLAG)) return;
    if (toScoped) {
      for (const bare of bareKeys) {
        const legacy = window.localStorage.getItem(PREFIX + bare);
        const scoped = toScoped(bare);
        if (legacy !== null && window.localStorage.getItem(PREFIX + scoped) === null) {
          window.localStorage.setItem(PREFIX + scoped, legacy);
        }
        window.localStorage.removeItem(PREFIX + bare);
      }
    }
    window.localStorage.setItem(PREFIX + MIGRATION_FLAG, new Date().toISOString());
  } catch {
    // storage unavailable — nothing to migrate, and nothing breaks without it
  }
}
