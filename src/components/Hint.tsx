import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { hasSeenHint, markHintSeen, subscribeToHints, type HintId } from "@/lib/hints";

/**
 * Whether a one-time hint still has anything to teach, and the way to retire it.
 *
 * The server cannot know what this student has already met, so it renders as
 * "seen" and the hint appears after hydration if it is still owed. That keeps a
 * hint from flashing on a screen for someone who learned the gesture months
 * ago.
 */
export function useHint(id: HintId) {
  const seen = useSyncExternalStore(
    subscribeToHints,
    () => hasSeenHint(id),
    () => true,
  );
  return { show: !seen, dismiss: () => markHintSeen(id) };
}

/**
 * A hint: one short line, a small piece of motion carrying the gesture, and no
 * way to get in the way. It has no dismiss button on purpose — performing the
 * gesture is what retires it, so the only thing to do is the thing it asks.
 */
export function Hint({
  show,
  children,
  motionKind = "horizontal",
  className = "",
}: {
  show: boolean;
  children: React.ReactNode;
  /** Which gesture the little animation should mime. */
  motionKind?: "horizontal" | "tap" | "none";
  className?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.2, ease: EASE.inOut } }}
          transition={{ duration: 0.35, ease: EASE.out }}
          className={[
            "pointer-events-none flex items-center justify-center gap-2 text-[12.5px] font-medium text-muted-foreground",
            className,
          ].join(" ")}
        >
          <GestureMark kind={motionKind} />
          <span>{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The gesture itself, drawn small: a card edge sliding, or a finger tapping. */
function GestureMark({ kind }: { kind: "horizontal" | "tap" | "none" }) {
  if (kind === "none") return null;

  if (kind === "tap") {
    return (
      <span aria-hidden className="relative flex h-4 w-4 items-center justify-center">
        <motion.span
          className="absolute h-4 w-4 rounded-full border border-emerald/50"
          animate={{ scale: [1, 1.6, 1.6], opacity: [0.9, 0, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: EASE.out, times: [0, 0.55, 1] }}
        />
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-emerald"
          animate={{ scale: [1, 0.7, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.5] }}
        />
      </span>
    );
  }

  return (
    <span aria-hidden className="relative flex h-4 w-5 items-center">
      <motion.span
        className="absolute h-3 w-3 rounded-[4px] border border-emerald/60 bg-emerald/10"
        animate={{ x: [6, -1, 6], opacity: [1, 0.55, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}
