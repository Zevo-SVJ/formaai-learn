import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bookmark, Check, Layers } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { ExplanationCard, sectionIcon } from "@/components/AnalysisCards";

/**
 * The two things worth knowing about the cards, shown rather than described.
 *
 * It is a scripted sequence, not a set of looping keyframes: one beat at a
 * time, each with its own dwell, and every element reads the current beat and
 * animates to where it should be. That is what lets the second scene follow the
 * first as a story — swipe through the deck, then keep a card and watch it land
 * in the library — instead of two unrelated loops running side by side. It also
 * means the whole thing can be inspected one beat at a time.
 *
 * The cards are the app's own `ExplanationCard`, at the app's own sizes, so
 * what is rehearsed here is exactly what will be met in a minute.
 */

// Each beat, and how long it holds. Roughly 4.4s for the deck, 5.2s for the
// save — long enough to follow, short enough not to be waited out.
const BEATS = [
  { scene: "deck", ms: 1000 }, // 0 the stack, at rest
  { scene: "deck", ms: 700 }, // 1 the hand arrives and presses
  { scene: "deck", ms: 950 }, // 2 the hand carries the top card away
  { scene: "deck", ms: 1000 }, // 3 the deck has moved on, the hand lifts off
  { scene: "deck", ms: 750 }, // 4 a breath
  { scene: "save", ms: 1000 }, // 5 a card, opened
  { scene: "save", ms: 750 }, // 6 the hand reaches the keep button
  { scene: "save", ms: 900 }, // 7 kept
  { scene: "save", ms: 800 }, // 8 the sheet drops away
  { scene: "save", ms: 1400 }, // 9 the library, with the card just added
  { scene: "save", ms: 600 }, // 10 a breath, then round again
] as const;

export function CardsTour() {
  const reduceMotion = useReducedMotion();
  const [beat, setBeat] = useState(0);

  // Anyone who asked for less motion gets the two scenes as stills rather than
  // a sequence that never settles.
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => setBeat((b) => (b + 1) % BEATS.length), BEATS[beat].ms);
    return () => window.clearTimeout(id);
  }, [beat, reduceMotion]);

  const scene = reduceMotion ? "deck" : BEATS[beat].scene;

  return (
    <div
      aria-hidden
      className="relative mx-auto h-[300px] w-full max-w-[300px] select-none overflow-hidden"
    >
      <Scene show={scene === "deck"}>
        <DeckScene beat={beat} still={!!reduceMotion} />
      </Scene>
      <Scene show={scene === "save"}>
        <SaveScene beat={beat} />
      </Scene>
    </div>
  );
}

/**
 * One scene at a time. The outgoing one leaves before the incoming one
 * arrives — crossing them over at equal opacity would put two different
 * screens on top of each other and read as a double exposure.
 */
function Scene({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.97 }}
      transition={{
        duration: show ? 0.3 : 0.18,
        delay: show ? 0.18 : 0,
        ease: EASE.out,
      }}
      style={{ pointerEvents: "none" }}
    >
      {children}
    </motion.div>
  );
}

// The deck's own stacking language, scaled to the demo's smaller frame.
const PEEK_X = 18;
const PEEK_Y = 7;
const PEEK_SCALE = 0.05;

/**
 * Scene one: three cards, a hand, and a swipe. The top card leaves, the second
 * takes its place, the third steps up, and the first comes back round behind —
 * which is what the deck itself does.
 */
function DeckScene({ beat, still }: { beat: number; still: boolean }) {
  const { t } = useI18n();
  const cards = [
    { key: "explanation", tone: "emerald" as const, text: t((d) => d.onboarding.cards.d1) },
    { key: "why", tone: "default" as const, text: t((d) => d.onboarding.cards.d2) },
    { key: "example", tone: "default" as const, text: t((d) => d.onboarding.cards.d3) },
  ];
  const titles: Record<string, string> = {
    explanation: t((d) => d.doc.sections.explanation),
    why: t((d) => d.doc.sections.why),
    example: t((d) => d.doc.sections.example),
  };

  // The deck has moved on from beat 3: the front card has gone and everything
  // behind it has come up a rank.
  const advanced = !still && beat >= 3;
  const leaving = !still && beat === 2;

  return (
    <div className="relative mx-auto h-[286px] w-[260px]">
      {cards.map((c, i) => {
        // Rank in the stack, before and after the swipe.
        const rank = advanced ? (i + 2) % 3 : i;
        const gone = leaving && i === 0;
        return (
          <motion.div
            key={c.key}
            className="absolute inset-0"
            style={{ zIndex: 3 - rank }}
            initial={false}
            animate={{
              x: gone ? -240 : rank * PEEK_X,
              y: gone ? 0 : rank * PEEK_Y,
              scale: gone ? 1 : 1 - rank * PEEK_SCALE,
              opacity: gone ? 0 : 1,
            }}
            transition={{
              duration: gone ? 0.42 : 0.5,
              ease: gone ? EASE.inOut : EASE.out,
              // Coming back round the loop happens out of sight, so it is not
              // animated across the frame.
              ...(rank === 2 && advanced ? { duration: 0 } : null),
            }}
          >
            <div className="h-[286px] w-[224px] rounded-3xl shadow-[var(--shadow-lift)]">
              <ExplanationCard icon={sectionIcon(c.key)} title={titles[c.key]} tone={c.tone} fill>
                <p>{c.text}</p>
              </ExplanationCard>
            </div>
          </motion.div>
        );
      })}

      {/* The hand: it presses, carries, and lifts. Nothing else. */}
      <Hand
        show={!still && beat >= 1 && beat <= 3}
        pressed={!still && beat >= 1 && beat <= 2}
        x={!still && beat >= 2 ? -108 : 0}
        left={118}
        top={158}
      />
    </div>
  );
}

/**
 * Scene two: the card is open, the hand keeps it, and the library shows where
 * it went. The point is the last frame — "that is where I find it again".
 */
function SaveScene({ beat }: { beat: number }) {
  const { t } = useI18n();
  const kept = beat >= 7;
  const sheetGone = beat >= 8;
  const inLibrary = beat >= 9;

  return (
    <div className="relative mx-auto h-[286px] w-[260px] overflow-hidden rounded-3xl border border-border bg-background">
      {/* The library underneath, revealed as the sheet drops away. */}
      <motion.div
        className="absolute inset-0 p-3"
        initial={false}
        animate={{ opacity: inLibrary ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE.out }}
      >
        <div className="flex gap-1 rounded-xl border border-border bg-surface-muted p-0.5">
          <div className="flex-1 rounded-lg px-2 py-1.5 text-center text-[9px] font-semibold text-muted-foreground">
            <Layers className="mx-auto h-3 w-3" />
          </div>
          <div className="flex-1 rounded-lg bg-card px-2 py-1.5 text-center text-[9px] font-semibold text-foreground shadow-[var(--shadow-soft)]">
            {t((d) => d.collections.tabCards)}
          </div>
        </div>

        {/* The card that was just kept, landing on the shelf. */}
        <motion.div
          className="mt-3 rounded-2xl border border-emerald/30 bg-card p-3"
          initial={false}
          animate={
            inLibrary
              ? { opacity: 1, y: 0, scale: [0.94, 1.03, 1] }
              : { opacity: 0, y: 10, scale: 0.94 }
          }
          transition={{ duration: 0.55, ease: EASE.out, times: [0, 0.55, 1] }}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-soft">
              <Bookmark className="h-3 w-3 text-emerald" />
            </div>
            <Check className="h-3 w-3 text-emerald" />
          </div>
          <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t((d) => d.doc.sections.explanation)}
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-foreground">
            {t((d) => d.onboarding.cards.d1)}
          </div>
        </motion.div>
      </motion.div>

      {/* The reader, over it. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-4 shadow-2xl"
        initial={false}
        animate={{ y: sheetGone ? 300 : 0 }}
        transition={{ duration: 0.5, ease: EASE.inOut }}
      >
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-border-strong" />
        <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t((d) => d.doc.sections.explanation)}
        </div>
        <p className="mb-4 line-clamp-3 text-[12px] leading-relaxed text-foreground">
          {t((d) => d.onboarding.cards.d1)}
        </p>
        <motion.div
          className={[
            "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-semibold",
            kept ? "bg-emerald-soft text-emerald" : "bg-foreground text-background",
          ].join(" ")}
          initial={false}
          animate={{ scale: beat === 6 ? 0.97 : 1 }}
          transition={{ duration: 0.2, ease: EASE.out }}
        >
          <motion.span
            key={kept ? "kept" : "keep"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 420 }}
            className="flex items-center gap-1.5"
          >
            {kept ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            {kept ? t((d) => d.doc.deck.cardSaved) : t((d) => d.doc.deck.saveCard)}
          </motion.span>
        </motion.div>
      </motion.div>

      <Hand show={beat >= 6 && beat <= 7} pressed={beat === 6} x={0} left={112} top={240} />
    </div>
  );
}

/**
 * A hand, drawn as little as it can be and still read as one: a soft disc with
 * a fingertip. A cursor arrow would say "mouse"; this says "your thumb".
 */
function Hand({
  show,
  pressed,
  x,
  left,
  top,
}: {
  show: boolean;
  pressed: boolean;
  x: number;
  left: number;
  top: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute z-20"
      style={{ left, top }}
      initial={false}
      animate={{ x, opacity: show ? 1 : 0, scale: pressed ? 0.88 : 1 }}
      transition={{ duration: 0.45, ease: EASE.inOut }}
    >
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-foreground/10 ring-1 ring-foreground/15" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/45"
          initial={false}
          animate={{ scale: pressed ? 0.75 : 1 }}
          transition={{ duration: 0.2, ease: EASE.out }}
        />
      </div>
    </motion.div>
  );
}
