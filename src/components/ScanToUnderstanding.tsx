import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

/**
 * The hero's one moving thing: a lesson being read.
 *
 * The hero used to stage three fades - a title, a paragraph, a row of subjects,
 * each arriving a beat after the last. Nothing was shown, only announced, and a
 * visitor who read no text learned nothing at all about the product.
 *
 * This says the whole thing without a word: a page of notes sits there, faint
 * and unreadable, a band of light passes down it, and everything it has passed
 * is sharp - with the line that carries the method picked out. Point it at your
 * lesson, and it understands it.
 *
 * It runs once. Looping would mean wiping the page back to unreadable in front
 * of the visitor in order to play again, unsaying the claim every few seconds -
 * a page that has been read stays read.
 *
 * Every line's state derives from one value, so the sweep and what it reveals
 * can never disagree - and the transforms are written as functions, which keeps
 * them off framer's WAAPI path and on the same clock as the band itself.
 */

const PAD = 20;
const TITLE_H = 26;
const ROW = 26;
const LINES = ["l1", "l2", "k1", "l3", "l4", "l5", "l7"] as const;
const KEY = 2;
const SHEET_H = PAD * 2 + TITLE_H + LINES.length * ROW;

/** Slow enough to be watched, short enough to be over before the CTA is read. */
const SWEEP_S = 2.6;

export function ScanToUnderstanding() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const sweep = useMotionValue(0);
  const started = useRef(false);

  useEffect(() => {
    if (reduceMotion || started.current) return;
    started.current = true;
    const controls = animate(sweep, 1, {
      duration: SWEEP_S,
      // Reads quickly at first and eases off, the way attention actually moves
      // down a page.
      ease: [0.4, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [sweep, reduceMotion]);

  // The band arrives and leaves rather than switching on and off, and is gone
  // by the foot of the page - what stays behind is the read page, not the tool
  // that read it.
  const bandY = useTransform(sweep, (v) => PAD + TITLE_H + v * (SHEET_H - PAD - TITLE_H) - 34);
  const bandOpacity = useTransform(sweep, (v) =>
    v < 0.06 ? v / 0.06 : v > 0.9 ? Math.max(0, (1 - v) / 0.1) : 1,
  );

  return (
    // Left-aligned on purpose: the hero centres its text, and a page of notes
    // that inherited that would stop looking like a page of notes.
    <div
      className="relative mx-auto w-full max-w-[330px] text-left"
      style={{ height: SHEET_H }}
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-lift)]">
        <div style={{ padding: PAD }}>
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            style={{ height: TITLE_H }}
          >
            {t((d) => d.demo.lesson)}
          </div>
          {LINES.map((id, i) => (
            <Line key={id} id={id} index={i} sweep={sweep} still={Boolean(reduceMotion)} />
          ))}
        </div>

        {!reduceMotion && (
          <motion.div
            style={{ y: bandY, opacity: bandOpacity }}
            className="pointer-events-none absolute inset-x-0 top-0 h-[68px]"
          >
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, oklch(0.94 0.05 155 / 0.5) 55%, oklch(0.86 0.09 155 / 0.9) 100%)",
              }}
            />
            <div className="h-px w-full bg-emerald/60" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Line({
  id,
  index,
  sweep,
  still,
}: {
  id: (typeof LINES)[number];
  index: number;
  sweep: MotionValue<number>;
  still: boolean;
}) {
  const { t } = useI18n();
  // The band's leading edge is what reads a line, so a line turns over just
  // before the sweep's nominal position reaches it.
  const at = (index + 0.5) / LINES.length;
  const read = (v: number) => Math.min(1, Math.max(0, (v - (at - 0.1)) / 0.16));

  const opacity = useTransform(sweep, (v) => 0.34 + read(v) * 0.66);
  const filter = useTransform(sweep, (v) => `blur(${(1 - read(v)) * 1.4}px)`);
  const color = useTransform(sweep, (v) =>
    index === KEY && read(v) > 0.5 ? "var(--color-foreground)" : "var(--color-muted-foreground)",
  );
  const mark = useTransform(sweep, (v) => (index === KEY ? read(v) : 0));
  const markOpacity = useTransform(mark, (v) => v);
  const markScale = useTransform(mark, (v) => 0.6 + v * 0.4);

  if (still) {
    return (
      <div className="relative" style={{ height: ROW }}>
        <p className="truncate text-[11.5px] leading-[26px] text-muted-foreground">
          {t((d) => d.demo[id])}
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: ROW }}>
      {index === KEY && (
        <motion.span
          style={{ opacity: markOpacity, scaleX: markScale }}
          className="absolute inset-x-[-6px] inset-y-[2px] origin-left rounded-md bg-emerald-soft"
        />
      )}
      <motion.p
        style={{ opacity, filter, color }}
        className="relative truncate text-[11.5px] font-medium leading-[26px]"
      >
        {t((d) => d.demo[id])}
      </motion.p>
    </div>
  );
}
