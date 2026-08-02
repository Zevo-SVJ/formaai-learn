import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { Check, GraduationCap, Layers, ListChecks, TrendingUp } from "lucide-react";
import { Phone } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import { sectionIcon } from "@/components/AnalysisCards";
import { useI18n } from "@/hooks/useI18n";

/**
 * The difference, told rather than tabulated.
 *
 * The section used to be a two-column comparison. A comparison is a claim about
 * behaviour, and a table is the one form that cannot show behaviour: both sides
 * simply sit there being asserted at the reader.
 *
 * So it is a story on the same phone the section above uses. One question is
 * asked, twice. The other tool answers it and stops - and the stopping is
 * drawn, as a rule closing the thread with nothing underneath it and a screen
 * that goes quiet. Then Forma is opened with the same question still on it, and
 * the answer is only the first of four things that arrive: the answer, why it
 * works, what people get wrong, and one case to try. They build in front of the
 * reader, one after another, until the last one lands and the thing is
 * understood.
 *
 * That the question is the *same* question on both screens is the whole
 * argument. Without it these are two demos; with it they are two answers to one
 * ask, and the reader can see which one was finished.
 */

/** Departures accelerate away; a scene that is finished should get out of the way. */
const EXIT: [number, number, number, number] = [0.4, 0, 1, 1];

type SceneName = "other" | "forma";

/**
 * The beat the camera pulls back on.
 *
 * Everything before it is the comparison, on the phone, unchanged. Everything
 * after is the same phone made small: it is not swapped for another scene,
 * because the point being made is that all of this grew out of the thing just
 * watched. A cut here would say "and here is another product".
 */
const OPEN_AT = 8;

/**
 * The pull-back, in numbers.
 *
 * The phone is 332 tall in its frame and the stage is 344, so it sits 6 from
 * the top and its centre is at 172. Scaling happens about that centre, so the
 * lift is what puts the small phone's centre near the top of the stage and
 * frees the space underneath.
 */
const PHONE_TOP = 6;
const OPEN_SCALE = 0.44;
const OPEN_LIFT = -99;

const BEATS: Array<{ scene: SceneName; ms: number }> = [
  { scene: "other", ms: 1200 }, // 0 asked, and answered
  { scene: "other", ms: 1450 }, // 1 and that is the end of it
  { scene: "forma", ms: 950 }, // 2 Forma, with the same question still on it
  { scene: "forma", ms: 720 }, // 3 the answer
  { scene: "forma", ms: 720 }, // 4 why it works
  { scene: "forma", ms: 720 }, // 5 what people get wrong
  { scene: "forma", ms: 780 }, // 6 one case to try
  { scene: "forma", ms: 1150 }, // 7 and it lands
  { scene: "forma", ms: 880 }, // 8 the camera pulls back
  { scene: "forma", ms: 820 }, // 9 practised, until it is known
  { scene: "forma", ms: 820 }, // 10 kept, as something to revise from
  { scene: "forma", ms: 820 }, // 11 pitched at the student in front of it
  { scene: "forma", ms: 1600 }, // 12 and carried on, week after week
  { scene: "forma", ms: 700 }, // 13 a breath, then round again
];

/** Which of the three lines is being read. */
const CAPTION_OF = [0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2];

/**
 * How far Forma's thread has been scrolled, per beat.
 *
 * The screen is a window on something longer than itself. Scrolling rather than
 * swapping is the point: the reader is not shown five features, they are shown
 * one conversation that has not finished, and the scroll is the evidence there
 * is more below.
 */
const SCROLL_AT = [0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 118, 202, 202];

const STAGE_H = 344;

export function HandoverStory() {
  const { raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const beats = raw((d) => d.compare.beats) as string[];
  const [beat, setBeat] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  // Half of it has to be on screen. A nine-beat story that starts as the
  // section's first pixel appears is already told by the time it is watched.
  const inView = useInView(ref, { amount: 0.5 });

  useEffect(() => {
    if (!inView) setBeat(0);
  }, [inView]);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const id = window.setTimeout(() => setBeat((b) => (b + 1) % BEATS.length), BEATS[beat].ms);
    return () => window.clearTimeout(id);
  }, [beat, inView, reduceMotion]);

  // Reduced motion is given the end of the second half: the state the section
  // exists to show is the one where everything has been built.
  const shown = reduceMotion ? 12 : beat;
  const scene = BEATS[shown].scene;

  return (
    <div ref={ref} className="mx-auto flex max-w-md flex-col items-center">
      <div
        className="relative w-full max-w-[300px] overflow-hidden"
        style={{ height: STAGE_H }}
        aria-hidden
      >
        <Scene show={scene === "other"} away={AWAY.other}>
          <Phone dark>
            <OtherScreen beat={shown} />
          </Phone>
        </Scene>
        <Scene show={scene === "forma"} away={AWAY.forma}>
          <FormaAct beat={shown} />
        </Scene>
      </div>

      {/* Both journeys at once, at a glance - which is what the phone alone
          cannot do, since it can only ever be showing one of them. */}
      <Fork beat={shown} />

      <div className="relative mt-6 h-8 w-full px-2 text-center">
        {beats.slice(0, 3).map((line, i) => (
          <Caption key={i} text={line} on={CAPTION_OF[shown] === i} />
        ))}
      </div>

      <p className="sr-only">{beats.join(" ")}</p>
    </div>
  );
}

/** Where each scene rests when it is off screen - the character of its transition. */
const AWAY: Record<SceneName, TargetAndTransition> = {
  // Put down, finished with.
  other: { opacity: 0, y: 44, scale: 0.93, rotate: -4 },
  // Picked up the way a phone is picked up.
  forma: { opacity: 0, y: 60, scale: 0.95, rotate: 0 },
};

/** One scene at a time: the outgoing one is gone before the incoming one starts. */
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
      className="absolute inset-0 flex items-center justify-center"
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

/* -------------------------------------------------------------------- fork */

/**
 * One line, forking.
 *
 * This is what makes the difference legible in the first seconds rather than
 * at the end. It is deliberately not two tracks drawn side by side: it is a
 * single thread that starts at the question and splits, so the two paths are
 * visibly the same journey taken differently.
 *
 * The upper branch is drawn almost immediately, reaches one stop, and is capped
 * - and then never moves again for the rest of the run. The lower branch keeps
 * being drawn, stop after stop, and is still being drawn when everything else
 * on screen has stopped. Nothing says which is better; one of them is simply
 * still going.
 */
const STOPS = [100, 128, 156, 184, 212, 240, 268];

function Fork({ beat }: { beat: number }) {
  const capped = beat >= 1;
  // The lower branch advances one stop per beat once Forma has the question.
  const reached = Math.max(0, Math.min(STOPS.length, beat - 6));
  const drawn = reached === 0 ? 0.34 : 0.34 + (reached / STOPS.length) * 0.66;

  return (
    <svg viewBox="0 0 300 54" className="mt-5 w-full max-w-[300px]" aria-hidden>
      <defs>
        {/* The lower branch is not cut off at the edge, it runs out of frame. */}
        <linearGradient id="hs-run" x1="0" x2="1">
          <stop offset="0.86" stopColor="var(--color-emerald)" />
          <stop offset="1" stopColor="var(--color-emerald)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Shared: the question, and the moment before the split. */}
      <circle cx="8" cy="27" r="3.5" fill="var(--color-foreground)" opacity="0.45" />
      <path
        d="M8 27 H40"
        stroke="var(--color-border-strong)"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />

      {/* The branch that ends. */}
      <motion.g
        initial={false}
        animate={{ opacity: capped ? 0.32 : 0.6 }}
        transition={{ duration: 0.7, delay: capped ? 0.3 : 0 }}
      >
        <motion.path
          d="M40 27 C58 27 56 11 74 11 H104"
          stroke="var(--color-border-strong)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        <circle cx="86" cy="11" r="3.5" fill="var(--color-border-strong)" />
        {/* The cap. A line that stops without one has merely not arrived yet. */}
        <motion.path
          d="M106 4 V18"
          stroke="var(--color-border-strong)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: capped ? 1 : 0, opacity: capped ? 1 : 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        />
      </motion.g>

      {/* The branch that keeps going. */}
      <motion.path
        d="M40 27 C58 27 56 43 74 43 H298"
        stroke="url(#hs-run)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: drawn }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      />
      {STOPS.map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="43"
          r="3.5"
          fill="var(--color-emerald)"
          initial={false}
          animate={{ scale: i < reached ? 1 : 0, opacity: i < reached ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          style={{ originX: `${x}px`, originY: "43px" }}
        />
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------- screens */

/** The question, drawn the same way on both screens - which is what makes the
 *  two halves one comparison rather than two demonstrations. */
function Question({ dark }: { dark: boolean }) {
  return (
    <span
      className={[
        "flex w-[76%] flex-col gap-[5px] rounded-[12px] rounded-br-[4px] px-2.5 py-2",
        dark ? "bg-neutral-700/80" : "bg-surface-muted",
      ].join(" ")}
    >
      <span
        className={`h-[4px] w-full rounded-full ${dark ? "bg-neutral-500" : "bg-border-strong/45"}`}
      />
      <span
        className={`h-[4px] w-3/5 rounded-full ${dark ? "bg-neutral-500" : "bg-border-strong/45"}`}
      />
    </span>
  );
}

/**
 * The other tool: it answers, and then it is done.
 *
 * The second beat is the argument, and it is made by nothing arriving. A rule
 * draws itself across the thread with empty screen beneath it, and the whole
 * conversation goes quiet - so the reader is looking at a finished exchange
 * rather than at a screen that merely has not loaded yet.
 */
function OtherScreen({ beat }: { beat: number }) {
  const done = beat >= 1;

  return (
    <motion.div
      className="flex h-full flex-col"
      initial={false}
      animate={{ opacity: done ? 0.55 : 1 }}
      transition={{ duration: 0.6, delay: done ? 0.25 : 0 }}
    >
      <div className="flex items-center gap-1.5 px-3 pb-2 pt-[18px]">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-white">
          <Spark />
        </span>
        <span className="h-[5px] w-[34px] rounded-full bg-neutral-600" />
      </div>

      <div className="flex-1 px-3 pt-1">
        <div className="flex justify-end">
          <Question dark />
        </div>

        <div className="mt-2.5 space-y-[6px] pr-1">
          <span className="block h-[4px] w-full rounded-full bg-neutral-400" />
          <span className="block h-[4px] w-[86%] rounded-full bg-neutral-400" />
          <span className="block h-[4px] w-[58%] rounded-full bg-neutral-400" />
          <span className="block pt-1 text-[13px] font-bold tracking-tight text-white">x = 4</span>
        </div>

        {/* The full stop. */}
        <motion.span
          className="mt-4 block h-px origin-left bg-neutral-700"
          initial={false}
          animate={{ scaleX: done ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="px-2.5 pb-3">
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 py-[5px] pl-3 pr-[5px]">
          <span className="h-[4px] w-[22%] rounded-full bg-neutral-500" />
          <span className="ml-auto flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-neutral-600">
            <svg viewBox="0 0 12 12" className="h-[8px] w-[8px]">
              <path
                d="M6 10 V3 M2.6 6 L6 2.6 L9.4 6"
                fill="none"
                stroke="#333"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** The four things Forma sends after the same question, in the order it sends
 *  them. Icons rather than labels: at this width a title is a title nobody can
 *  read, and the icons are the app's own. */
const STEPS = ["answers", "explanation", "common_mistake", "example"] as const;

/**
 * Forma: the same question, and an answer that does not stop at being right.
 *
 * Each step arrives after the one above it and stays. Nothing is replaced,
 * because the argument is accumulation - by the last beat the screen holds four
 * things where the other screen held one, and that difference is the section.
 */
function FormaAct({ beat }: { beat: number }) {
  const open = beat >= OPEN_AT;

  return (
    // Fills the scene rather than being centred by it: the phone and what grows
    // around it are placed against the stage, so neither moves when the other
    // changes size.
    <div className="absolute inset-0">
      {/* The same phone, moved back rather than replaced. Scaling and lifting one
          object is what makes everything that follows read as having come out
          of it; cutting to a new scene would say "and here is another product".
          Pixels, not percentages: a percentage translate resolves against the
          element's unscaled height, so it throws a shrunken phone clean off the
          stage. */}
      <motion.div
        className="absolute inset-x-0 z-10 flex justify-center"
        style={{ top: PHONE_TOP }}
        initial={false}
        animate={{ scale: open ? OPEN_SCALE : 1, y: open ? OPEN_LIFT : 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 24 }}
      >
        <Phone>
          <FormaScreen beat={beat} />
        </Phone>
      </motion.div>

      {/* What the lesson becomes once it is understood. They come out from
          behind the phone, one after another, and none of them says a word. */}
      <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-2">
        {CAPABILITIES.map((c, i) => (
          <Capability key={c.key} spec={c} on={beat >= OPEN_AT + 1 + i} />
        ))}
      </div>
    </div>
  );
}

/**
 * The four things that happen after the explanation.
 *
 * Drawn, never labelled: a title on a tile this size is a title nobody reads,
 * and the section already carries its one line of copy underneath.
 */
const CAPABILITIES = [
  { key: "quiz", icon: ListChecks },
  { key: "sheet", icon: Layers },
  { key: "level", icon: GraduationCap },
  { key: "history", icon: TrendingUp },
] as const;

type Spec = (typeof CAPABILITIES)[number];

function Capability({ spec, on }: { spec: Spec; on: boolean }) {
  const Icon = spec.icon;
  return (
    <motion.div
      className="rounded-[14px] border border-border bg-surface p-2.5 shadow-[var(--shadow-soft)]"
      initial={false}
      // Up behind the phone when it is not here yet, so its first frame on
      // screen is an edge coming out rather than a box switching on.
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : -34, scale: on ? 1 : 0.86 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <Icon className="mb-2 h-3.5 w-3.5 text-emerald" />
      {spec.key === "quiz" && (
        <div className="space-y-[5px]">
          <span className="block h-[7px] w-[76%] rounded-full bg-surface-muted" />
          <motion.span
            className="block h-[7px] w-[88%] rounded-full"
            initial={false}
            animate={{
              backgroundColor: on ? "var(--color-emerald-soft)" : "var(--color-surface-muted)",
            }}
            transition={{ duration: 0.4, delay: on ? 0.45 : 0 }}
          />
          <span className="block h-[7px] w-[60%] rounded-full bg-surface-muted" />
        </div>
      )}
      {spec.key === "sheet" && (
        <div className="space-y-[5px]">
          {[100, 82, 64].map((w, i) => (
            <motion.span
              key={w}
              className="block h-[5px] rounded-full bg-border-strong/35"
              initial={false}
              animate={{ width: on ? `${w}%` : "0%" }}
              transition={{ duration: 0.34, delay: on ? 0.14 + i * 0.11 : 0, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
      {spec.key === "level" && (
        <div className="space-y-[7px]">
          {/* The same notion, said shorter or said longer. */}
          <motion.span
            className="block h-[5px] rounded-full bg-border-strong/35"
            initial={false}
            animate={{ width: on ? "54%" : "54%" }}
          />
          <motion.span
            className="block h-[5px] rounded-full bg-emerald/40"
            initial={false}
            animate={{ width: on ? "96%" : "54%" }}
            transition={{ type: "spring", stiffness: 200, damping: 22, delay: on ? 0.5 : 0 }}
          />
        </div>
      )}
      {spec.key === "history" && (
        <div className="flex items-end gap-[5px]">
          {[9, 14, 12, 19, 24].map((h, i) => (
            <motion.span
              key={i}
              className="w-[7px] rounded-t-[2px] bg-emerald/35"
              initial={false}
              animate={{ height: on ? h : 3 }}
              transition={{ type: "spring", stiffness: 280, damping: 22, delay: on ? i * 0.06 : 0 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function FormaScreen({ beat }: { beat: number }) {
  const got = beat >= 7;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="z-10 flex items-center gap-1.5 bg-card px-3 pb-2 pt-[18px]">
        <Logo size={15} withWordmark={false} />
        <span className="h-[5px] w-[34px] rounded-full bg-border-strong/40" />
      </div>

      {/* One thread, longer than the screen. It is scrolled, never swapped:
          what has to be felt is that the conversation has not finished, and a
          screen that replaces its contents says the opposite. */}
      <div className="px-3 pt-1">
        <div className="flex justify-end">
          <Question dark={false} />
        </div>

        <div className="mt-2.5 space-y-[5px]">
          {STEPS.map((key, i) => (
            <Step key={key} name={key} on={beat >= 3 + i} last={i === STEPS.length - 1 && got} />
          ))}
        </div>

        {/* And it lands. */}
        <Block on={got} delay={0.2}>
          <div className="flex items-center gap-1.5 rounded-[10px] border border-emerald/30 bg-emerald-soft px-2 py-1.5">
            <Check className="h-3 w-3 shrink-0 text-emerald" strokeWidth={3} />
            <span className="h-[4px] w-[46%] rounded-full bg-emerald/45" />
          </div>
        </Block>
      </div>
    </div>
  );
}

/** One more thing arriving in the thread, with the section's one arrival
 *  gesture. Kept in one place so nothing here can drift out of step. */
function Block({
  on,
  delay = 0,
  children,
}: {
  on: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="mt-2.5"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 16, scale: on ? 1 : 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: on ? delay : 0 }}
    >
      {children}
    </motion.div>
  );
}

function Step({ name, on, last }: { name: (typeof STEPS)[number]; on: boolean; last: boolean }) {
  const Icon = sectionIcon(name);
  return (
    <motion.div
      className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-2 py-[7px]"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 16, scale: on ? 1 : 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Icon className={`h-3 w-3 shrink-0 ${last ? "text-emerald" : "text-muted-foreground"}`} />
      <span className="h-[4px] flex-1 rounded-full bg-border-strong/35" />
    </motion.div>
  );
}

/** A generic assistant mark: the sparkle everything now uses for "a machine
 *  wrote this". Recognisable as a category, owned by nobody. */
function Spark() {
  return (
    <svg viewBox="0 0 12 12" className="h-[9px] w-[9px]">
      <path
        d="M6 0.8 C6.5 4 8 5.5 11.2 6 C8 6.5 6.5 8 6 11.2 C5.5 8 4 6.5 0.8 6 C4 5.5 5.5 4 6 0.8 Z"
        fill="#111"
      />
    </svg>
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
