import { useEffect, useRef, useState } from "react";

/**
 * Animates a display number toward `target` over `durationMs`.
 * Great for counting up on mount.
 */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  const toRef = useRef(target);

  useEffect(() => {
    fromRef.current = value;
    toRef.current = target;
    startRef.current = null;

    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const v = fromRef.current + (toRef.current - fromRef.current) * eased;
      setValue(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}

/**
 * Slowly ticks a starting value up over real elapsed time,
 * synced across the session by an anchor date so it feels "live".
 */
export function useLiveTicker(base: number, perMinute: number, anchor = new Date("2026-07-01T00:00:00Z")) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 4000);
    return () => window.clearInterval(id);
  }, []);
  const elapsedMin = Math.max(0, (now - anchor.getTime()) / 60000);
  return Math.floor(base + elapsedMin * perMinute);
}
