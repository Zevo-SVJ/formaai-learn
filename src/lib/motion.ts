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
