import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { getConsent, setConsent } from "@/lib/consent";
import { initAnalytics } from "@/lib/analytics";

/**
 * Asks once, before any analytics loads.
 *
 * Accept and Decline carry the same visual weight on purpose: Forma does not
 * use dark patterns, and declining has to be as easy as accepting. Nothing is
 * pre-selected, and no measurement runs until the student chooses.
 */
export function ConsentBanner() {
  // Rendered only after mount so the server never emits a banner that would
  // flash for someone who already answered.
  const [choice, setChoice] = useState<"pending" | "answered">("answered");
  const { t } = useI18n();

  useEffect(() => {
    setChoice(getConsent() === null ? "pending" : "answered");
  }, []);

  const decide = (granted: boolean) => {
    setConsent(granted ? "granted" : "denied");
    if (granted) initAnalytics();
    setChoice("answered");
  };

  return (
    <AnimatePresence>
      {choice === "pending" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: EASE.out }}
          role="dialog"
          aria-live="polite"
          className="safe-bottom fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <p className="flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
              {t((d) => d.consent.body)}{" "}
              <Link to="/cookies" className="font-semibold text-foreground underline">
                {t((d) => d.consent.more)}
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => decide(false)}
                className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-[13.5px] font-semibold text-foreground transition hover:border-border-strong sm:flex-none"
              >
                {t((d) => d.consent.decline)}
              </button>
              <button
                onClick={() => decide(true)}
                className="flex-1 rounded-full bg-foreground px-4 py-2 text-[13.5px] font-semibold text-background transition hover:opacity-90 sm:flex-none"
              >
                {t((d) => d.consent.accept)}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
