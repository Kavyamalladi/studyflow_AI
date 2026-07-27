import { useEffect, useRef, useState } from 'react';

/**
 * Countdown timer hook.
 * @param initialSeconds starting seconds
 * @param onExpire called when timer reaches 0
 * @param active whether timer is ticking
 */
export function useCountdown(initialSeconds: number, onExpire: () => void, active = true) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(initialSeconds);
    expiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (!active || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, remaining === initialSeconds, onExpire]); // only restart when reset

  const reset = (s?: number) => {
    expiredRef.current = false;
    setRemaining(s ?? initialSeconds);
  };

  return { remaining, reset, fraction: remaining / initialSeconds };
}

/** Format seconds as mm:ss */
export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
