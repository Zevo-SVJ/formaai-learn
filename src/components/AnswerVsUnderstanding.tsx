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
import { Check } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Logo } from "@/components/Logo";
import { sectionIcon } from "@/components/AnalysisCards";

/**
 * The difference, watched rather than listed.
 *
 * The section used to argue it in ten parallel sentences: one tool answers, the
 * other teaches. That is a claim about behaviour, and behaviour is the one
 * thing a list cannot show. So both tools are given the same question at the
 * same moment and the reader watches what each does with it.
 *
 * The first attempt at that was still ten fades wearing a demonstration's
 * clothes: every part had its own `opacity: 0 -> 1` on its own delay, so
 * nothing was ever seen to move, arrive from anywhere, or come from anything.
 *
 * Now one question drops in, splits into two, and the two halves travel down
 * their own columns. They are the same object throughout: each becomes its
 * side's answer. Then the sides part - the left one is stopped by a rule drawn
 * under it, and the right one is pushed up by its explanation sliding out from
 * behind it. Nothing fades in; things emerge from behind other things, which is
 * occlusion, and occlusion is something a reader can believe.
 *
 * The empty space under the left answer is the argument, and it is made by
 * nothing arriving there.
 */

// One clock for the whole comparison, so no two parts can disagree about where
// in the story they are. Scroll drives the section above this one; a second
// scroll-driven sequence on the same page would feel like the landing is
// holding the reader in place, so this one plays itself out once.
const RUN_S = 2.5;

const STAGE_H = 296;
const Q_H = 46;
/** Clears the column's own header, so nothing ever travels across the label. */
const TOKEN_TOP = 46;
const ANSWER_TOP = 112;
const ANSWER_H = 42;
const STRIP_H = 34;
const STRIP_GAP = 6;

/** Clamped ramp between two points of the run. */
const ramp = (v: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (v - from) / (to - from)));

/** Everything moving here eases out; nothing in this section should arrive at speed. */
const ease = (v: number) => 1 - Math.pow(1 - v, 3);

export function AnswerVsUnderstanding() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-90px" });
  const p = useMotionValue(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    // Reduced motion gets the end of the story, not the start of it: the point
    // of the section is what is on screen once both tools have finished.
    if (reduceMotion) {
      p.set(1);
      return;
    }
    const c = animate(p, 1, { duration: RUN_S, ease: "linear" });
    return () => c.stop();
  }, [inView, p, reduceMotion]);

  const drop = useTransform(p, (v) => ease(ramp(v, 0, 0.18)));

  return (
    <div ref={ref} className="mx-auto max-w-3xl">
      {/* The question, above both, belonging to neither. It stays on screen for
          the whole run: it is what each column is answering, and taking it away
          would leave two answers to nothing. */}
      <Question drop={drop} />

      {/* Below 360px two columns leave the section labels about fifty pixels
          of text, which is not a comparison anyone can read. There they stack:
          the same two tools, one after the other, at full width. */}
      <div
        className="relative mt-4 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-5"
        aria-hidden
      >
        <Column
          p={p}
          side="other"
          label={t((d) => d.compare.otherTitle)}
          badge={t((d) => d.compare.typical)}
        />
        <Column p={p} side="forma" label={null} badge={t((d) => d.compare.recommended)} />
      </div>

      <p className="sr-only">{t((d) => d.compare.subtitle)}</p>
    </div>
  );
}

/** The one question both tools are given, dropped in before either answers. */
function Question({ drop }: { drop: MotionValue<number> }) {
  const { t } = useI18n();
  const y = useTransform(drop, (v) => -22 + v * 22);
  const opacity = useTransform(drop, (v) => v);

  return (
    <motion.div
      style={{ y, opacity, height: Q_H }}
      className="mx-auto flex max-w-[280px] items-center justify-center rounded-2xl border border-border bg-card px-3 text-center shadow-[var(--shadow-soft)]"
    >
      <span className="line-clamp-2 text-[11.5px] font-medium leading-snug text-foreground">
        {t((d) => d.demo.k3)}
      </span>
    </motion.div>
  );
}

/**
 * One tool's column: it receives the question, produces the answer, and then
 * either stops or keeps going.
 */
function Column({
  p,
  side,
  label,
  badge,
}: {
  p: MotionValue<number>;
  side: "other" | "forma";
  label: string | null;
  badge: string;
}) {
  const { t } = useI18n();
  const other = side === "other";

  // The half of the question that came here: it travels down and settles into
  // the answer slot, widening as it goes. Same element, start to finish.
  const travel = useTransform(p, (v) => ease(ramp(v, 0.2, 0.46)));
  const tokenY = useTransform(travel, (v) => TOKEN_TOP + v * (ANSWER_TOP - TOKEN_TOP));
  // Wide enough from the start to keep what is riding behind it out of sight:
  // occlusion only reads as occlusion if the cover is bigger than the covered.
  const tokenW = useTransform(travel, (v) => 88 + v * 12);
  const tokenH = useTransform(travel, (v) => Q_H - 8 - v * (Q_H - 8 - ANSWER_H));
  const tokenRadius = useTransform(travel, (v) => 16 - v * 4);

  // The answer's own text only belongs to it once it has stopped being the
  // question, so it is uncovered by the tile settling rather than faded on.
  const settled = useTransform(p, (v) => ease(ramp(v, 0.4, 0.52)));

  // The left column is stopped: a rule is drawn under its answer, edge to edge.
  // The right column is not, and its explanation pushes out from behind.
  const close = useTransform(p, (v) => ease(ramp(v, 0.56, 0.78)));
  const dim = useTransform(p, (v) => 1 - ease(ramp(v, 0.6, 0.9)) * 0.55);

  return (
    <motion.div
      style={other ? { opacity: dim, height: STAGE_H } : { height: STAGE_H }}
      className={[
        "relative overflow-hidden rounded-[2rem] border p-4 sm:p-5",
        other
          ? "border-border bg-surface-muted/60"
          : "border-emerald/40 bg-card shadow-[var(--shadow-emerald)]",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        {label ? (
          <span className="truncate text-[12px] font-bold tracking-tight text-muted-foreground sm:text-[13px]">
            {label}
          </span>
        ) : (
          // The mark, not the wordmark: in a column this narrow "Forma AI" wraps
          // onto two lines and runs into the badge beside it.
          <Logo size={22} withWordmark={false} />
        )}
        <span
          className={[
            "shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide sm:px-2 sm:text-[9.5px] sm:tracking-wider",
            other
              ? "border border-border bg-background text-muted-foreground"
              : "bg-emerald text-white",
          ].join(" ")}
        >
          {badge}
        </span>
      </div>

      {/* What Forma goes on to do, sitting behind the answer until the answer is
          given. It is never faded in - it is simply lower down, and slides up
          from under the tile that is covering it. */}
      {!other && <Continues p={p} />}

      {/* The travelling half of the question, which becomes this column's
          answer. Drawn last so it stays over what emerges from behind it. */}
      <motion.div
        style={{
          y: tokenY,
          height: tokenH,
          width: useTransform(tokenW, (v) => `${v}%`),
          borderRadius: tokenRadius,
        }}
        className={[
          "absolute left-1/2 top-0 z-10 -translate-x-1/2 overflow-hidden border",
          other ? "border-border bg-background" : "border-emerald/30 bg-emerald-soft",
        ].join(" ")}
      >
        <motion.div
          style={{ opacity: settled }}
          className="flex h-full items-center justify-center gap-1.5 px-2"
        >
          <Check
            className={`h-3.5 w-3.5 shrink-0 ${other ? "text-muted-foreground" : "text-emerald"}`}
          />
          <span
            className={`truncate text-[12.5px] font-bold ${other ? "text-muted-foreground" : "text-emerald"}`}
          >
            {t((d) => d.doc.sections.answer)}
          </span>
        </motion.div>
      </motion.div>

      {/* The full stop. A rule drawn across the column, under an answer with
          nothing beneath it. */}
      {other && (
        <motion.div
          style={{ scaleX: close, top: ANSWER_TOP + ANSWER_H + 14 }}
          className="absolute inset-x-4 h-px origin-left bg-border-strong sm:inset-x-5"
        />
      )}
    </motion.div>
  );
}

/**
 * The three things Forma does after the answer.
 *
 * They start stacked exactly under the answer tile, hidden by it, and slide
 * down into place one after another - so each is seen to come out of the
 * answer rather than to appear beside it. Titles only: at this width a body of
 * text would be too small to read, and what is being claimed is that there is
 * more, not what the more says.
 */
const AFTER = [
  { key: "explanation", title: "explanation" },
  { key: "common_mistake", title: "commonMistakes" },
  { key: "example", title: "example" },
] as const;

function Continues({ p }: { p: MotionValue<number> }) {
  return (
    <>
      {AFTER.map((a, i) => (
        <Strip key={a.key} index={i} meta={a} p={p} />
      ))}
    </>
  );
}

function Strip({
  index,
  meta,
  p,
}: {
  index: number;
  meta: (typeof AFTER)[number];
  p: MotionValue<number>;
}) {
  const { t } = useI18n();
  const start = 0.56 + index * 0.11;
  // It rides behind the token for the whole journey down, then slides out from
  // under it. Tracking the token rather than waiting at the destination is what
  // keeps it hidden: a strip parked where the answer will land is a strip the
  // reader sees before anything has covered it.
  const y = useTransform(p, (v) => {
    const carried = TOKEN_TOP + ease(ramp(v, 0.2, 0.46)) * (ANSWER_TOP - TOKEN_TOP);
    const out = ease(ramp(v, start, start + 0.2));
    return carried + out * (ANSWER_H + 12 + index * (STRIP_H + STRIP_GAP));
  });
  const Icon = sectionIcon(meta.key);

  return (
    <motion.div
      style={{ y, height: STRIP_H, zIndex: 5 - index }}
      className="absolute inset-x-4 top-0 flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 sm:inset-x-5"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-[9px] font-semibold uppercase tracking-[0.02em] text-muted-foreground sm:text-[10px] sm:tracking-[0.1em]">
        {t((d) => d.doc.sections[meta.title])}
      </span>
    </motion.div>
  );
}
