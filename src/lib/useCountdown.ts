import { useEffect, useRef, useState } from 'react';

/**
 * Counts down from `seconds` while `active` is true, calling `onExpire` once
 * it hits 0. Pass a `resetKey` that changes (e.g. a word/section index) to
 * restart the timer for a new item without re-mounting the component.
 */
export function useCountdown(seconds: number, resetKey: unknown, onExpire: () => void, active = true) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setTimeLeft(seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (!active) return;
    if (timeLeft <= 0) {
      onExpireRef.current();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, active]);

  return timeLeft;
}
