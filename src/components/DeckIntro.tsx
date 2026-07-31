import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

const STORAGE_KEY = "forma:deckIntroSeen";

// The demo below is the deck in miniature, using its stacking language so the
// gesture shown is unmistakably the one the cards respond to.
const PEEK_X = 12;
const PEEK_Y = 5;
const PEEK_SCALE = 0.06;
const LOOP = 3.2;

/**
 * Explains the card deck the first time a student sees a finished analysis, and
 * never again. It is a small sheet rather than a blocking modal, and instead of
 * describing the gesture it performs it: a hand travels right to left, the top
 * card follows it off the deck, and the one behind steps up into its place.
 */
export function DeckIntro() {
  // Rendered only after mount: the server has no way to know whether this
  // student has already seen it, so deciding on the client avoids a flash.
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      // Storage blocked: skip the intro rather than show it on every analysis.
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // It will show once more next time; harmless.
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE.out }}
          className="fixed inset-0 z-50 flex touch-none items-end justify-center bg-black/40 sm:hidden"
          onClick={dismiss}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-card px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7 shadow-2xl"
          >
            <GestureDemo />

            <h2 className="mt-7 text-center text-[18px] font-bold tracking-tight text-foreground">
              {t((d) => d.doc.deck.introTitle)}
            </h2>
            <p className="mx-auto mt-2 max-w-[19rem] text-center text-[14.5px] leading-relaxed text-muted-foreground">
              {t((d) => d.doc.deck.introBody)}
            </p>

            <button
              onClick={dismiss}
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-foreground py-3 text-[15px] font-semibold text-background transition hover:opacity-90"
            >
              {t((d) => d.doc.deck.introCta)}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The gesture, played on a loop: three stacked cards, the top one carried off
 * to the left while the two behind step forward a rank.
 */
function GestureDemo() {
  // Each card plays the same three-rank cycle, offset in time, so the deck
  // appears to advance continuously without ever running out of cards.
  const ranks = [0, 1, 2];

  return (
    <div aria-hidden className="relative mx-auto h-[104px] w-[176px]">
      {ranks.map((rank) => (
        <motion.div
          key={rank}
          className="absolute left-0 top-0 h-[84px] w-[132px] rounded-2xl border border-border bg-surface"
          style={{ zIndex: 3 - rank }}
          animate={{
            x: [rank * PEEK_X, rank * PEEK_X, -150, (rank + 2) * PEEK_X, (rank + 2) * PEEK_X],
            y: [rank * PEEK_Y, rank * PEEK_Y, 0, (rank + 2) * PEEK_Y, (rank + 2) * PEEK_Y],
            scale: [
              1 - rank * PEEK_SCALE,
              1 - rank * PEEK_SCALE,
              1,
              1 - (rank + 2) * PEEK_SCALE,
              1 - (rank + 2) * PEEK_SCALE,
            ],
            opacity: [1, 1, 0, 0, 1],
          }}
          transition={{
            duration: LOOP,
            times: [0, 0.3, 0.55, 0.6, 0.72],
            repeat: Infinity,
            repeatDelay: LOOP * (2 - rank),
            delay: LOOP * rank,
            ease: EASE.inOut,
          }}
        >
          {/* A hint of text so the shape reads as a card, not a blank tile. */}
          <div className="flex h-full flex-col justify-center gap-1.5 px-4">
            <span className="h-1.5 w-10 rounded-full bg-emerald/70" />
            <span className="h-1.5 w-full rounded-full bg-border-strong/70" />
            <span className="h-1.5 w-3/4 rounded-full bg-border-strong/70" />
          </div>
        </motion.div>
      ))}

      {/* The hand doing it: a soft disc that sweeps right to left in time with
          the card it is carrying. */}
      <motion.span
        className="absolute top-[46px] z-10 h-7 w-7 rounded-full bg-foreground/12 ring-1 ring-foreground/15"
        animate={{ x: [104, 104, -8, -8, 104], opacity: [0, 1, 1, 0, 0] }}
        transition={{
          duration: LOOP,
          times: [0, 0.28, 0.55, 0.66, 1],
          repeat: Infinity,
          ease: EASE.inOut,
        }}
      />
    </div>
  );
}
