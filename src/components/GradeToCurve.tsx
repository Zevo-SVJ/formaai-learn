import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { glide, ramp, settle } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

/**
 * The progress feature, demonstrated by the one gesture it is made of.
 *
 * The chart this replaces drew a curve when it came into view and stopped
 * there. A curve appearing is decoration: it says a chart exists, which nobody
 * doubted, and it says nothing at all about what the feature does or what the
 * student has to do to get it.
 *
 * The feature is: you enter one grade, and it becomes your progression. So that
 * is what happens here. The history draws itself first, and stops short - the
 * curve is visibly unfinished, waiting. Then the grade the student typed
 * travels down from the form into the plot area and shrinks until it *is* the
 * final point, its own digits clipped away by the shrinking box rather than
 * faded out. Only then does the last segment reach out and connect it, and the
 * average moves to take it into account.
 *
 * One object, one continuous transformation: the number you entered is the
 * point that extends the line. Nothing here fades, and no part of it can be
 * removed without the section stopping meaning anything.
 */

// A gentle upward grade curve, out of 20. The last value is the one the student
// is watched entering.
const SERIES = [8.5, 9, 10, 9.5, 11.5, 12, 13.2, 14.2];
const SUBJECT_AVGS = [15.4, 13.8, 12.6];

const W = 320;
const H = 150;
const P = 16;
const MAX = 20;

const PTS = SERIES.map((v, i) => {
  const x = P + (i * (W - 2 * P)) / (SERIES.length - 1);
  const y = H - P - (v / MAX) * (H - 2 * P);
  return [x, y] as const;
});
const LAST = PTS[PTS.length - 1];

const path = (pts: ReadonlyArray<readonly [number, number]>) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** The history: every point but the one being added. */
const HISTORY = path(PTS.slice(0, -1));
/** The segment that reaches out to the new grade. */
const JOIN = path(PTS.slice(-2));
// The fill is split at the same seam as the line. One area under the history,
// one wedge under the segment that reaches the new grade - because a fill that
// already covers the last segment gives away where the curve is going before
// the grade has landed, which is the one thing this section is withholding.
const PREV = PTS[PTS.length - 2];
const AREA = `${path(PTS.slice(0, -1))} L${PREV[0].toFixed(1)} ${H - P} L${PTS[0][0].toFixed(1)} ${H - P} Z`;
const AREA_JOIN = `M${PREV[0].toFixed(1)} ${PREV[1].toFixed(1)} L${LAST[0].toFixed(1)} ${LAST[1].toFixed(1)} L${LAST[0].toFixed(1)} ${H - P} L${PREV[0].toFixed(1)} ${H - P} Z`;

const RUN_S = 4.2;

export function GradeToCurve() {
  const { t, raw, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  // Watched from the wrapping div, never from an SVG child: an
  // IntersectionObserver on a <path> or <g> is unreliable, and a curve that
  // never gets its signal is a section that silently renders empty.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  const p = useMotionValue(0);

  const months = raw((d) => d.progressFeature.months) as string[];
  const subjects = raw((d) => d.progressFeature.subjects) as string[];

  // Let Intl pick the decimal separator, so every locale reads naturally
  // (14,2 in French, Spanish, German, Portuguese and Italian; 14.2 in English).
  const num = (n: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

  useEffect(() => {
    if (reduceMotion) {
      p.set(1);
      return;
    }
    if (!inView) return;
    const c = animate(p, 1, { duration: RUN_S, ease: "linear" });
    return () => c.stop();
  }, [inView, reduceMotion, p]);

  // The history draws, then waits. The gap between it finishing and the grade
  // arriving is deliberate: an unfinished curve is what makes the arrival read
  // as an arrival rather than as more decoration.
  const history = useTransform(p, (v) => glide(ramp(v, 0.04, 0.34)));
  const area = useTransform(p, (v) => glide(ramp(v, 0.26, 0.5)));
  const join = useTransform(p, (v) => glide(ramp(v, 0.66, 0.82)));
  const dot = useTransform(p, (v) => glide(ramp(v, 0.58, 0.68)));
  // A round line cap on a path of zero length is still painted, so an
  // undrawn curve leaves a dot sitting at its origin. These cut the paths in
  // at the instant their draw starts - a step, not a fade.
  const historyOn = useTransform(p, (v) => (v > 0.04 ? 1 : 0));
  const joinOn = useTransform(p, (v) => (v > 0.66 ? 1 : 0));

  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t((d) => d.progressFeature.title)}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {t((d) => d.progressFeature.body)}
          </p>
        </div>

        <div
          ref={ref}
          className="rounded-[1.75rem] border border-border bg-card p-5 shadow-[var(--shadow-lift)]"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t((d) => d.progressFeature.average)}
            </span>
            {/* The average is not written down and left there - it moves to the
                value the new grade produces, so the number is seen to be a
                consequence of the point that just landed. */}
            <Average p={p} format={num} />
          </div>

          <div className="relative mt-4" style={{ aspectRatio: `${W} / ${H}` }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="gtc-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-emerald)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--color-emerald)" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line
                x1={P}
                y1={H - P}
                x2={W - P}
                y2={H - P}
                stroke="var(--color-border)"
                strokeWidth="1"
              />

              {/* The fill grows up from the baseline rather than fading in: it
                  is the area under a line, so it should behave like one. */}
              <motion.path
                d={AREA}
                fill="url(#gtc-fill)"
                style={{ scaleY: area, originY: 1, originX: 0 }}
              />

              {/* Grows from the baseline with the segment above it, so the fill
                  never arrives anywhere the line has not been. */}
              <motion.path
                d={AREA_JOIN}
                fill="url(#gtc-fill)"
                style={{ scaleY: join, originY: 1, originX: 0 }}
              />

              <motion.path
                d={HISTORY}
                fill="none"
                stroke="var(--color-emerald)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pathLength: history, opacity: historyOn }}
              />

              <motion.path
                d={JOIN}
                fill="none"
                stroke="var(--color-emerald)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ pathLength: join, opacity: joinOn }}
              />

              {PTS.slice(0, -1).map(([x, y], i) => (
                <Point key={i} x={x} y={y} progress={history} at={(i + 0.6) / (PTS.length - 1)} />
              ))}

              <motion.circle
                cx={LAST[0]}
                cy={LAST[1]}
                r="4.5"
                fill="var(--color-emerald)"
                stroke="var(--color-card)"
                strokeWidth="2.5"
                style={{ scale: dot, originX: `${LAST[0]}px`, originY: `${LAST[1]}px` }}
              />
            </svg>

            {/* The grade, on its way to becoming that last point. */}
            <GradeTile p={p} label={num(SERIES[SERIES.length - 1])} />
          </div>

          <div className="mt-1 flex justify-between px-1 text-[10.5px] text-muted-foreground">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            {subjects.map((s, i) => (
              <SubjectRow key={s} p={p} index={i} label={s} value={SUBJECT_AVGS[i]} format={num} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The grade the student entered.
 *
 * It starts as a filled field above the chart and ends as the final point of
 * the curve - the same element throughout. Its digits are not faded away; the
 * box closes on them, which is why the point that remains is believably the
 * number that was there.
 */
function GradeTile({ p, label }: { p: MotionValue<number>; label: string }) {
  const travel = useTransform(p, (v) => settle(ramp(v, 0.42, 0.64)));

  // Positioned in percentages of the plot box, so it lands on the point at any
  // rendered size - the SVG scales, and nothing here is measured at runtime.
  // Starts in the chart's own empty upper area - above the curve, which is low
  // at that point - so it never collides with the average above the plot box.
  const START_L = 30;
  const START_T = 8;
  const endL = (LAST[0] / W) * 100;
  const endT = (LAST[1] / H) * 100;
  const left = useTransform(travel, (v) => `${START_L + v * (endL - START_L)}%`);
  const top = useTransform(travel, (v) => `${START_T + v * (endT - START_T)}%`);
  // The box holds its size for most of the journey and only closes at the end.
  // Shrinking from the first frame meant the grade was never legible in
  // flight - the reader saw a dot move, not a number becoming a point.
  const shut = useTransform(travel, (v) => glide(ramp(v, 0.66, 1)));
  const width = useTransform(shut, (v) => 62 - v * 53);
  const height = useTransform(shut, (v) => 28 - v * 19);
  const radius = useTransform(shut, (v) => 9 - v * 4.5);

  return (
    <motion.div
      style={{ left, top, width, height, borderRadius: radius, x: "-50%", y: "-50%" }}
      className="pointer-events-none absolute z-10 flex items-center justify-center overflow-hidden border border-emerald/40 bg-emerald-soft"
      aria-hidden
    >
      <span className="whitespace-nowrap text-[12px] font-bold text-emerald">{label}</span>
    </motion.div>
  );
}

/** A point of the history, uncovered as the line reaches it. */
function Point({
  x,
  y,
  progress,
  at,
}: {
  x: number;
  y: number;
  progress: MotionValue<number>;
  at: number;
}) {
  const scale = useTransform(progress, (v) => (v >= at ? 1 : 0));
  return (
    <motion.circle
      cx={x}
      cy={y}
      r="3"
      fill="var(--color-card)"
      stroke="var(--color-emerald)"
      strokeWidth="2"
      style={{ scale, originX: `${x}px`, originY: `${y}px` }}
    />
  );
}

/**
 * The overall average, moving to its new value.
 *
 * A number cannot be interpolated through a style, so this is the one place
 * that keeps React state - one small subscriber, redrawing one span.
 */
function Average({ p, format }: { p: MotionValue<number>; format: (n: number) => string }) {
  const from = 12.4;
  const to = 14.2;
  const count = useTransform(p, (v) => from + glide(ramp(v, 0.68, 0.94)) * (to - from));
  // Seeded from the value rather than from `from`: "change" only fires on a
  // change, so a clock that is already at its end - reduced motion, or a
  // remount after the run - would otherwise be stuck showing the old average
  // under a curve that has already taken the new grade into account.
  const [value, setValue] = useState(() => count.get());

  useMotionValueEvent(count, "change", setValue);

  return (
    <span className="text-[26px] font-bold leading-none tracking-tight text-foreground tabular-nums">
      {format(value)}
    </span>
  );
}

/** Per-subject averages, each bar growing from its own edge. */
function SubjectRow({
  p,
  index,
  label,
  value,
  format,
}: {
  p: MotionValue<number>;
  index: number;
  label: string;
  value: number;
  format: (n: number) => string;
}) {
  const start = 0.72 + index * 0.06;
  const grow = useTransform(p, (v) => glide(ramp(v, start, start + 0.2)) * (value / MAX));

  return (
    <div className="flex items-center gap-3">
      <span className="w-[86px] shrink-0 truncate text-[12px] text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
        <motion.div
          style={{ scaleX: grow, originX: 0 }}
          className="h-full w-full rounded-full bg-emerald/70"
        />
      </div>
      <span className="w-[34px] shrink-0 text-right text-[12px] font-semibold text-foreground tabular-nums">
        {format(value)}
      </span>
    </div>
  );
}
