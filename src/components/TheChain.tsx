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
import { glide, ramp } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

/**
 * The problem, told as a sequence of shots.
 *
 * Earlier versions stacked the story in one frame: a page, an answer laid over
 * it, a date below. Everything shared the same space, so nothing ever really
 * happened - the frame just accumulated. It read as a diagram of the problem
 * rather than the problem occurring.
 *
 * This is a filmstrip. Five shots sit side by side and the strip slides; one
 * shot at a time is on screen, and each is pushed out by the next. Nothing
 * overlaps because nothing shares a cell, nothing fades because everything
 * arrives and leaves by moving, and the answer disappearing is not an effect -
 * it is simply carried off screen when the strip moves on.
 *
 * The lesson is drawn rather than written: rules, a sketch, an equation made of
 * shapes. A visitor should not have to read a word of it to know it is a
 * lesson, and any real sentence there would be a sentence competing with the
 * caption underneath.
 */

const SHOTS = 5;
const RUN_S = 11;
const STAGE_H = 236;

/** Each shot holds, then hands over. The hold is most of the beat. */
const HOLD = 0.62;

export function TheChain() {
  const { raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const items = raw((d) => d.problem.items) as string[];
  const p = useMotionValue(0);

  useEffect(() => {
    if (reduceMotion) {
      p.set(0.1);
      return;
    }
    if (!inView) return;
    // From the top on every entry: the first shot is what makes the other four
    // mean anything.
    p.set(0);
    const c = animate(p, 1, { duration: RUN_S, ease: "linear", repeat: Infinity });
    return () => c.stop();
  }, [inView, reduceMotion, p]);

  // Where the strip is, in shots. Whole numbers are a shot at rest; the
  // fractional part is the hand-over to the next one.
  const pos = useTransform(p, (v) => {
    const at = Math.min(v, 0.9999) * SHOTS;
    const i = Math.floor(at);
    return i + glide(ramp(at - i, HOLD, 1));
  });
  // The track is one shot wide - the other four overflow it - so a percentage
  // here is a percentage of a single shot, and one whole shot is 100%. Dividing
  // by the shot count would be right for a track as wide as the strip, which
  // this deliberately is not: sizing the track to its contents would make each
  // cell's width depend on the track's, and the cells are what define it.
  const x = useTransform(pos, (v) => `${-v * 100}%`);

  return (
    <div ref={ref} className="mx-auto flex max-w-md flex-col items-center">
      {/* The window the strip runs behind. Its edges are what make a shot
          leave rather than vanish. */}
      <div
        className="relative w-full max-w-[300px] overflow-hidden"
        style={{ height: STAGE_H }}
        aria-hidden
      >
        <motion.div style={{ x }} className="flex h-full">
          <Shot>
            <Lesson />
          </Shot>
          <Shot>
            <Chat p={p} />
          </Shot>
          <Shot>
            <Puzzled />
          </Shot>
          <Shot>
            <ExamDate />
          </Shot>
          <Shot>
            <BadGrade />
          </Shot>
        </motion.div>
      </div>

      <div className="relative mt-8 h-12 w-full px-2 text-center">
        {items.slice(0, 3).map((line, i) => (
          <Caption key={i} index={i} text={line} pos={pos} />
        ))}
      </div>
    </div>
  );
}

/** One cell of the strip: exactly the width of the window, never sharing. */
function Shot({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full shrink-0 items-center justify-center px-1">{children}</div>
  );
}

/* ------------------------------------------------------------------ shots */

/** A bar of "writing". Length is the only thing that varies. */
function Rule({ w, dark = false }: { w: number; dark?: boolean }) {
  return (
    <span
      className={`block h-1.5 rounded-full ${dark ? "bg-foreground/35" : "bg-border-strong/40"}`}
      style={{ width: `${w}%` }}
    />
  );
}

/**
 * The lesson, drawn: a heading, some rules, a sketch and an equation built from
 * shapes. No sentence appears, so nothing here competes with the caption.
 */
function Lesson() {
  return (
    <div className="w-full rounded-[1.25rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <span className="mb-4 block h-2 w-20 rounded-full bg-foreground/45" />
      <div className="flex flex-col gap-2.5">
        <Rule w={96} />
        <Rule w={78} />
      </div>

      <div className="mt-4 flex items-end gap-4">
        {/* A sketch: axes and a line going up. */}
        <svg viewBox="0 0 68 46" className="h-[46px] w-[68px] shrink-0">
          <path
            d="M4 2 V42 H66"
            fill="none"
            stroke="var(--color-border-strong)"
            strokeWidth="1.5"
          />
          <path
            d="M8 34 L24 28 L40 30 L60 12"
            fill="none"
            stroke="var(--color-emerald)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
        </svg>

        {/* An equation, as shapes: two terms, a sign, a result. */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="h-4 w-7 rounded-md bg-border-strong/45" />
          <span className="h-[2px] w-2 rounded bg-foreground/30" />
          <span className="h-4 w-4 rounded-md bg-border-strong/45" />
          <span className="flex h-3 w-3 flex-col justify-between">
            <span className="h-[2px] w-full rounded bg-foreground/30" />
            <span className="h-[2px] w-full rounded bg-foreground/30" />
          </span>
          <span className="h-4 w-6 rounded-md bg-border-strong/45" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <Rule w={88} />
        <Rule w={62} />
      </div>
    </div>
  );
}

/**
 * The other tool. A window, the question already asked, and the answer sliding
 * up into it from below - the way a reply actually arrives in a chat, and the
 * one motion in this shot that is not the strip itself.
 */
function Chat({ p }: { p: MotionValue<number> }) {
  // This shot owns the second beat of five. The reply lands once the strip has
  // settled on it, so the arrival is never competing with the hand-over.
  const rise = useTransform(p, (v) => {
    const at = v * SHOTS - 1;
    return glide(ramp(at, 0.12, 0.42));
  });
  const y = useTransform(rise, (v) => 54 - v * 54);

  return (
    <div className="w-full overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-border-strong/60" />
        <span className="h-2 w-2 rounded-full bg-border-strong/40" />
        <span className="h-2 w-2 rounded-full bg-border-strong/25" />
        <span className="ml-1.5 h-1.5 w-16 rounded-full bg-border-strong/35" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* The question, already sent. */}
        <div className="flex justify-end">
          <span className="flex w-[62%] flex-col gap-1.5 rounded-2xl rounded-br-md bg-surface-muted px-3 py-2.5">
            <Rule w={100} />
            <Rule w={64} />
          </span>
        </div>

        {/* The reply, arriving. */}
        <div className="h-[46px] overflow-hidden">
          <motion.div style={{ y }} className="flex justify-start">
            <span className="rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 text-[17px] font-bold tracking-tight text-foreground">
              x = 4
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** What is left once the answer has been carried off: nothing to hold on to. */
function Puzzled() {
  return (
    <div className="flex h-[150px] w-full items-center justify-center">
      <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full border border-border bg-card text-[46px] font-bold text-muted-foreground/70 shadow-[var(--shadow-soft)]">
        ?
      </span>
    </div>
  );
}

/** The date arrives whatever anyone did with the lesson. */
function ExamDate() {
  const { locale } = useI18n();
  const label = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(
    new Date(Date.now() + 9 * 86_400_000),
  );
  return (
    <span className="inline-flex items-center gap-2.5 rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-3.5 text-[15px] font-bold text-red-600">
      <CalendarDays className="h-4.5 w-4.5 shrink-0" />
      {label}
    </span>
  );
}

/** And the result of having had the answer without the lesson. */
function BadGrade() {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[52px] font-bold leading-none tracking-tight text-red-600">6</span>
      <span className="text-[15px] font-semibold text-muted-foreground">/ 20</span>
    </div>
  );
}

/* --------------------------------------------------------------- captions */

/** Three lines over five shots. They cut rather than fade: a caption that
 *  arrives with a flourish competes with the thing it is captioning. */
const CAPTION_OF = [0, 1, 2, 2, 2];

function Caption({ index, text, pos }: { index: number; text: string; pos: MotionValue<number> }) {
  const opacity = useTransform(pos, (v) => (CAPTION_OF[Math.round(v)] === index ? 1 : 0));

  return (
    <motion.p
      style={{ opacity }}
      className="absolute inset-x-0 top-0 text-[15px] leading-snug text-foreground"
    >
      {text}
    </motion.p>
  );
}
