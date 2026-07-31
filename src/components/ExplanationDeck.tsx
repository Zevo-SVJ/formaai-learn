import { useLayoutEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

/**
 * The explanation cards as a physical deck, mobile only.
 *
 * Same cards, same order, same content — only the presentation changes: one card
 * is read at a time, the next ones peek out behind it, and a horizontal drag
 * moves through them. It follows the landing's "how it works" deck, with two
 * deliberate differences that the content forces:
 *
 *  - It is finite, not cyclic. A lesson has a last card, and looping back to the
 *    first would hide that there is an end. A counter says where you are.
 *  - The height follows the card being read rather than being fixed. Explanation
 *    length varies a lot: a fixed frame either clips the long cards or leaves the
 *    short ones floating in empty space.
 *
 * Dragging works both ways: left reveals the next card, right goes back.
 */
export function ExplanationDeck({ cards }: { cards: React.ReactNode[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [heights, setHeights] = useState<number[]>([]);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Each card's own height, so the deck can follow the card being read instead
  // of standing at the height of the longest one — explanations differ a lot,
  // and a short card floating in a tall frame looks broken. One pass is not
  // enough: web fonts load asynchronously and reflow the text afterwards, so an
  // observer keeps the numbers honest through that and through rotation.
  useLayoutEffect(() => {
    const measure = () => {
      const next = measureRefs.current.map((el) => el?.offsetHeight ?? 0);
      setHeights((prev) =>
        prev.length === next.length && prev.every((h, i) => h === next[i]) ? prev : next,
      );
    };
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    measureRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [cards.length]);

  const last = cards.length - 1;
  // Moves relative to the current index rather than to a computed one: two quick
  // taps land in the same React batch, and an absolute target read from a stale
  // render would make the second one a no-op.
  const step = (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), last));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const flickedLeft = info.offset.x < -80 || info.velocity.x < -420;
    const flickedRight = info.offset.x > 80 || info.velocity.x > 420;
    if (flickedLeft) step(1);
    else if (flickedRight) step(-1);
  };

  return (
    // `relative` is load-bearing: the measuring layer below is absolute, so
    // without it `w-full` resolves against a far-off positioned ancestor. The
    // cards would then be measured wider than they render, the deck would be
    // sized too short, and the layer would push the page sideways.
    <div className="relative sm:hidden">
      {/* Hidden measuring layer: the real cards at the real width, laid out but
          never shown, so the deck can size itself to the tallest one. */}
      <div aria-hidden className="pointer-events-none invisible absolute -z-10 w-full">
        {cards.map((card, i) => (
          <div
            key={i}
            ref={(el) => {
              measureRefs.current[i] = el;
            }}
          >
            {card}
          </div>
        ))}
      </div>

      {/* Every card stays mounted; only its position changes. Mounting and
          unmounting would make the deck depend on an exit animation finishing,
          and a card whose exit never completes stays on top of the new one.
          Placement is plain CSS — transform, opacity and the container height
          all transition natively — so the stack is correct even if a JS
          animation frame is missed. framer is kept for what only it can do:
          the drag gesture. */}
      <div
        className="relative select-none transition-[height] duration-300 ease-out"
        style={{ height: heights[index], touchAction: "pan-y" }}
      >
        {cards.map((card, i) => {
          const pos = i - index;
          const read = pos < 0; // already gone past: parked off to the left
          const depth = Math.min(Math.max(pos, 0), 2);
          const isFront = pos === 0;
          return (
            <div
              key={i}
              className={[
                "absolute inset-x-0 top-0 transition-[transform,opacity] duration-[380ms] ease-out",
                // A card waiting behind keeps its own length, which can be far
                // greater than the one being read. Left alone it hangs below the
                // deck and runs into the controls, so the ones behind are cut to
                // the height of the card in front. Only their edge shows anyway.
                isFront ? "" : "overflow-hidden rounded-3xl",
              ].join(" ")}
              style={{
                transform: read
                  ? "translateX(-115%)"
                  : `translateX(${depth * 14}px) scale(${1 - depth * 0.05})`,
                opacity: read || pos > 2 ? 0 : 1,
                zIndex: cards.length - depth,
                pointerEvents: isFront ? "auto" : "none",
                height: isFront ? undefined : heights[index],
              }}
              aria-hidden={!isFront}
            >
              <motion.div
                drag={isFront ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.5}
                onDragEnd={isFront ? onDragEnd : undefined}
                whileDrag={{ cursor: "grabbing" }}
              >
                {card}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Where you are, and a way through without dragging — a drag alone would
          leave the deck unusable for anyone who cannot perform the gesture. */}
      <div className="mt-4 flex items-center justify-between gap-3">
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
