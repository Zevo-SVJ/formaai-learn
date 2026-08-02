import { useEffect, useState } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

/**
 * The problem, played out on a phone.
 *
 * Both halves of the story happen on the same device, in the same frame: the
 * lesson is on it, then the assistant is on it. That is what makes the two
 * scenes one world rather than two illustrations - the device never changes,
 * only what is on its screen. It is also why they are portrait: a student meets
 * neither of these things in landscape.
 *
 * The phone is dropped for the last act on purpose. A countdown and a grade are
 * not apps. They are what happens once the phone has been put down, and letting
 * them break out of the frame is the escalation.
 *
 * On the assistant: this is deliberately not anyone's logo. The sequence ends
 * in a failed test, so putting a named competitor's trademark on it would be
 * comparative advertising against that mark - and a mark redrawn from memory at
 * that. What it borrows instead is the layout everyone already reads as "an AI
 * assistant": a dark screen, the question in a bubble, the reply set as plain
 * text rather than in a bubble of its own, and a composer pill with a round
 * send key.
 */

/** Departures accelerate away; a scene that is finished should get out of the way. */
const EXIT: [number, number, number, number] = [0.4, 0, 1, 1];

type SceneName = "lesson" | "ai" | "clock" | "grade";

/**
 * Every beat, and how long it holds.
 *
 * Beat 2 is the shortest in the act on purpose: the whole seduction of asking
 * an AI is that the reply starts before you have finished hoping for it. And
 * the countdown's beats shorten one after another, which is where the pressure
 * of the third act actually comes from.
 */
const BEATS: Array<{ scene: SceneName; ms: number }> = [
  { scene: "lesson", ms: 1900 }, // 0 the lesson, on the phone
  { scene: "ai", ms: 1000 }, // 1 he types the question
  { scene: "ai", ms: 560 }, // 2 sent - and the reply is already coming
  { scene: "ai", ms: 1350 }, // 3 the answer, line by line
  { scene: "ai", ms: 1300 }, // 4 he has it, and still does not understand
  { scene: "clock", ms: 950 }, // 5 the test, still far off
  { scene: "clock", ms: 720 }, // 6 closer
  { scene: "clock", ms: 540 }, // 7 closer
  { scene: "clock", ms: 400 }, // 8 tomorrow
  { scene: "clock", ms: 800 }, // 9 today. everything stops.
  { scene: "grade", ms: 1900 }, // 10 the grade
  { scene: "grade", ms: 600 }, // 11 a breath, then round again
];

/** Which line is being read, per beat. */
const CAPTION_OF = [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3];

const STAGE_H = 344;

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
          <Phone>
            <LessonScreen />
          </Phone>
        </Scene>
        <Scene show={scene === "ai"} away={AWAY.ai}>
          <Phone dark>
            <AssistantScreen beat={shown} />
          </Phone>
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
 * Where each scene rests when it is off screen - the whole character of its
 * transition. Giving every scene the same pose is what makes a sequence read as
 * a slideshow.
 */
const AWAY: Record<SceneName, TargetAndTransition> = {
  // Put down and pushed aside.
  lesson: { opacity: 0, y: 46, scale: 0.9, rotate: -5 },
  // Picked up the way a phone is picked up.
  ai: { opacity: 0, y: 60, scale: 0.95, rotate: 0 },
  // Swells into place, and shrinks back out of it.
  clock: { opacity: 0, y: 0, scale: 0.7, rotate: 0 },
  // Falls in from above, and is lifted back out.
  grade: { opacity: 0, y: -44, scale: 1.12, rotate: 0 },
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

/* ------------------------------------------------------------------ device */

const SCREEN_W = 158;
const SCREEN_H = 316;

/**
 * The device both screens live in.
 *
 * Portrait, with the bezel and the top pill that make a rectangle read as a
 * phone rather than as a card. Identical for the lesson and the assistant,
 * which is what puts them in one world.
 */
function Phone({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={[
        "relative rounded-[28px] border p-[7px] shadow-[var(--shadow-lift)]",
        dark ? "border-neutral-700/70 bg-neutral-800" : "border-border-strong/40 bg-surface-muted",
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[22px]",
          dark ? "bg-neutral-900" : "bg-card",
        ].join(" ")}
        style={{ width: SCREEN_W, height: SCREEN_H }}
      >
        {/* The pill. Small, and it does most of the recognising. */}
        <span
          className={[
            "absolute left-1/2 top-[7px] z-10 h-[5px] w-[38px] -translate-x-1/2 rounded-full",
            dark ? "bg-neutral-700" : "bg-border-strong/45",
          ].join(" ")}
        />
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- screens */

const INK = "var(--color-border-strong)";

/**
 * The lesson, abstracted and set portrait.
 *
 * Not writing with the words removed - that only ever looks like a page waiting
 * to load. The structure of a lesson: a margin, a heading, a couple of rules,
 * one worked expression, one figure. Recognised in a glance, nothing to read.
 */
function LessonScreen() {
  return (
    <svg viewBox="0 0 158 316" className="h-full w-full" role="presentation">
      {/* The margin. One vertical line is what makes a surface a page. */}
      <line x1="20" y1="34" x2="20" y2="292" stroke={INK} strokeWidth="1" opacity="0.3" />

      <rect
        x="32"
        y="36"
        width="66"
        height="6"
        rx="3"
        fill="var(--color-foreground)"
        opacity="0.3"
      />

      <rect x="32" y="60" width="104" height="3.5" rx="1.75" fill={INK} opacity="0.28" />
      <rect x="32" y="72" width="82" height="3.5" rx="1.75" fill={INK} opacity="0.28" />

      {/* One expression, built from shapes: two terms, an operator, a result. */}
      <g transform="translate(32 96)">
        <rect width="26" height="16" rx="5" fill={INK} opacity="0.3" />
        <rect x="32" y="6.5" width="11" height="3" rx="1.5" fill={INK} opacity="0.45" />
        <rect x="49" width="16" height="16" rx="5" fill={INK} opacity="0.3" />
        <rect x="71" y="4.5" width="12" height="2.5" rx="1.25" fill={INK} opacity="0.45" />
        <rect x="71" y="10" width="12" height="2.5" rx="1.25" fill={INK} opacity="0.45" />
        <rect x="89" width="21" height="16" rx="5" fill="var(--color-emerald)" opacity="0.3" />
      </g>

      <rect x="32" y="132" width="96" height="3.5" rx="1.75" fill={INK} opacity="0.28" />
      <rect x="32" y="144" width="62" height="3.5" rx="1.75" fill={INK} opacity="0.28" />

      {/* One figure. A right angle is read as geometry before it is read at all. */}
      <g transform="translate(38 172)">
        <path
          d="M2 54 L2 6 L58 54 Z"
          fill="none"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.38"
        />
        <path d="M2 44 h10 v10" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.5" />
      </g>

      <rect x="32" y="248" width="88" height="3.5" rx="1.75" fill={INK} opacity="0.28" />
      <rect x="32" y="260" width="106" height="3.5" rx="1.75" fill={INK} opacity="0.28" />
      <rect x="32" y="272" width="54" height="3.5" rx="1.75" fill={INK} opacity="0.28" />
    </svg>
  );
}

/**
 * The assistant, and the four beats of asking it something.
 *
 * He types, he sends, the reply starts almost before the question has landed,
 * and he ends up holding a correct answer he cannot use.
 *
 * That last beat is the point of the whole section, so it is shown rather than
 * stated: the answer stays exactly where it is - he has it, it is right - and
 * goes soft and grey, while his own next message turns out to be a question
 * mark. Taking the answer away instead would have said it vanished, which is
 * not the problem being described.
 */
function AssistantScreen({ beat }: { beat: number }) {
  const typing = beat >= 1;
  const sent = beat >= 2;
  const answered = beat >= 3;
  const lost = beat >= 4;

  return (
    <div className="flex h-full flex-col">
      {/* The app bar: a mark, and the name of the thing being asked. */}
      <div className="flex items-center gap-1.5 px-3 pb-2 pt-[18px]">
        <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-white">
          <Spark />
        </span>
        <span className="h-[5px] w-[34px] rounded-full bg-neutral-600" />
      </div>

      <div className="flex-1 space-y-2 px-3 pt-1">
        {/* The question, once it has been sent. */}
        <motion.div
          className="flex justify-end"
          initial={false}
          animate={{ opacity: sent ? 1 : 0, y: sent ? 0 : 14, scale: sent ? 1 : 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          <span className="flex w-[74%] flex-col gap-[5px] rounded-[12px] rounded-br-[4px] bg-neutral-700/80 px-2.5 py-2">
            <span className="h-[4px] w-full rounded-full bg-neutral-500" />
            <span className="h-[4px] w-3/5 rounded-full bg-neutral-500" />
          </span>
        </motion.div>

        {/* Thinking - and barely. It is on screen for a moment, because the
            speed is exactly the seduction being described. */}
        <motion.div
          className="flex gap-[3px] pt-0.5"
          initial={false}
          animate={{ opacity: sent && !answered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[4px] w-[4px] rounded-full bg-neutral-500" />
          ))}
        </motion.div>

        {/* The reply. Plain text, no bubble - which is the layout everyone reads
            as an assistant speaking rather than a person. */}
        <motion.div
          className="space-y-[6px] pr-1"
          initial={false}
          animate={{
            opacity: answered ? (lost ? 0.4 : 1) : 0,
            filter: lost ? "blur(1.7px)" : "blur(0px)",
          }}
          transition={{ duration: lost ? 0.5 : 0.28, delay: lost ? 0.15 : 0 }}
        >
          <AnswerLine w="100%" on={answered} delay={0} />
          <AnswerLine w="86%" on={answered} delay={0.09} />
          <AnswerLine w="94%" on={answered} delay={0.18} />
          <AnswerLine w="58%" on={answered} delay={0.27} />
          <motion.span
            className="block pt-1 text-[13px] font-bold tracking-tight text-white"
            initial={false}
            animate={{ opacity: answered ? 1 : 0, y: answered ? 0 : 6 }}
            transition={{ delay: answered ? 0.36 : 0, type: "spring", stiffness: 340, damping: 26 }}
          >
            x = 4
          </motion.span>
        </motion.div>

        {/* His reply. He has the answer, and this is all he has to say back. */}
        <motion.div
          className="flex justify-end pt-1"
          initial={false}
          animate={{ opacity: lost ? 1 : 0, y: lost ? 0 : 18, scale: lost ? 1 : 0.85 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: lost ? 0.42 : 0 }}
        >
          <span className="rounded-[12px] rounded-br-[4px] bg-neutral-700/80 px-2.5 py-1 text-[13px] font-bold text-neutral-200">
            ?
          </span>
        </motion.div>
      </div>

      {/* The composer. A round send key on a pill is most of what makes this
          screen placeable at a glance. */}
      <div className="px-2.5 pb-3">
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 py-[5px] pl-3 pr-[5px]">
          <motion.span
            className="h-[4px] rounded-full bg-neutral-500"
            initial={false}
            animate={{ width: typing && !sent ? "60%" : "22%" }}
            transition={{ duration: typing && !sent ? 0.75 : 0.2, ease: "easeOut" }}
          />
          <span className="ml-auto flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-white">
            <svg viewBox="0 0 12 12" className="h-[8px] w-[8px]">
              <path
                d="M6 10 V3 M2.6 6 L6 2.6 L9.4 6"
                fill="none"
                stroke="#111"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/** One line of the reply, arriving after the one above it. */
function AnswerLine({ w, on, delay }: { w: string; on: boolean; delay: number }) {
  return (
    <motion.span
      className="block h-[4px] rounded-full bg-neutral-400"
      initial={false}
      animate={{ width: on ? w : "0%" }}
      transition={{ duration: 0.26, delay: on ? delay : 0, ease: "easeOut" }}
    />
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

/* ---------------------------------------------------------------- last act */

/**
 * The test, closing in.
 *
 * One object for five beats: the ring closes, the digit falls out of a slot,
 * the colour turns, and each beat is shorter than the last. The pressure is in
 * the rhythm rather than in the symbols.
 */
const DAYS = [9, 5, 2, 1, 0];
const R = 52;
const C = 2 * Math.PI * R;

function Countdown({ beat }: { beat: number }) {
  const step = Math.min(Math.max(beat - 5, 0), DAYS.length - 1);
  const days = DAYS[step];
  const closed = 1 - days / DAYS[0];
  const hot = step / (DAYS.length - 1);

  const stroke =
    hot < 0.34
      ? "var(--color-border-strong)"
      : hot < 0.8
        ? "oklch(0.75 0.16 70)"
        : "oklch(0.63 0.22 25)";
  const ink = hot < 0.34 ? "text-muted-foreground" : hot < 0.8 ? "text-amber-600" : "text-red-600";

  return (
    <motion.div
      className="relative flex h-[150px] w-[150px] items-center justify-center"
      initial={false}
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
        {/* An odometer, not a cross-fade: a counter that dissolves reads as a
            label being swapped, and what has to be felt is something spent. */}
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
