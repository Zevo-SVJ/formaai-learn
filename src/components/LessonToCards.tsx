import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { ExplanationCard, sectionIcon } from "@/components/AnalysisCards";

/**
 * What Forma does, shown instead of described.
 *
 * The section used to be three short paragraphs claiming that a lesson goes in
 * and an explanation comes out. Nobody believes a claim like that; they believe
 * it when they watch it happen. So the scroll drives one continuous change of
 * state, in three acts:
 *
 *   1. a sheet of course notes arrives and settles;
 *   2. Forma reads it — a pass sweeps down, and the lines that carry the
 *      lesson light up one after another;
 *   3. those same lines lift off the page and become the cards, which are the
 *      product's real ones.
 *
 * The third act is the payoff and the reason for the other two: the highlighted
 * phrases do not merely precede the cards, they turn into them. That is the
 * whole product in one gesture, and it needs no sentence to explain it.
 *
 * Two rules hold this together. Nothing about the layout depends on an
 * animation frame — every position is CSS, and the scroll only drives opacity,
 * transform and blur — so a missed frame degrades the motion and never the
 * page. And anyone who asked for less motion is shown the last act outright,
 * because that is the state worth seeing.
 */

/** Where each act starts and ends along the scroll of the track. */
const ACT: Record<string, [number, number]> = {
  paperIn: [0, 0.16],
  scan: [0.24, 0.46],
  highlight: [0.3, 0.52],
  paperOut: [0.54, 0.66],
  cardsIn: [0.58, 0.78],
  deckMove: [0.82, 0.96],
};

export function LessonToCards() {
  const { t, raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const steps = raw((d) => d.how.steps) as Array<{ t: string; d: string }>;

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  if (reduceMotion) return <StillFrame steps={steps} />;

  return (
    // Three viewports of track for one screen of stage: enough scroll to let
    // each act breathe, without the page feeling held hostage.
    <div ref={track} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden">
        <Stage progress={scrollYProgress} />
        <Caption progress={scrollYProgress} steps={steps} />
      </div>
      <span className="sr-only">
        {steps.map((s) => `${s.t}. ${s.d}`).join(" ")}
        {t((d) => d.how.swipeHint)}
      </span>
    </div>
  );
}

function Stage({ progress }: { progress: MotionValue<number> }) {
  // The paper arrives, holds while it is read, then leaves as the cards take
  // its place. It never simply disappears: it lifts and blurs, so the cards
  // read as having come out of it.
  const paperY = useTransform(progress, ACT.paperIn, [70, 0]);
  const paperOpacity = useTransform(
    progress,
    [ACT.paperIn[0], ACT.paperIn[1], ACT.paperOut[0], ACT.paperOut[1]],
    [0, 1, 1, 0],
  );
  const paperScale = useTransform(
    progress,
    [ACT.paperIn[0], ACT.paperIn[1], ACT.paperOut[0], ACT.paperOut[1]],
    [0.94, 1, 1, 0.9],
  );
  const paperBlur = useTransform(progress, ACT.paperOut, [0, 6]);
  const paperFilter = useTransform(paperBlur, (b) => `blur(${b}px)`);
  const paperRotate = useTransform(progress, ACT.paperIn, [-3.5, -1.2]);

  return (
    <div className="relative flex h-[360px] w-full max-w-[320px] items-center justify-center sm:h-[400px] sm:max-w-[352px]">
      <motion.div
        style={{
          y: paperY,
          opacity: paperOpacity,
          scale: paperScale,
          rotate: paperRotate,
          filter: paperFilter,
        }}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2"
      >
        <Paper progress={progress} />
      </motion.div>

      <Deck progress={progress} />
    </div>
  );
}

/**
 * The lesson as it arrives: a sheet of notes. The lines are abstract on
 * purpose — inventing a course would put words in a teacher's mouth, and the
 * point being made is about structure, not content.
 */
function Paper({ progress }: { progress: MotionValue<number> }) {
  const scanY = useTransform(progress, ACT.scan, ["-12%", "112%"]);
  const scanOpacity = useTransform(
    progress,
    [ACT.scan[0], ACT.scan[0] + 0.04, ACT.scan[1] - 0.04, ACT.scan[1]],
    [0, 1, 1, 0],
  );

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card px-6 py-7 shadow-[var(--shadow-lift)]">
      <div className="flex flex-col gap-3.5">
        {LINES.map((line, i) => (
          <Line key={i} index={i} width={line.w} keyLine={line.key} progress={progress} />
        ))}
      </div>

      {/* The reading pass. One soft band, once, top to bottom. */}
      <motion.div
        aria-hidden
        style={{ y: scanY, opacity: scanOpacity }}
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, var(--color-emerald-soft) 55%, transparent 100%)",
          }}
        />
        <div className="h-px w-full bg-emerald/40" />
      </motion.div>
    </div>
  );
}

// The sheet: a dozen lines of handwriting, three of which carry the lesson.
// Those three are the ones that will become cards.
const LINES: Array<{ w: string; key?: number }> = [
  { w: "72%" },
  { w: "100%" },
  { w: "88%", key: 0 },
  { w: "94%" },
  { w: "66%" },
  { w: "100%", key: 1 },
  { w: "82%" },
  { w: "97%" },
  { w: "58%", key: 2 },
  { w: "90%" },
  { w: "74%" },
];

function Line({
  index,
  width,
  keyLine,
  progress,
}: {
  index: number;
  width: string;
  keyLine?: number;
  progress: MotionValue<number>;
}) {
  // A line that matters lights up shortly after the pass reaches it, in the
  // order it is read. The rest stay quiet — that contrast is the whole point:
  // Forma is choosing, not transcribing.
  const isKey = keyLine !== undefined;
  const at = ACT.highlight[0] + (keyLine ?? 0) * 0.06;
  const lit = useTransform(progress, [at, at + 0.05], [0, 1]);
  const bg = useTransform(lit, (v) =>
    isKey
      ? `color-mix(in oklab, var(--color-emerald) ${v * 100}%, var(--color-border-strong))`
      : "",
  );
  const litOpacity = useTransform(lit, [0, 1], [0.45, 1]);

  if (!isKey) {
    return (
      <div
        className="h-2 rounded-full bg-border-strong/45"
        style={{ width }}
        aria-hidden
        data-line={index}
      />
    );
  }
  return (
    <motion.div
      aria-hidden
      data-line={index}
      data-key-line
      className="h-2 rounded-full"
      style={{ width, background: bg, opacity: litOpacity }}
    />
  );
}

/**
 * The payoff. Three cards, in the deck's own stacking language, arriving where
 * the sheet was — and then one of them being swiped, because that is what a
 * student will do with them thirty seconds later.
 */
function Deck({ progress }: { progress: MotionValue<number> }) {
  const { t } = useI18n();
  const titles = [
    { key: "explanation", tone: "emerald" as const, title: t((d) => d.doc.sections.explanation) },
    {
      key: "common_mistake",
      tone: "warn" as const,
      title: t((d) => d.doc.sections.commonMistakes),
    },
    { key: "example", tone: "default" as const, title: t((d) => d.doc.sections.example) },
  ];

  const opacity = useTransform(progress, ACT.cardsIn, [0, 1]);
  const advance = useTransform(progress, ACT.deckMove, [0, 1]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      {titles.map((c, i) => (
        <Card key={c.key} index={i} card={c} progress={progress} advance={advance} />
      ))}
    </motion.div>
  );
}

const PEEK_X = 20;
const PEEK_Y = 8;
const PEEK_SCALE = 0.05;

function Card({
  index,
  card,
  progress,
  advance,
}: {
  index: number;
  card: { key: string; tone: "default" | "emerald" | "warn"; title: string };
  progress: MotionValue<number>;
  advance: MotionValue<number>;
}) {
  // Each card rises from where its line sat on the page, so the connection
  // between the two acts is felt rather than asserted.
  const from = ACT.cardsIn[0] + index * 0.05;
  const rise = useTransform(progress, [from, from + 0.12], [26 + index * 10, 0]);

  // The last beat: the top card is taken off and the stack comes up a rank.
  const x = useTransform(
    advance,
    [0, 1],
    [index * PEEK_X, index === 0 ? -320 : (index - 1) * PEEK_X],
  );
  const y = useTransform(advance, [0, 1], [index * PEEK_Y, index === 0 ? 0 : (index - 1) * PEEK_Y]);
  const scale = useTransform(
    advance,
    [0, 1],
    [1 - index * PEEK_SCALE, index === 0 ? 1 : 1 - (index - 1) * PEEK_SCALE],
  );
  const leave = useTransform(advance, [0, 1], [1, index === 0 ? 0 : 1]);

  return (
    <motion.div
      style={{ x, y, scale, opacity: leave, zIndex: 3 - index }}
      className="absolute inset-0"
    >
      <motion.div style={{ y: rise }} className="h-full">
        <div className="h-full rounded-3xl shadow-[var(--shadow-lift)]">
          <ExplanationCard icon={sectionIcon(card.key)} title={card.title} tone={card.tone} fill>
            {/* A real explanation fills its card. Two short paragraphs of
                skeleton rather than four lines, so the deck reads as inhabited
                instead of as an empty frame. */}
            <div className="flex flex-col gap-2.5 pt-1">
              {["w-full", "w-11/12", "w-full", "w-4/5"].map((w, k) => (
                <span key={k} className={`h-2 rounded-full bg-border-strong/40 ${w}`} />
              ))}
              <span className="h-1" />
              {["w-full", "w-10/12", "w-full", "w-3/5"].map((w, k) => (
                <span key={`b${k}`} className={`h-2 rounded-full bg-border-strong/40 ${w}`} />
              ))}
            </div>
          </ExplanationCard>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * The caption. One line at a time, naming the act being watched — the text
 * that survives once the demonstration carries the meaning.
 */
function Caption({
  progress,
  steps,
}: {
  progress: MotionValue<number>;
  steps: Array<{ t: string; d: string }>;
}) {
  return (
    <div className="relative mt-10 h-14 w-full max-w-sm px-5 text-center">
      {steps.slice(0, 3).map((s, i) => (
        <CaptionLine key={i} index={i} text={s.t} progress={progress} />
      ))}
    </div>
  );
}

const CAPTION_AT: Array<[number, number]> = [
  [0.02, 0.24],
  [0.28, 0.52],
  [0.6, 0.99],
];

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
  // Scroll progress is a 0-to-1 range and the browser rejects offsets outside
  // it, so the fade-in and fade-out margins are clamped rather than allowed to
  // run past either end.
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const fadeIn = clamp(start - 0.05);
  const fadeOut = clamp(end + 0.05);
  const opacity = useTransform(
    progress,
    [fadeIn, start, end, fadeOut],
    [0, 1, 1, index === 2 ? 1 : 0],
  );
  const y = useTransform(progress, [fadeIn, start], [8, 0]);
  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute inset-x-0 top-0 text-[19px] font-bold tracking-tight text-foreground sm:text-[22px]"
    >
      {text}
    </motion.p>
  );
}

/**
 * For anyone who asked for less motion: the last act, held still. It is the
 * state that says what the product is.
 */
function StillFrame({ steps }: { steps: Array<{ t: string; d: string }> }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center py-10">
      <div className="relative h-[400px] w-full max-w-[340px]">
        <div className="h-full rounded-3xl shadow-[var(--shadow-lift)]">
          <ExplanationCard
            icon={sectionIcon("explanation")}
            title={t((d) => d.doc.sections.explanation)}
            tone="emerald"
            fill
          >
            <div className="flex flex-col gap-2.5 pt-1">
              {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-3/5"].map((w, k) => (
                <span key={k} className={`h-2 rounded-full bg-border-strong/40 ${w}`} />
              ))}
            </div>
          </ExplanationCard>
        </div>
      </div>
      <p className="mt-8 text-center text-[19px] font-bold tracking-tight text-foreground">
        {steps[2]?.t}
      </p>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: EASE.out }}
        className="mt-2 text-center text-[14px] text-muted-foreground"
      >
        {steps[2]?.d}
      </motion.div>
    </div>
  );
}
