import { useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Camera, ScanText, Lightbulb } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

const stepIcons = [Camera, ScanText, Lightbulb];

type Step = { t: string; d: string };

/**
 * The "How it works" steps. On mobile they behave like a physical deck: one
 * portrait card is fully visible, the next ones peek out on the right, and a
 * horizontal swipe lifts the top card away so the deck advances. That reads as
 * "there is more to explore" without pagination dots — which the preceding
 * section already uses, so reusing them here was confusing. On desktop the
 * three cards sit side by side, where everything is visible at once. Content
 * and copy are unchanged; only the presentation is new.
 */
export function HowItWorksCarousel() {
  const { raw } = useI18n();
  const steps = raw((d) => d.how.steps) as Step[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: EASE.out }}
    >
      {/* Mobile: a swipeable deck. */}
      <Deck steps={steps} />

      {/* Desktop: the full set, side by side — no deck needed with the room. */}
      <div className="hidden gap-5 sm:grid sm:grid-cols-3">
        {steps.map((s, i) => (
          <StepCard key={i} step={s} index={i} className="border-border" />
        ))}
      </div>
    </motion.div>
  );
}

/** One card. Purely presentational; identical markup in the deck and the grid. */
function StepCard({
  step,
  index,
  className = "",
}: {
  step: Step;
  index: number;
  className?: string;
}) {
  const Icon = stepIcons[index] ?? Lightbulb;
  return (
    <article
      className={[
        "flex h-full flex-col items-center justify-center rounded-[2rem] border bg-surface px-7 py-10 text-center sm:px-6 sm:py-12",
        className,
      ].join(" ")}
    >
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[1.25rem] bg-emerald-soft">
        <Icon className="h-8 w-8 text-emerald" strokeWidth={1.75} />
      </div>
      <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald">
        {`0${index + 1}`}
      </div>
      <h3 className="mt-3 text-[22px] font-bold tracking-tight text-foreground">{step.t}</h3>
      <p className="mt-3 max-w-[16rem] text-[15px] leading-relaxed text-muted-foreground">
        {step.d}
      </p>
    </article>
  );
}

type DeckCard = { key: number; step: number };

// How far each card behind the front is nudged right and down, and how much it
// shrinks. The x offset is tuned so ~16% of the next card shows past the front
// card's right edge — enough to read as a stack that is almost touching.
const PEEK_X = 34;
const PEEK_Y = 8;
const PEEK_SCALE = 0.05;
const VISIBLE_DEPTH = 3; // front + two peeking

function Deck({ steps }: { steps: Step[] }) {
  const [cards, setCards] = useState<DeckCard[]>(() =>
    steps.map((_, i) => ({ key: i, step: i })),
  );
  const nextKey = useRef(steps.length);

  // Lift the top card off and drop it at the back, so the deck never runs out.
  const advance = () =>
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      return [...rest, { key: nextKey.current++, step: first.step }];
    });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // A deliberate left flick or a drag past the card's shoulder lifts it.
    if (info.offset.x < -90 || info.velocity.x < -450) advance();
  };

  return (
    <div className="sm:hidden">
      {/* The wrapper is the width of the front card; peeking cards overflow to
          the right into the section padding. Nudged left by roughly half the
          peek so the visible deck still reads as centered. */}
      <div
        className="relative mx-auto h-[366px] w-[264px] select-none"
        style={{ transform: `translateX(-${PEEK_X / 2}px)`, touchAction: "pan-y" }}
      >
        <AnimatePresence initial={false}>
          {cards.map((card, pos) => {
            if (pos >= VISIBLE_DEPTH) return null;
            const isFront = pos === 0;
            const rest = {
              x: pos * PEEK_X,
              y: pos * PEEK_Y,
              scale: 1 - pos * PEEK_SCALE,
              opacity: 1,
            };
            return (
              <motion.div
                key={card.key}
                className="absolute inset-0"
                style={{ zIndex: cards.length - pos }}
                initial={{ ...rest, opacity: 0 }}
                animate={rest}
                exit={{
                  x: "-118%",
                  opacity: 0,
                  transition: { duration: 0.32, ease: EASE.inOut },
                }}
                transition={{ duration: 0.42, ease: EASE.out }}
                drag={isFront ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.55}
                onDragEnd={isFront ? onDragEnd : undefined}
                whileDrag={{ cursor: "grabbing" }}
              >
                <StepCard
                  step={steps[card.step]}
                  index={card.step}
                  className={
                    isFront
                      ? "border-border-strong shadow-[var(--shadow-soft)]"
                      : "border-border shadow-[var(--shadow-soft)]"
                  }
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
