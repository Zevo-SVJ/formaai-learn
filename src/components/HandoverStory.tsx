import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { Check } from "lucide-react";
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
  { scene: "other", ms: 1250 }, // 0 asked, and answered
  { scene: "other", ms: 1550 }, // 1 and that is the end of it
  { scene: "forma", ms: 1050 }, // 2 Forma, with the same question still on it
  { scene: "forma", ms: 800 }, // 3 the answer
  { scene: "forma", ms: 800 }, // 4 why it works
  { scene: "forma", ms: 800 }, // 5 what people get wrong
  { scene: "forma", ms: 900 }, // 6 one case to try
  { scene: "forma", ms: 1700 }, // 7 and it lands
  { scene: "forma", ms: 600 }, // 8 a breath, then round again
];

/** Which of the two lines is being read. */
const CAPTION_OF = [0, 0, 1, 1, 1, 1, 1, 1, 1];

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
  const shown = reduceMotion ? 7 : beat;
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

      <div className="relative mt-8 h-8 w-full px-2 text-center">
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
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 px-3 pb-2 pt-[18px]">
        <Logo size={15} withWordmark={false} />
        <span className="h-[5px] w-[34px] rounded-full bg-border-strong/40" />
      </div>

      <div className="flex-1 px-3 pt-1">
        <div className="flex justify-end">
          <Question dark={false} />
        </div>

        <div className="mt-2.5 space-y-[5px]">
          {STEPS.map((key, i) => (
            <Step key={key} name={key} on={beat >= 3 + i} last={i === STEPS.length - 1 && got} />
          ))}
        </div>

        {/* And it lands. */}
        <motion.div
          className="mt-2.5 flex items-center gap-1.5 rounded-[10px] border border-emerald/30 bg-emerald-soft px-2 py-1.5"
          initial={false}
          animate={{ opacity: got ? 1 : 0, y: got ? 0 : 14, scale: got ? 1 : 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: got ? 0.2 : 0 }}
        >
          <Check className="h-3 w-3 shrink-0 text-emerald" strokeWidth={3} />
          <span className="h-[4px] w-[46%] rounded-full bg-emerald/45" />
        </motion.div>
      </div>
    </div>
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
