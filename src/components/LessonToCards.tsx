import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";
import { ExplanationCard, sectionIcon } from "@/components/AnalysisCards";

/**
 * A lesson turning into cards, as one continuous object rather than two states
 * crossing over.
 *
 * The earlier version faded a sheet out and faded a deck in. That is a slide
 * transition: it claims nothing, because nothing on screen is the same thing
 * before and after, and the reader is simply asked to believe the cards came
 * from the page.
 *
 * Here the three lines that carry the method are the cards. They sit in the
 * notes, get picked out as the page is read, then rise, widen and settle into a
 * stack — without ever being replaced. The same element is a line of a
 * student's handwriting at the start of the scroll and an explanation card at
 * the end of it. That identity is the whole argument, and it is why nothing
 * here fades: a fade would break the continuity the section exists to show.
 *
 * Geometry is arithmetic, not measurement. Every position derives from the
 * constants below, so a line and the card it becomes can never disagree about
 * where they are, and a dropped frame costs smoothness rather than placement.
 */

const LINE_H = 21;
const LINE_GAP = 6;
const PAGE_PAD = 22;
const TITLE_H = 30;
const ROW = LINE_H + LINE_GAP;

/** How long each rule of the drawn page is. Nothing here is written: a page of
 *  real sentences competes with the caption, and the reader ends up reading a
 *  lesson instead of watching one being taken apart. */
const RULES = [92, 74, 86, 96, 68, 80, 90, 62, 84, 76];
const KEYS = [2, 5, 8]; // the rows that carry the method

const STAGE_H = PAGE_PAD * 2 + TITLE_H + RULES.length * ROW;
const CARD_H = 186;

/** How tall the reading band is. */
const BAND = 70;

/** The sheet arrives before anything is done to it. */
const ARRIVE: [number, number] = [0, 0.1];
const READ: [number, number] = [0.14, 0.42];
const LIFT: [number, number] = [0.5, 0.8];

export function LessonToCards() {
  const { raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const steps = raw((d) => d.how.steps) as Array<{ t: string; d: string }>;
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  if (reduceMotion) return <Still />;

  return (
    <div ref={track} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-5">
        <Stage progress={scrollYProgress}>
          <Page progress={scrollYProgress} />
          {KEYS.map((row, i) => (
            <Morph key={row} row={row} rank={i} progress={scrollYProgress} />
          ))}
        </Stage>
        <Caption progress={scrollYProgress} steps={steps} />
      </div>
      <span className="sr-only">{steps.map((s) => `${s.t}. ${s.d}`).join(" ")}</span>
    </div>
  );
}

/**
 * The sheet arriving, as one object. Everything on it moves together, so the
 * page and the three rules that leave it can never disagree about where the
 * page is.
 */
function Stage({
  progress,
  children,
}: {
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const y = useTransform(progress, ARRIVE, [34, 0]);
  const scale = useTransform(progress, ARRIVE, [0.94, 1]);
  return (
    <motion.div
      // The height is fixed, so the rules and the cards they become are placed
      // by arithmetic rather than by whatever the browser laid out this frame.
      style={{ y, scale, height: STAGE_H }}
      className="relative w-full max-w-[330px]"
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

/**
 * The notes, drawn rather than written. Every row is present so the page reads
 * as a page, but the three that become cards are left as gaps: the moving
 * elements occupy them, and two copies of the same rule would be one too many.
 *
 * A band of light passes down the page while it is being read. That is the
 * detection, and it is the reason the three rules light up in order rather than
 * all at once - something is going through the page, and picking.
 */
function Page({ progress }: { progress: MotionValue<number> }) {
  // The page recedes as its content leaves it. It is not removed — it is still
  // there, simply no longer the thing being looked at.
  const opacity = useTransform(progress, LIFT, [1, 0.22]);
  const scale = useTransform(progress, LIFT, [1, 0.97]);

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-lift)]"
    >
      <div style={{ padding: PAGE_PAD }}>
        <div style={{ height: TITLE_H }}>
          <span className="block h-2 w-24 rounded-full bg-foreground/40" />
        </div>
        {RULES.map((w, i) => (
          <div key={i} style={{ height: LINE_H, marginBottom: LINE_GAP }}>
            {!KEYS.includes(i) && (
              <span
                className="mt-[7px] block h-1.5 rounded-full bg-border-strong/40"
                style={{ width: `${w}%` }}
              />
            )}
          </div>
        ))}
      </div>

      <Scan progress={progress} />
    </motion.div>
  );
}

/**
 * The band that reads the page.
 *
 * It is the reason the three rules light up one after another instead of all at
 * once: something passes over the sheet and picks as it goes. Clipped by the
 * page, so it enters and leaves rather than switching on.
 */
function Scan({ progress }: { progress: MotionValue<number> }) {
  const top = useTransform(progress, [READ[0] - 0.06, READ[1] + 0.04], [-70, STAGE_H]);
  const opacity = useTransform(progress, (v) => (v < READ[0] - 0.06 || v > READ[1] + 0.04 ? 0 : 1));
  return (
    <motion.div
      style={{ top, opacity, height: BAND }}
      className="pointer-events-none absolute inset-x-0"
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.94 0.05 155 / 0.35) 60%, oklch(0.88 0.08 155 / 0.6) 100%)",
        }}
      />
      <div className="h-px w-full bg-emerald/45" />
    </motion.div>
  );
}

const META = [
  { key: "explanation", title: "explanation", body: "explanation", tone: "emerald" },
  { key: "common_mistake", title: "commonMistakes", body: "mistake", tone: "warn" },
  { key: "example", title: "example", body: "example", tone: "default" },
] as const;

/**
 * One line of the notes, which is also one card.
 *
 * It never changes identity. Across the scroll it is picked out where it sits,
 * rises out of the page, widens, and takes its place in the stack. Its own
 * words stay on it throughout and end up as the card's body, which is how a
 * reader knows this card came from that line rather than from somewhere else.
 */
function Morph({
  row,
  rank,
  progress,
}: {
  row: number;
  rank: number;
  progress: MotionValue<number>;
}) {
  const { t } = useI18n();
  const meta = META[rank];

  // Read in order, so the page is gone through rather than lit up at once. The
  // back of the stack lifts first, so the deck builds from underneath.
  const readAt: [number, number] = [READ[0] + rank * 0.07, READ[0] + rank * 0.07 + 0.08];
  const liftAt: [number, number] = [LIFT[0] + (2 - rank) * 0.05, LIFT[1]];

  const lineTop = PAGE_PAD + TITLE_H + row * ROW;
  const deckTop = (STAGE_H - CARD_H) / 2 + rank * 9;

  const top = useTransform(progress, liftAt, [lineTop, deckTop]);
  const height = useTransform(progress, liftAt, [LINE_H, CARD_H]);
  const left = useTransform(progress, liftAt, [PAGE_PAD, rank * 15]);
  const right = useTransform(progress, liftAt, [PAGE_PAD, (2 - rank) * 15]);
  const radius = useTransform(progress, liftAt, [4, 22]);

  // Being picked out looks like a highlight; it hands over to the card's own
  // surface as the line becomes one, so there is never a frame showing both.
  const wash = useTransform(progress, readAt, [0, 1]);
  const surface = useTransform(progress, liftAt, [0, 1]);
  const bg = useTransform([wash, surface] as MotionValue<number>[], (v) => {
    const [w, s] = v as number[];
    return s > 0.02
      ? `color-mix(in oklab, var(--color-card) ${Math.min(s * 320, 100)}%, var(--color-emerald-soft))`
      : `color-mix(in oklab, var(--color-emerald-soft) ${w * 100}%, transparent)`;
  });
  // The rule is one of the crowd until the band finds it. Starting it green
  // would mean the page arrives with its answer already marked, and there would
  // be nothing left for the reading to do.
  const ruleColor = useTransform(
    wash,
    (w) => `color-mix(in oklab, var(--color-emerald) ${w * 100}%, var(--color-border-strong))`,
  );
  const borderColor = useTransform(surface, (s) =>
    s > 0.12 ? "var(--color-border)" : "transparent",
  );
  const boxShadow = useTransform(surface, (s) =>
    s > 0.25 ? "var(--shadow-lift)" : "0 0 0 0 rgba(0,0,0,0)",
  );
  // The hand-over between the two faces of the element. Written as functions on
  // purpose: framer compiles a plain from/to transform into a scroll-linked
  // WAAPI animation, which runs on its own timeline and can sit a frame behind
  // the geometry above — which is written straight to style. A card whose
  // outline has arrived but whose contents have not is the one flaw this
  // section cannot afford, so every layer here stays on the same clock.
  const span = liftAt[1] - liftAt[0];
  const ramp = (from: number, to: number) => (v: number) =>
    Math.min(1, Math.max(0, (v - (liftAt[0] + span * from)) / (span * (to - from))));
  const chrome = useTransform(progress, ramp(0.22, 0.5));
  const asLine = useTransform(progress, (v) => 1 - ramp(0.1, 0.3)(v));
  const ruleFade = useTransform(asLine, (v) => v * 0.55);

  const Icon = sectionIcon(meta.key);
  const tint =
    meta.tone === "emerald"
      ? "text-emerald"
      : meta.tone === "warn"
        ? "text-amber-600"
        : "text-foreground";
  const tintBg =
    meta.tone === "emerald"
      ? "bg-emerald-soft"
      : meta.tone === "warn"
        ? "bg-amber-500/10"
        : "bg-surface-muted";

  return (
    <motion.div
      data-morph={rank}
      style={{
        top,
        left,
        right,
        height,
        borderRadius: radius,
        background: bg,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor,
        boxShadow,
        zIndex: 10 - rank,
      }}
      className="absolute overflow-hidden"
    >
      {/* The rule, as it stands on the page. It carries no words: what the
          reader has to follow is which rules were picked, not what they said. */}
      <motion.span
        // Two things at once: the rule's own translucency, so it sits with the
        // others on the page, and the hand-over to the card face.
        style={{ opacity: ruleFade, width: `${RULES[row]}%`, background: ruleColor }}
        className="absolute left-1 top-[7px] block h-1.5 rounded-full"
      />

      {/* The same line, once it has become a card. */}
      <motion.div style={{ opacity: chrome }} className="flex h-full flex-col p-4">
        <div className="mb-2.5 flex shrink-0 items-center gap-2.5">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tintBg}`}>
            <Icon className={`h-3.5 w-3.5 ${tint}`} />
          </span>
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t((d) => d.doc.sections[meta.title])}
          </span>
        </div>
        <p className="text-[13.5px] leading-relaxed text-foreground">
          {t((d) => d.demo[meta.body])}
        </p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Three words at a time, naming the act. They cut rather than fade: a caption
 * that arrives with a flourish competes with the thing it is captioning.
 */
const CAPTION_AT: Array<[number, number]> = [
  [0, 0.12],
  [0.16, 0.46],
  [0.52, 0.99],
];

function Caption({
  progress,
  steps,
}: {
  progress: MotionValue<number>;
  steps: Array<{ t: string; d: string }>;
}) {
  return (
    <div className="relative mt-8 h-8 w-full max-w-sm text-center">
      {steps.slice(0, 3).map((s, i) => (
        <CaptionLine key={i} index={i} text={s.t} progress={progress} />
      ))}
    </div>
  );
}

function CaptionLine({
  index,
  text,
  progress,
}: {
  index: number;
  text: string;
  progress: MotionValue<number>;
}) {
  const [start, end] = CAPTION_AT[index];
  const opacity = useTransform(progress, [start, start + 0.01, end, end + 0.01], [0, 1, 1, 0]);
  return (
    <motion.p
      style={{ opacity }}
      className="absolute inset-x-0 top-0 text-[18px] font-bold tracking-tight text-foreground sm:text-[21px]"
    >
      {text}
    </motion.p>
  );
}

/** Reduced motion is given the end of the story, held still. */
function Still() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-[330px]" style={{ height: CARD_H }}>
        <ExplanationCard
          icon={sectionIcon("explanation")}
          title={t((d) => d.doc.sections.explanation)}
          tone="emerald"
          fill
        >
          <p>{t((d) => d.demo.explanation)}</p>
        </ExplanationCard>
      </div>
    </div>
  );
}
