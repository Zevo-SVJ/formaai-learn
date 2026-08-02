import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { Check, FileText, History, ListChecks } from "lucide-react";
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

type SceneName = "other" | "forma" | "quiz" | "sheet" | "memory";

const BEATS: Array<{ scene: SceneName; ms: number }> = [
  { scene: "other", ms: 1500 }, // 0 asked, answered, and that is the end of it
  { scene: "forma", ms: 900 }, // 1 Forma, with the same question still on it
  { scene: "forma", ms: 1000 }, // 2 the explanation, in four parts
  { scene: "forma", ms: 1100 }, // 3 and it lands
  { scene: "quiz", ms: 1400 }, // 4 then it asks him
  { scene: "sheet", ms: 1300 }, // 5 and it keeps what he learned
  { scene: "memory", ms: 1500 }, // 6 and it remembers, week after week
  { scene: "memory", ms: 500 }, // 7 a breath, then round again
];

/** Which of the three lines is being read. */
const CAPTION_OF = [0, 1, 1, 1, 2, 2, 2, 2];

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
  const shown = reduceMotion ? 4 : beat;
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
        <Scene show={scene === "quiz"} away={AWAY.quiz}>
          <QuizScene on={scene === "quiz"} />
        </Scene>
        <Scene show={scene === "sheet"} away={AWAY.sheet}>
          <SheetScene on={scene === "sheet"} />
        </Scene>
        <Scene show={scene === "memory"} away={AWAY.memory}>
          <MemoryScene on={scene === "memory"} />
        </Scene>
      </div>

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
  // Picked up the way a phone is picked up - and set down the same way once it
  // has made its point. It does not linger behind what follows: the phone
  // stands for one idea, and keeping it on screen would keep making that idea
  // while three others are being made.
  forma: { opacity: 0, y: 60, scale: 0.95, rotate: 0 },
  // The three that follow are not screens. They bloom from a point, the way an
  // idea does when it is the only thing being looked at.
  quiz: { opacity: 0, y: 0, scale: 0.72, rotate: 0 },
  sheet: { opacity: 0, y: 0, scale: 0.72, rotate: 0 },
  memory: { opacity: 0, y: 0, scale: 0.72, rotate: 0 },
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

/* ------------------------------------------------------- what comes after */

/**
 * The three things Forma does once the lesson is understood.
 *
 * Not cards. A card is a container, and a container says "here is a feature";
 * these are the things themselves, drawn and built in front of the reader. Each
 * gets the stage to itself, because the point of the act is that there is more
 * than one of them, not that they can be tiled.
 */

/** A ring that closes as something is completed. Used by two of the three. */
function Ring({ on, to, tone = "emerald" }: { on: boolean; to: number; tone?: "emerald" | "ink" }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full -rotate-90">
      <circle cx="56" cy="56" r={r} fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <motion.circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        stroke={tone === "emerald" ? "var(--color-emerald)" : "var(--color-border-strong)"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: on ? c * (1 - to) : c }}
        transition={{ type: "spring", stiffness: 90, damping: 20, delay: on ? 0.25 : 0 }}
      />
    </svg>
  );
}

/**
 * Understood, then practised.
 *
 * Three answers, and the ring around the mark closing as the right one is
 * found. Nothing is labelled: a green answer and a full ring are already the
 * sentence.
 */
function QuizScene({ on }: { on: boolean }) {
  return (
    <div className="flex w-full max-w-[250px] flex-col items-center">
      <div className="relative h-[112px] w-[112px]">
        <Ring on={on} to={1} />
        <div className="absolute inset-0 flex items-center justify-center">
          <ListChecks className="h-7 w-7 text-emerald" strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-7 w-full space-y-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2.5 rounded-full px-3 py-2"
            initial={false}
            animate={{
              opacity: on ? 1 : 0,
              y: on ? 0 : 14,
              backgroundColor:
                on && i === 1 ? "var(--color-emerald-soft)" : "var(--color-surface-muted)",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              delay: on ? 0.2 + i * 0.1 : 0,
            }}
          >
            <motion.span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
              initial={false}
              animate={{
                borderColor: on && i === 1 ? "var(--color-emerald)" : "var(--color-border-strong)",
                backgroundColor: on && i === 1 ? "var(--color-emerald)" : "transparent",
              }}
              transition={{ duration: 0.3, delay: on ? 0.75 : 0 }}
            >
              {i === 1 && (
                <motion.span
                  initial={false}
                  animate={{ scale: on ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22, delay: on ? 0.8 : 0 }}
                >
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                </motion.span>
              )}
            </motion.span>
            <span
              className="h-[5px] rounded-full bg-border-strong/30"
              style={{ width: i === 1 ? "72%" : i === 0 ? "58%" : "44%" }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * The lesson, kept.
 *
 * Loose marks arrive scattered and then find their places under two headings.
 * The organising is the whole point, so it is the only thing that moves.
 */
function SheetScene({ on }: { on: boolean }) {
  const rows = [
    { w: 88, group: 0 },
    { w: 64, group: 0 },
    { w: 78, group: 1 },
    { w: 52, group: 1 },
    { w: 70, group: 1 },
  ];
  return (
    <div className="flex w-full max-w-[230px] flex-col items-center">
      <FileText className="h-7 w-7 text-emerald" strokeWidth={1.8} />

      <div className="mt-6 w-full">
        {[0, 1].map((g) => (
          <div key={g} className={g === 1 ? "mt-4" : ""}>
            {/* A heading arrives first, and the loose marks gather under it. */}
            <motion.span
              className="mb-2 block h-[6px] w-[38%] rounded-full bg-foreground/30"
              initial={false}
              animate={{ opacity: on ? 1 : 0, x: on ? 0 : -12 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 26,
                delay: on ? 0.15 + g * 0.42 : 0,
              }}
            />
            <div className="space-y-[7px]">
              {rows
                .filter((r) => r.group === g)
                .map((r, i) => (
                  <motion.span
                    key={i}
                    className="block h-[5px] rounded-full bg-border-strong/30"
                    initial={false}
                    // In from the side, one after another: paper being tidied,
                    // not a list being printed.
                    animate={{ width: on ? `${r.w}%` : "0%", x: on ? 0 : 20, opacity: on ? 1 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 26,
                      delay: on ? 0.3 + g * 0.42 + i * 0.1 : 0,
                    }}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * And it remembers.
 *
 * A line of weeks. Each one lights and stays lit, the line reaching past the
 * frame - the argument is that nothing is dropped, so nothing here goes out
 * again once it has arrived.
 */
function MemoryScene({ on }: { on: boolean }) {
  const weeks = [0, 1, 2, 3, 4, 5];
  return (
    <div className="flex w-full max-w-[250px] flex-col items-center">
      <History className="h-7 w-7 text-emerald" strokeWidth={1.8} />

      <div className="relative mt-8 h-[54px] w-full">
        <span className="absolute inset-x-0 top-[9px] h-[2px] rounded-full bg-border" />
        <motion.span
          className="absolute left-0 top-[9px] h-[2px] rounded-full bg-emerald/60"
          initial={false}
          animate={{ width: on ? "100%" : "0%" }}
          transition={{ duration: 1.15, ease: "easeInOut", delay: on ? 0.15 : 0 }}
        />

        <div className="absolute inset-x-0 top-0 flex justify-between">
          {weeks.map((w) => (
            <div key={w} className="flex flex-col items-center gap-2">
              <motion.span
                className="h-5 w-5 rounded-full border-2 border-emerald bg-card"
                initial={false}
                animate={{ scale: on ? 1 : 0.2, opacity: on ? 1 : 0 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 20,
                  delay: on ? 0.2 + w * 0.16 : 0,
                }}
              />
              <motion.span
                className="w-[6px] rounded-t-[2px] bg-emerald/30"
                initial={false}
                animate={{ height: on ? 8 + w * 4 : 2 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                  delay: on ? 0.3 + w * 0.16 : 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
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
  // One beat now, so the full stop is timed inside it rather than waiting for
  // another: it answers, and a moment later the thread closes under it.
  const done = true;

  return (
    <motion.div
      className="flex h-full flex-col"
      initial={false}
      animate={{ opacity: 0.55 }}
      transition={{ duration: 0.6, delay: 1.05 }}
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
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
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
  const got = beat >= 3;

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
            <Step
              key={key}
              name={key}
              on={beat >= (i === 0 ? 1 : 2)}
              delay={i === 0 ? 0.15 : 0.1 * i}
              last={i === STEPS.length - 1 && got}
            />
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

function Step({
  name,
  on,
  last,
  delay = 0,
}: {
  name: (typeof STEPS)[number];
  on: boolean;
  last: boolean;
  delay?: number;
}) {
  const Icon = sectionIcon(name);
  return (
    <motion.div
      className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-2 py-[7px]"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 16, scale: on ? 1 : 0.94 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: on ? delay : 0 }}
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
