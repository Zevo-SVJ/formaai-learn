import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Layers } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

const STORAGE_KEY = "forma:deckIntroSeen";

/**
 * Explains the card deck the first time a student sees a finished analysis, and
 * never again. It is a small sheet rather than a blocking modal, and it carries
 * a looping card animation so the gesture is shown, not just described.
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
            className="w-full rounded-t-3xl bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-soft">
                <Layers className="h-5 w-5 text-emerald" />
              </div>
            </div>

            <h2 className="mt-4 text-center text-[18px] font-bold tracking-tight text-foreground">
              {t((d) => d.doc.deck.introTitle)}
            </h2>
            <p className="mx-auto mt-2 max-w-[19rem] text-center text-[14.5px] leading-relaxed text-muted-foreground">
              {t((d) => d.doc.deck.introBody)}
            </p>

            {/* The gesture itself: a small card slides aside on a loop and the
                one behind it takes its place. */}
            <div aria-hidden className="relative mx-auto mt-6 h-[92px] w-[168px]">
              <div className="absolute left-3 top-2 h-[76px] w-[140px] rounded-2xl border border-border bg-surface-muted" />
              <motion.div
                className="absolute left-0 top-0 flex h-[76px] w-[140px] items-center justify-center rounded-2xl border border-border-strong bg-surface shadow-[var(--shadow-soft)]"
                animate={{ x: [0, -14, -150, -150, 0], opacity: [1, 1, 0, 0, 1] }}
                transition={{
                  duration: 2.6,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                  <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
                  <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
                </div>
              </motion.div>
            </div>

            <button
              onClick={dismiss}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-foreground py-3 text-[15px] font-semibold text-background transition hover:opacity-90"
            >
              {t((d) => d.doc.deck.introCta)}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
