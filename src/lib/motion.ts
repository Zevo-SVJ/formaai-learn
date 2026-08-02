/**
 * Canonical motion tokens.
 *
 * One easing family and one duration scale, so every transition in the app
 * reads as part of the same system. Prefer these over inline cubic-bezier
 * arrays or framer's string easings ("easeOut", "easeInOut") for entrances and
 * state changes. Continuous ambient loops (breathing, marquees) may still use
 * "easeInOut"/"linear" — they are a different category, not part of this scale.
 */

type Bezier = [number, number, number, number];

/** Cubic-bezier easing curves. */
export const EASE = {
  /** Decelerating "house" curve. Entrances, reveals, and most transitions. */
  out: [0.2, 0.8, 0.2, 1] as Bezier,
  /** Symmetric curve. Reversible states, exits, sheets, shape morphs. */
  inOut: [0.4, 0, 0.2, 1] as Bezier,
};

/**
 * Easing for sequences driven by a single 0..1 clock.
 *
 * The landing demonstrations run every part of a story off one motion value
 * rather than off a transition per element, so they need easing as plain
 * functions rather than as bezier arrays handed to framer.
 *
 * Two curves, and the choice between them is not cosmetic:
 *
 * `glide` is monotonic. Use it for anything being drawn, swept, scrubbed or
 * withdrawn — a curve drawing itself must never overshoot its own end, and
 * anything tied to scroll position must not wobble when the reader scrubs
 * backwards.
 *
 * `settle` overshoots by a few percent and comes back. Use it only where an
 * object arrives somewhere and stops. Apple's motion is built on physics-based
 * models for exactly this reason: a real object does not halt dead on its mark,
 * and the difference between "moved there" and "landed there" is most of what
 * separates motion that feels considered from motion that feels computed.
 */

/** Clamped 0..1 position of `v` within the window `from`..`to`. */
export const ramp = (v: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (v - from) / (to - from)));

/** Decelerating, never exceeds 1. Draws, sweeps, exits, scroll-scrubbed motion. */
export const glide = (v: number) => 1 - Math.pow(1 - v, 3);

/** Decelerating with a small overshoot, then settles. Arrivals only. */
export const settle = (v: number) => {
  const c1 = 0.9;
  const t = v - 1;
  return 1 + (c1 + 1) * t * t * t + c1 * t * t;
};

/** Duration scale, in seconds. */
export const DUR = {
  /** Micro: scrims, quick fades, small toggles. */
  xs: 0.2,
  /** Small elements, list items, staggered rows. */
  sm: 0.3,
  /** Standard element entrance / swap. */
  md: 0.4,
  /** Section reveals, hero, panels. */
  lg: 0.5,
  /** Larger, slower reveals. */
  xl: 0.6,
} as const;
