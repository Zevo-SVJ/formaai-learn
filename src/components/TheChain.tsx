import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { CalendarDays } from "lucide-react";
import { glide, ramp, settle } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

/**
 * The problem, played out instead of asserted.
 *
 * The three lines describe a sequence in time - you open the lesson, you ask an
 * AI, the test arrives - and a sequence is the one thing three stacked cards
 * cannot convey.
 *
 * The first attempt at showing it drew the lesson as grey skeleton bars and
 * faded an answer in over them. Both were wrong. Grey bars are not a lesson, so
 * watching something land on them proves nothing; and a fade means the answer
 * never came from anywhere. Worse, the argument - that getting the answer left
 * the lesson exactly where it was - was never actually visible, because the
 * answer stayed on top of the page and the page was never seen again.
 *
 * So: a real lesson, in the student's own language. The answer rises from
 * behind it, covers it, and the date arrives. Then the answer leaves the way it
 * came, and the page is revealed underneath - unchanged, unread, exactly as
 * faint as it was ninety seconds earlier. That last move is the whole section.
 * Nothing is claimed; the page simply comes back the same.
 *
 * One clock drives every part, so no two of them can disagree about which beat
 * is being watched.
 */

const RUN_S = 6;
const PAD = 18;
const ROW = 22;
const LINES = ["l1", "l2", "k1", "l3", "l4"] as const;
const PAGE_H = PAD * 2 + LINES.length * ROW;
const STAGE_H = PAGE_H + 86;

/** Which caption is being watched. The beats are the sequence's own phases. */
const BEATS: Array<[number, number]> = [
  [0, 0.24],
  [0.26, 0.56],
  [0.58, 0.99],
];

export function TheChain() {
  const { raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const items = raw((d) => d.problem.items) as string[];
  const p = useMotionValue(0);

  // It runs only while it is on screen, and loops. Looping is honest here
  // because the sequence ends where it began - the answer leaves, and the page
  // is back to exactly its opening state - so a repeat undoes nothing the
  // viewer was shown.
  useEffect(() => {
    if (reduceMotion) {
      p.set(0.68);
      return;
    }
    if (!inView) return;
    // From the top each time the section is entered. Resuming from wherever it
    // was stopped would drop someone into the middle of a story whose first
    // beat is the one that sets up the other two.
    p.set(0);
    const c = animate(p, 1, { duration: RUN_S, ease: "linear", repeat: Infinity });
    return () => c.stop();
  }, [inView, reduceMotion, p]);

  return (
    <div ref={ref} className="mx-auto flex max-w-md flex-col items-center">
      <div className="relative w-full max-w-[300px]" style={{ height: STAGE_H }} aria-hidden>
        <Page />
        <Answer p={p} />
        <DueDate p={p} />
      </div>

      <div className="relative mt-8 h-12 w-full px-2 text-center">
        {items.slice(0, 3).map((line, i) => (
          <Caption key={i} index={i} text={line} p={p} />
        ))}
      </div>
    </div>
  );
}

/**
 * The lesson. It is the constant of the section: never highlighted, never
 * re-ordered, never touched, and just as faint at the end as at the start.
 */
function Page() {
  const { t } = useI18n();
  return (
    <div
      className="absolute inset-x-0 top-0 overflow-hidden rounded-[1.25rem] border border-border bg-card text-left shadow-[var(--shadow-soft)]"
      style={{ height: PAGE_H, padding: PAD }}
    >
      {LINES.map((id) => (
        <p
          key={id}
          className="truncate text-[11px] leading-[22px] text-muted-foreground/55"
          style={{ height: ROW }}
        >
          {t((d) => d.demo[id])}
        </p>
      ))}
    </div>
  );
}

/**
 * The answer.
 *
 * It rises from behind the page's lower edge, rests on top of it, and later
 * goes back the same way. It is never faded: it is behind the page, then in
 * front of it, and the page's own edge is what hides it - which is why the
 * reader believes it was somewhere before it arrived.
 */
function Answer({ p }: { p: MotionValue<number> }) {
  const { t } = useI18n();
  const rest = PAGE_H - 62;
  const hidden = PAGE_H + 8;

  const y = useTransform(p, (v) => {
    const inn = settle(ramp(v, 0.18, 0.36));
    const out = glide(ramp(v, 0.76, 0.92));
    return hidden + inn * (rest - hidden) - out * (rest - hidden);
  });

  return (
    // Clipped to the page. This is what makes the arrival mean anything: below
    // the page's lower edge the answer is not transparent, it is simply behind
    // the page, and the edge is what hides it.
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden rounded-[1.25rem]"
      style={{ height: PAGE_H }}
    >
      <motion.div
        style={{ y }}
        className="absolute inset-x-6 top-0 rounded-2xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-lift)]"
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
          <span className="truncate text-[14px] font-bold tracking-tight text-foreground">
            {t((d) => d.demo.answer)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * The test date, which arrives whatever anyone did with the lesson.
 *
 * A real date rather than a grey bar, formatted in the reader's own language -
 * the point of the beat is that a specific day is coming.
 */
function DueDate({ p }: { p: MotionValue<number> }) {
  const { locale } = useI18n();
  const label = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(
    new Date(Date.now() + 9 * 86_400_000),
  );

  // In from the right and back out the same way. It is clipped by the stage,
  // so it is offstage rather than invisible.
  const x = useTransform(p, (v) => {
    const inn = settle(ramp(v, 0.46, 0.62));
    const out = glide(ramp(v, 0.82, 0.94));
    // Wide enough to clear the stage: the pill is centred, so half the stage
    // plus its own half-width is the least that puts it properly offstage.
    const OFF = 260;
    return OFF - inn * OFF + out * OFF;
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden">
      <motion.div style={{ x }} className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-amber-600">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {label}
        </span>
      </motion.div>
    </div>
  );
}

/** Captions cut rather than fade: one that arrives with a flourish competes
 *  with the thing it is captioning. */
function Caption({ index, text, p }: { index: number; text: string; p: MotionValue<number> }) {
  const [start, end] = BEATS[index];
  const opacity = useTransform(p, (v) => (v >= start && v <= end ? 1 : 0));

  return (
    <motion.p
      style={{ opacity }}
      className="absolute inset-x-0 top-0 text-[15px] leading-snug text-foreground"
    >
      {text}
    </motion.p>
  );
}
