// Shared relative-time formatter. Takes already-translated unit strings so the
// helper stays framework- and locale-agnostic; callers pass them from i18n.
export type RelativeTimeUnits = {
  justNow: string;
  min: string;
  h: string;
  d: string;
};

export function relativeTime(iso: string, units: RelativeTimeUnits): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.max(0, Math.floor((now - then) / 60000));
  if (diffMin < 1) return units.justNow;
  if (diffMin < 60) return `${diffMin} ${units.min}`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} ${units.h}`;
  const d = Math.floor(h / 24);
  return `${d} ${units.d}`;
}
