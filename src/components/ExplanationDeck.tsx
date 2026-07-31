import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

// The same stacking language as the landing's "how it works" deck: each card
// behind the front one is nudged right and down and shrinks a step, so the
// depth is visible at a glance. The scale step is 4%, which puts the three
// visible cards at 100 / 96 / 92.
const PEEK_X = 24;
const PEEK_Y = 8;
const PEEK_SCALE = 0.04;
const VISIBLE_DEPTH = 3; // the front card plus two peeking behind it

// The stage is narrower than the column by the full peek, so the cards behind
// can lean out to the right and still land inside it. Centring the stage would
// then leave the visible stack sitting right of centre, so it is pulled back by
// about half the overhang — the same correction the landing deck makes.
const STAGE_INSET = (VISIBLE_DEPTH - 1) * PEEK_X;
const STAGE_SHIFT = -18;

/**
 * The explanation cards as a physical deck, mobile only.
 *
 * Same cards, same order, same text — only the presentation changes. One card
 * is held on top, the next two peek out behind it, and a horizontal drag lifts
 * the top card away so the one underneath takes its place. It follows the
 * landing's deck, with two differences the content forces:
 *
 *  - It is finite, not cyclic. A lesson has a last card, and looping back to
 *    the first would hide that there is an end, so a counter says where you are
 *    and the deck stops at both ends. Every card stays mounted and animates to
 *    its place in the stack, which is also what lets a swipe be taken back.
 *  - The frame is a fixed size. Explanation lengths vary a lot, and a deck that
 *    resized on every swipe would not read as a stack of cards at all; instead
 *    each card keeps the frame and scrolls its own text.
 */
export function ExplanationDeck({ cards }: { cards: React.ReactNode[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);

  const last = cards.length - 1;
  // Relative to the current index rather than to a computed one: two quick taps
  // land in the same React batch, and an absolute target read from a stale
  // render would make the second one a no-op.
  const step = (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), last));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // A deliberate flick, or a drag past the card's shoulder, moves the deck.
    if (info.offset.x < -90 || info.velocity.x < -450) step(1);
    else if (info.offset.x > 90 || info.velocity.x > 450) step(-1);
  };

  return (
    <div className="sm:hidden">
      <div
        className="relative mx-auto select-none"
        style={{
          width: `calc(100% - ${STAGE_INSET}px)`,
          // Fixed, and in `svh` so a collapsing browser toolbar cannot resize
          // the deck mid-read. The clamp keeps it generous on a large phone and
          // still leaves the controls in view on a small one.
          height: "clamp(300px, 54svh, 420px)",
          transform: `translateX(${STAGE_SHIFT}px)`,
          touchAction: "pan-y",
        }}
      >
        {cards.map((card, i) => {
          const pos = i - index;
          const read = pos < 0;
          const depth = Math.min(pos, VISIBLE_DEPTH - 1);
          const isFront = pos === 0;

          // Read cards leave over the top of the deck rather than sliding under
          // it, which is what makes the gesture read as lifting a card off.
          const rest = read
            ? { x: "-118%", y: 0, scale: 1, opacity: 0 }
            : {
                x: depth * PEEK_X,
                y: depth * PEEK_Y,
                scale: 1 - depth * PEEK_SCALE,
                opacity: pos < VISIBLE_DEPTH ? 1 : 0,
              };

          return (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-3xl"
              style={{
                zIndex: read ? cards.length + 1 : cards.length - depth,
                pointerEvents: isFront ? "auto" : "none",
                // Elevation carries the hierarchy: the card in hand is lifted,
                // the ones waiting underneath sit softer.
                boxShadow: isFront || read ? "var(--shadow-lift)" : "var(--shadow-soft)",
              }}
              initial={false}
              animate={rest}
              transition={
                read ? { duration: 0.34, ease: EASE.inOut } : { duration: 0.42, ease: EASE.out }
              }
              drag={isFront ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.55}
              onDragEnd={isFront ? onDragEnd : undefined}
              whileDrag={{ cursor: "grabbing" }}
              aria-hidden={!isFront}
            >
              {card}
            </motion.div>
          );
        })}
      </div>

      {/* Where you are, and a way through without dragging — a drag alone would
          leave the deck unusable for anyone who cannot perform the gesture. */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={index === 0}
          aria-label={t((d) => d.doc.deck.previous)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            {cards.map((_, i) => (
              <span
                key={i}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-5 bg-emerald" : "w-1.5 bg-border-strong",
                ].join(" ")}
              />
            ))}
          </div>
          <span className="text-[11.5px] font-medium text-muted-foreground">
            {t((d) => d.doc.deck.progress, { current: index + 1, total: cards.length })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={index === last}
          aria-label={t((d) => d.doc.deck.next)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition disabled:opacity-30"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
