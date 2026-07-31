/**
 * Which one-time hints this student has already met.
 *
 * A hint is retired the moment the gesture it describes is performed, not when
 * it is acknowledged — someone who swipes straight away never needed telling,
 * and should not be told. Nothing here is ever shown twice.
 */

const PREFIX = "forma:hint:";

export const HINTS = {
  swipe: "swipe",
  openCard: "open-card",
  saveCard: "save-card",
  saveAnalysis: "save-analysis",
} as const;

export type HintId = (typeof HINTS)[keyof typeof HINTS];

const seen = new Set<HintId>();
const listeners = new Set<() => void>();
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  for (const id of Object.values(HINTS)) {
    try {
      if (window.localStorage.getItem(PREFIX + id)) seen.add(id);
    } catch {
      // Storage blocked: treat every hint as already seen rather than show
      // them on every single analysis.
      seen.add(id);
    }
  }
}

export function subscribeToHints(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasSeenHint(id: HintId): boolean {
  load();
  return seen.has(id);
}

export function markHintSeen(id: HintId) {
  load();
  if (seen.has(id)) return;
  seen.add(id);
  try {
    window.localStorage.setItem(PREFIX + id, "1");
  } catch {
    // It may show once more; harmless.
  }
  listeners.forEach((l) => l());
}
