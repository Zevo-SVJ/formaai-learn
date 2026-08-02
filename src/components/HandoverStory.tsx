import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { Check, Layers, ListChecks, MessageCircle, TrendingUp } from "lucide-react";
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

const BEATS: Array<{ scene: SceneName; ms: number }> = [
  { scene: "other", ms: 1200 }, // 0 asked, and answered
  { scene: "other", ms: 1450 }, // 1 and that is the end of it
  { scene: "forma", ms: 950 }, // 2 Forma, with the same question still on it
  { scene: "forma", ms: 720 }, // 3 the answer
  { scene: "forma", ms: 720 }, // 4 why it works
  { scene: "forma", ms: 720 }, // 5 what people get wrong
  { scene: "forma", ms: 780 }, // 6 one case to try
  { scene: "forma", ms: 1050 }, // 7 and it lands
  { scene: "forma", ms: 950 }, // 8 kept, as cards
  { scene: "forma", ms: 1000 }, // 9 tested on it
  { scene: "forma", ms: 950 }, // 10 and it is followed over time
  { scene: "forma", ms: 1500 }, // 11 and it is still there to be asked
  { scene: "forma", ms: 700 }, // 12 a breath, then round again
];

/** Which of the two lines is being read. */
const CAPTION_OF = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

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
  const shown = reduceMotion ? 11 : beat;
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
          <Phone>
            <FormaScreen beat={shown} />
          </Phone>
        </Scene>
      </div>

      {/* Both journeys at once, at a glance - which is what the phone alone
          cannot do, since it can only ever be showing one of them. */}
      <Fork beat={shown} />

      <div className="relative mt-6 h-8 w-full px-2 text-center">
        {beats.slice(0, 2).map((line, i) => (
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
const STOPS = [104, 137, 170, 203, 236, 269];

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
      <motion.div
        className="px-3 pt-1"
        initial={false}
        animate={{ y: -SCROLL_AT[Math.min(beat, SCROLL_AT.length - 1)] }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      >
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

        {/* Kept, as cards. */}
        <Block on={beat >= 8}>
          <div className="relative h-[54px]">
            {[2, 1, 0].map((i) => (
              <div
                key={i}
                className="absolute inset-x-0 top-0 rounded-[10px] border border-border bg-surface"
                style={{
                  height: 38,
                  transform: `translate(${i * 5}px, ${i * 5}px) scale(${1 - i * 0.03})`,
                  zIndex: 3 - i,
                }}
              >
                {i === 0 && (
                  <div className="flex h-full items-center gap-2 px-2">
                    <Layers className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="h-[4px] flex-1 rounded-full bg-border-strong/35" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Block>

        {/* Then asked about it. One option settles green - being right is the
            only outcome worth animating here. */}
        <Block on={beat >= 9}>
          <div className="rounded-[10px] border border-border bg-surface p-2">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="h-[4px] w-[62%] rounded-full bg-border-strong/35" />
            </div>
            <div className="space-y-[4px]">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block h-[9px] rounded-full"
                  initial={false}
                  animate={{
                    backgroundColor:
                      beat >= 10 && i === 1
                        ? "var(--color-emerald-soft)"
                        : "var(--color-surface-muted)",
                    width: i === 1 ? "84%" : i === 0 ? "70%" : "56%",
                  }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>
          </div>
        </Block>

        {/* And followed, week after week. */}
        <Block on={beat >= 10}>
          <div className="flex items-end gap-[5px] rounded-[10px] border border-border bg-surface px-2 py-2">
            <TrendingUp className="mb-[1px] h-3 w-3 shrink-0 text-emerald" />
            {[10, 16, 13, 22, 28, 34].map((h, i) => (
              <motion.span
                key={i}
                className="w-[7px] rounded-t-[2px] bg-emerald/35"
                initial={false}
                animate={{ height: beat >= 10 ? h : 3 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.05 }}
              />
            ))}
          </div>
        </Block>

        {/* And still there, waiting to be asked again. */}
        <Block on={beat >= 11}>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface py-[5px] pl-2.5 pr-[5px]">
            <MessageCircle className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="h-[4px] w-[30%] rounded-full bg-border-strong/30" />
            <motion.span
              className="h-[9px] w-[1.5px] rounded-full bg-emerald"
              initial={false}
              animate={{ opacity: beat >= 11 ? [1, 1, 0, 0, 1] : 0 }}
              transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }}
            />
            <span className="ml-auto h-[17px] w-[17px] shrink-0 rounded-full bg-emerald/20" />
          </div>
        </Block>
      </motion.div>
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
