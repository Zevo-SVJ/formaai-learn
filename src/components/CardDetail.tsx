import { useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Check, X, Bookmark } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { RichAnswer } from "@/components/RichAnswer";

export type DetailCard = {
  key: string;
  title: string;
  tone: "default" | "emerald" | "warn";
  text: string;
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * One card, opened to be read properly.
 *
 * The deck keeps every card the same size, which is what makes it a deck — so
 * the long explanations have to be readable somewhere else. This is that place:
 * a sheet that rises over the deck, with the room to set the text at a
 * comfortable measure and let it scroll naturally. It is also where a card can
 * be kept, since keeping one only makes sense once you have read it.
 *
 * It can be pulled down to dismiss, the way a sheet should behave, with the
 * close button and the scrim as the other two ways out.
 */
export function CardDetail({
  card,
  saved,
  hint,
  onSave,
  onClose,
}: {
  card: DetailCard | null;
  saved: boolean;
  /** One line above the action, shown only until a card has been kept once. */
  hint?: string | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const Icon = card?.icon;

  // Escape closes it, as any dialog should.
  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, onClose]);

  // The page behind must not scroll while the sheet is over it.
  useEffect(() => {
    if (!card) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [card]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  const iconBg =
    card?.tone === "emerald"
      ? "bg-emerald-soft"
      : card?.tone === "warn"
        ? "bg-amber-500/10"
        : "bg-surface-muted";
  const iconColor =
    card?.tone === "emerald"
      ? "text-emerald"
      : card?.tone === "warn"
        ? "text-amber-600"
        : "text-foreground";

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE.out }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={card.title}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", damping: 34, stiffness: 320, mass: 0.9 }}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
            className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-card shadow-2xl sm:max-h-[80vh] sm:max-w-xl sm:rounded-[1.75rem]"
          >
            {/* The grab handle: the only thing that says "you can pull this down". */}
            <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
              <span className="h-1 w-9 rounded-full bg-border-strong" />
            </div>

            <div className="flex shrink-0 items-center gap-3 px-6 pb-4 pt-3 sm:pt-6">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
                {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
              </div>
              <h2 className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {card.title}
              </h2>
              <button
                onClick={onClose}
                aria-label={t((d) => d.common.close)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition hover:border-border-strong hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* The reason this view exists: the text, at a comfortable size and
                measure, scrolling on its own. */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-2">
              <div className="space-y-3 text-[16.5px] leading-[1.7] text-foreground">
                <RichAnswer text={card.text} />
              </div>
            </div>

            <div className="shrink-0 px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
              {hint && !saved && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25, ease: EASE.out }}
                  className="mb-2 text-center text-[12.5px] font-medium text-muted-foreground"
                >
                  {hint}
                </motion.p>
              )}
              <SaveButton saved={saved} onSave={onSave} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Keeping a card, and saying so.
 *
 * The confirmation is the button itself changing state rather than a toast
 * appearing somewhere else: the thing you pressed is the thing that answers.
 * Pressing again gives the card back, so nothing here is a one-way door.
 */
function SaveButton({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  const { t } = useI18n();
  // A brief flourish on the transition into "kept", not on the way out.
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    if (!saved) return setJustSaved(false);
    setJustSaved(true);
    const id = window.setTimeout(() => setJustSaved(false), 900);
    return () => window.clearTimeout(id);
  }, [saved]);

  return (
    <button
      onClick={onSave}
      aria-pressed={saved}
      className={[
        "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl py-3.5 text-[15px] font-semibold transition-colors",
        saved ? "bg-emerald-soft text-emerald" : "bg-foreground text-background hover:opacity-90",
      ].join(" ")}
    >
      {/* A single soft sweep across the button the moment it is kept. */}
      <AnimatePresence>
        {justSaved && (
          <motion.span
            aria-hidden
            className="absolute inset-y-0 w-1/2 bg-emerald/10"
            initial={{ x: "-120%" }}
            animate={{ x: "220%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE.out }}
          />
        )}
      </AnimatePresence>

      <motion.span
        key={saved ? "saved" : "save"}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 420 }}
        className="relative flex items-center gap-2"
      >
        {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? t((d) => d.doc.deck.cardSaved) : t((d) => d.doc.deck.saveCard)}
      </motion.span>
    </button>
  );
}
