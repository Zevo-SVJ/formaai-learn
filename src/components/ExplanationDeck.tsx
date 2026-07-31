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

/** Where a card sits, given how far it is from the front in the cycle. */
type Slot = "front" | "peek" | "back" | "parked";

/**
 * The explanation cards as a physical deck, mobile only.
 *
 * Same cards, same order, same text — only the presentation changes. One card
 * is held on top, the next two peek out behind it, and a horizontal drag lifts
 * the top card away so the one underneath takes its place. It follows the
 * landing's deck, with one difference the content forces: the frame is a fixed
 * size, because explanation lengths vary a lot and a deck that resized on every
 * swipe would not read as a stack of cards at all. A card that has more to say
 * than fits is opened instead.
 *
 * The deck is a loop. Past the last card the first comes back round, so there
 * is no wall to hit and no journey back to the start; the counter says where
 * you are in the cycle rather than how much is left.
 *
 * Tapping the front card opens it. The deck knows nothing about what that means
 * — it reports the index and the page decides — so a saved collection can show
 * the very same deck.
 */
export function ExplanationDeck({
  cards,
  onOpenCard,
}: {
  cards: React.ReactNode[];
  onOpenCard?: (index: number) => void;
}) {
  const { t } = useI18n();
  const n = cards.length;

  // The previous index is kept alongside the current one so a card can tell
  // whether it is making a visible move or merely wrapping round the back of
  // the loop, which should not be animated at all — see `slotOf` below.
  const [nav, setNav] = useState({ index: 0, prev: 0 });
  const { index, prev } = nav;

  // The last position in the cycle is the card that just left, parked off to
  // the side. It only earns its own slot once the stack is deep enough to
  // spare it; with three cards or fewer every card is on show, and advancing
  // simply re-ranks them.
  const parkSlot = n >= 4 ? n - 1 : -1;

  const slotOf = (pos: number): Slot => {
    if (pos === 0) return "front";
    if (pos === parkSlot) return "parked";
    if (pos < VISIBLE_DEPTH) return "peek";
    return "back";
  };

  const step = (delta: number) =>
    setNav(({ index: i }) => ({ prev: i, index: (i + delta + n) % n }));

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
          // The browser keeps vertical panning so the page can still be
          // scrolled from over the deck; everything sideways belongs to the
          // deck. Nothing inside a card scrolls, so this is the only claim on
          // the gesture and there is no second scroller to argue with.
          touchAction: "pan-y",
        }}
      >
        {cards.map((card, i) => {
          const pos = (i - index + n) % n;
          const previousPos = (i - prev + n) % n;
          const slot = slotOf(pos);
          const isFront = slot === "front";
          const depth = Math.min(pos, VISIBLE_DEPTH - 1);

          // A parked card sits off to the left, which is both where a card goes
          // when it is swiped away and where it comes back from when the swipe
          // is taken back.
          const rest =
            slot === "parked"
              ? { x: "-118%", y: 0, scale: 1, opacity: 0 }
              : {
                  x: depth * PEEK_X,
                  y: depth * PEEK_Y,
                  scale: 1 - depth * PEEK_SCALE,
                  opacity: slot === "back" ? 0 : 1,
                };

          // Somewhere in a loop a card has to travel from "just left" back to
          // the bottom of the stack. Both ends of that trip are invisible, so
          // it is made instantly: animating it would send a ghost sliding
          // across the deck for no reason.
          const wasHidden = slotOf(previousPos) === "parked" || slotOf(previousPos) === "back";
          const isHidden = slot === "parked" || slot === "back";
          const transition =
            wasHidden && isHidden
              ? { duration: 0 }
              : slot === "parked"
                ? { duration: 0.34, ease: EASE.inOut }
                : { duration: 0.42, ease: EASE.out };

          return (
            <motion.div
              key={i}
              // The card is focusable so it can be opened from a keyboard, but
              // the browser's default ring is not ours; a keyboard focus gets
              // the app's own instead, and a tap gets none.
              className="absolute inset-0 rounded-3xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald"
              style={{
                zIndex: slot === "parked" ? n + 1 : n - depth,
                pointerEvents: isFront ? "auto" : "none",
                // Elevation carries the hierarchy: the card in hand is lifted,
                // the ones waiting underneath sit softer.
                boxShadow:
                  isFront || slot === "parked" ? "var(--shadow-lift)" : "var(--shadow-soft)",
                cursor: isFront && onOpenCard ? "pointer" : undefined,
              }}
              initial={false}
              animate={rest}
              transition={transition}
              drag={isFront ? "x" : false}
              // The axis is settled on the first movement and held for the rest
              // of the gesture, so a swipe that drifts a little vertically stays
              // a swipe instead of turning into a fight with the page.
              dragDirectionLock
              dragSnapToOrigin
              dragElastic={0.55}
              onDragEnd={isFront ? onDragEnd : undefined}
              whileDrag={{ cursor: "grabbing" }}
              onTap={isFront && onOpenCard ? () => onOpenCard(index) : undefined}
              aria-hidden={!isFront}
              {...(isFront && onOpenCard
                ? {
                    role: "button",
                    tabIndex: 0,
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpenCard(index);
                      }
                    },
                  }
                : {})}
            >
              {card}
            </motion.div>
          );
        })}
      </div>

      {/* Where you are in the loop, and a way round it without dragging — a drag
          alone would leave the deck unusable for anyone who cannot perform the
          gesture. Neither arrow is ever disabled: there is no end to reach. */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t((d) => d.doc.deck.previous)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-border-strong"
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
            {t((d) => d.doc.deck.progress, { current: index + 1, total: n })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label={t((d) => d.doc.deck.next)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-border-strong"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
