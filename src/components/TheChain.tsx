import { useEffect, useState } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

/**
 * The problem, played out.
 *
 * The version before this ran the story as a filmstrip: five shots in a row and
 * a camera panning across them. Every scene therefore left the same way and
 * arrived the same way, which is the definition of a slideshow - the movement
 * belonged to the camera, not to anything in the story.
 *
 * So there is no camera now. Each scene is an object with its own way of
 * arriving and leaving: the lesson drops away tilting, the chat rises, doubt
 * blooms from the point the answer left, the countdown swells, the grade falls
 * from above and settles. Beats are scripted with their own dwell rather than
 * ticked off a linear clock, which is what lets the ending accelerate.
 *
 * That acceleration is the whole third act. The test does not arrive as an
 * icon: one object stays on screen and tightens - the ring closes, the number
 * falls, the colour turns, and each beat is shorter than the last. Pressure is
 * made of rhythm here, not of symbols.
 */

/**
 * Departures accelerate away. `EASE.out` would have a scene drift off slowly,
 * which reads as reluctance; a scene that is finished should get out of the way.
 */
const EXIT: [number, number, number, number] = [0.4, 0, 1, 1];

type SceneName = "lesson" | "chat" | "clock" | "grade";

/** Every beat, and how long it holds. The countdown's shrink is deliberate. */
const BEATS: Array<{ scene: SceneName; ms: number }> = [
  { scene: "lesson", ms: 2000 }, // 0 the lesson, being read
  { scene: "chat", ms: 1000 }, // 1 the question, already sent
  { scene: "chat", ms: 1250 }, // 2 the answer lands
  { scene: "chat", ms: 950 }, // 3 it is taken away, and doubt takes its place
  { scene: "clock", ms: 950 }, // 4 the test, still far off
  { scene: "clock", ms: 720 }, // 5 closer
  { scene: "clock", ms: 540 }, // 6 closer
  { scene: "clock", ms: 400 }, // 7 tomorrow
  { scene: "clock", ms: 800 }, // 8 today. everything stops.
  { scene: "grade", ms: 1900 }, // 9 the grade
  { scene: "grade", ms: 600 }, // 10 a breath, then round again
];

/** Which line is being read, per beat. */
const CAPTION_OF = [0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3];

const STAGE_H = 236;

export function TheChain() {
  const { raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const items = raw((d) => d.problem.items) as string[];
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => setBeat((b) => (b + 1) % BEATS.length), BEATS[beat].ms);
    return () => window.clearTimeout(id);
  }, [beat, reduceMotion]);

  // Reduced motion is given the first beat and left there: a story told in
  // stills is still a story, and none of the others makes sense alone.
  const shown = reduceMotion ? 0 : beat;
  const scene = BEATS[shown].scene;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <div
        className="relative w-full max-w-[300px] overflow-hidden"
        style={{ height: STAGE_H }}
        aria-hidden
      >
        <Scene show={scene === "lesson"} away={AWAY.lesson}>
          <Lesson />
        </Scene>
        <Scene show={scene === "chat"} away={AWAY.chat}>
          <Chat beat={shown} />
        </Scene>
        <Scene show={scene === "clock"} away={AWAY.clock}>
          <Countdown beat={shown} />
        </Scene>
        <Scene show={scene === "grade"} away={AWAY.grade}>
          <Grade />
        </Scene>
      </div>

      <div className="relative mt-8 h-12 w-full px-2 text-center">
        {items.slice(0, 4).map((line, i) => (
          <Caption key={i} text={line} on={CAPTION_OF[shown] === i} />
        ))}
      </div>

      <p className="sr-only">{items.join(" ")}</p>
    </div>
  );
}

/**
 * Where each scene rests when it is not on screen.
 *
 * This is the whole character of a transition. A scene that arrives from below
 * and one that blooms from a point are two different events, and giving every
 * scene the same pose is exactly what made the filmstrip feel mechanical.
 */
const AWAY: Record<SceneName, TargetAndTransition> = {
  // Put down and pushed aside.
  lesson: { opacity: 0, y: 46, scale: 0.9, rotate: -5 },
  // Comes up the way a conversation does.
  chat: { opacity: 0, y: 60, scale: 0.95, rotate: 0 },
  // Swells into place, and shrinks back out of it.
  clock: { opacity: 0, y: 0, scale: 0.7, rotate: 0 },
  // Falls in from above, and is lifted back out.
  grade: { opacity: 0, y: -44, scale: 1.12, rotate: 0 },
};

/**
 * One scene at a time.
 *
 * The outgoing scene is fully gone before the incoming one starts, so two
 * screens are never laid over each other. Arrival is a spring - it is the
 * thing being watched, and it should settle rather than stop dead. Departure is
 * quicker and eased out: nothing is gained by dwelling on an exit.
 */
function Scene({
  show,
  away,
  children,
}: {
  show: boolean;
  away: TargetAndTransition;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-1"
      initial={false}
      animate={show ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : away}
      transition={
        show
          ? { type: "spring", stiffness: 210, damping: 26, delay: 0.3 }
          : { duration: 0.28, ease: EXIT }
      }
      style={{ pointerEvents: "none" }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------------------------------------- the shots */

const INK = "var(--color-border-strong)";

/**
 * The lesson, abstracted.
 *
 * Not a page of writing with the words taken out - that only ever looks like a
 * page waiting to load. It is the *structure* of a lesson: a margin, a heading,
 * a couple of rules, one worked expression and one figure, with air around
 * them. Enough to be recognised in a glance, and nothing to read.
 */
function Lesson() {
  return (
    <div className="w-full rounded-[1.5rem] border border-border bg-card px-5 py-6 shadow-[var(--shadow-soft)]">
      <svg viewBox="0 0 236 150" className="w-full" role="presentation">
        {/* The margin. One vertical line is what makes a surface a page. */}
        <line x1="22" y1="4" x2="22" y2="146" stroke={INK} strokeWidth="1" opacity="0.35" />

        {/* A heading, then two rules. Short: a lesson is not a paragraph. */}
        <rect
          x="40"
          y="8"
          width="78"
          height="6"
          rx="3"
          fill="var(--color-foreground)"
          opacity="0.3"
        />
        <rect x="40" y="30" width="164" height="3.5" rx="1.75" fill={INK} opacity="0.3" />
        <rect x="40" y="42" width="112" height="3.5" rx="1.75" fill={INK} opacity="0.3" />

        {/* One expression, built from shapes: two terms, an operator, a result. */}
        <g transform="translate(40 62)">
          <rect width="30" height="17" rx="5" fill={INK} opacity="0.32" />
          <rect x="38" y="7" width="12" height="3" rx="1.5" fill={INK} opacity="0.45" />
          <rect x="58" width="17" height="17" rx="5" fill={INK} opacity="0.32" />
          <rect x="83" y="5" width="13" height="2.5" rx="1.25" fill={INK} opacity="0.45" />
          <rect x="83" y="11" width="13" height="2.5" rx="1.25" fill={INK} opacity="0.45" />
          <rect x="104" width="24" height="17" rx="5" fill="var(--color-emerald)" opacity="0.28" />
        </g>

        {/* One figure. A right angle is read as geometry before it is read at all. */}
        <g transform="translate(40 96)">
          <path
            d="M2 46 L2 6 L52 46 Z"
            fill="none"
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.4"
          />
          <path d="M2 36 h10 v10" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.55" />
        </g>

        {/* Two more rules, set beside the figure so the page keeps its column. */}
        <rect x="118" y="104" width="86" height="3.5" rx="1.75" fill={INK} opacity="0.3" />
        <rect x="118" y="116" width="58" height="3.5" rx="1.75" fill={INK} opacity="0.3" />
      </svg>
    </div>
  );
}

/**
 * The other tool, and what it leaves behind.
 *
 * The answer rises into the window the way a reply actually lands, and is then
 * pulled back out - and the doubt grows from exactly the place it vacated,
 * rather than arriving as a symbol of its own. That is the point of the beat:
 * the question mark is what the answer left.
 */
function Chat({ beat }: { beat: number }) {
  const landed = beat >= 2;
  const gone = beat >= 3;

  return (
    <div className="w-full overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-border-strong/55" />
        <span className="h-2 w-2 rounded-full bg-border-strong/35" />
        <span className="h-2 w-2 rounded-full bg-border-strong/20" />
        <span className="ml-1.5 h-1.5 w-14 rounded-full bg-border-strong/30" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-end">
          <span className="flex w-[58%] flex-col gap-1.5 rounded-2xl rounded-br-md bg-surface-muted px-3 py-2.5">
            <span className="h-1.5 w-full rounded-full bg-border-strong/35" />
            <span className="h-1.5 w-2/3 rounded-full bg-border-strong/35" />
          </span>
        </div>

        <div className="relative h-[52px] overflow-hidden">
          {/* The answer. In from below, out the same way. */}
          <motion.div
            className="absolute inset-x-0 top-0 flex justify-start"
            initial={false}
            animate={{ y: landed && !gone ? 0 : 56, opacity: landed && !gone ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <span className="rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 text-[17px] font-bold tracking-tight text-foreground">
              x = 4
            </span>
          </motion.div>

          {/* What is left in its place. */}
          <motion.div
            className="absolute inset-x-0 top-0 flex justify-start"
            initial={false}
            animate={{ scale: gone ? 1 : 0.4, opacity: gone ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20, delay: gone ? 0.12 : 0 }}
            style={{ originX: 0.18, originY: 0.5 }}
          >
            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl border border-border bg-surface text-[22px] font-bold text-muted-foreground">
              ?
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * The test, closing in.
 *
 * One object for five beats. The ring closes, the number falls, the colour
 * turns and the whole thing tightens - and because each beat is shorter than
 * the one before, the pressure is felt in the rhythm rather than announced by
 * an icon. The last beat holds: the moment the clock runs out is the only
 * still one in the act.
 */
const DAYS = [9, 5, 2, 1, 0];
const R = 52;
const C = 2 * Math.PI * R;

function Countdown({ beat }: { beat: number }) {
  const step = Math.min(Math.max(beat - 4, 0), DAYS.length - 1);
  const days = DAYS[step];
  const closed = 1 - days / DAYS[0];
  const hot = step / (DAYS.length - 1);

  // Neutral while it is far off, amber as it nears, red on the day.
  const stroke =
    hot < 0.34
      ? "var(--color-border-strong)"
      : hot < 0.8
        ? "var(--color-amber-500, oklch(0.75 0.16 70))"
        : "var(--color-red-500, oklch(0.63 0.22 25))";
  const ink = hot < 0.34 ? "text-muted-foreground" : hot < 0.8 ? "text-amber-600" : "text-red-600";

  return (
    <motion.div
      className="relative flex h-[150px] w-[150px] items-center justify-center"
      initial={false}
      // It draws itself in a little tighter each time, then flinches on the day.
      animate={{ scale: step === DAYS.length - 1 ? 1.06 : 1 - step * 0.015 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
    >
      <svg viewBox="0 0 130 130" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="65" cy="65" r={R} fill="none" stroke="var(--color-border)" strokeWidth="5" />
        <motion.circle
          cx="65"
          cy="65"
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={false}
          animate={{ strokeDashoffset: C * (1 - closed) }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </svg>

      <div className="flex flex-col items-center gap-1">
        <CalendarDays className={`h-4 w-4 ${ink}`} />
        {/* An odometer, not a cross-fade. The digit is pushed up out of a slot
            by the next one - a counter that dissolves reads as a label being
            swapped, and what has to be felt here is something being spent. */}
        <span className="block h-[42px] overflow-hidden">
          <motion.span
            key={days}
            className={`block text-[40px] font-bold leading-[42px] tracking-tight ${ink}`}
            initial={{ y: 42 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            {days}
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
}

/** And what the answer was worth, when it was needed. */
function Grade() {
  return (
    <div className="relative flex flex-col items-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-full opacity-70 blur-2xl"
        style={{ background: "oklch(0.63 0.22 25 / 0.16)" }}
      />
      <span className="relative text-[68px] font-bold leading-none tracking-[-0.04em] text-red-600">
        6
      </span>
      <span className="relative mt-2 text-[15px] font-semibold text-muted-foreground">/ 20</span>
    </div>
  );
}

/** The lines cut rather than fade: one that arrives with a flourish competes
 *  with the thing it is there to accompany. */
function Caption({ text, on }: { text: string; on: boolean }) {
  return (
    <motion.p
      className="absolute inset-x-0 top-0 text-[15px] leading-snug text-foreground"
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={{ duration: 0.001 }}
    >
      {text}
    </motion.p>
  );
}
