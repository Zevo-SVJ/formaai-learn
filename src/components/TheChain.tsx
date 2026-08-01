import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

/**
 * The problem, played out instead of asserted.
 *
 * The three lines describe a sequence in time — you open the lesson, you ask an
 * AI, the test arrives — and a sequence is the one thing three stacked cards
 * cannot convey. They were three separate statements; this is one thing
 * happening.
 *
 * A page of course notes sits in the middle and stays exactly as grey at the
 * end as it was at the start. An answer arrives over it and lands cleanly. A
 * date arrives after that. The page never changes. That is the argument, and
 * it is made by the absence of change rather than by a sentence: getting the
 * answer left the lesson exactly where it was.
 *
 * The three lines survive as captions, one per beat. Nothing else is needed.
 */

const BEAT_MS = [1900, 2300, 2300];

export function TheChain() {
  const { raw } = useI18n();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const items = raw((d) => d.problem.items) as string[];
  const [beat, setBeat] = useState(0);

  // It runs only while it is on screen, and loops: someone who arrives
  // mid-sequence still sees the whole thing without scrolling back.
  useEffect(() => {
    if (reduceMotion || !inView) return;
    const id = window.setTimeout(() => setBeat((b) => (b + 1) % 3), BEAT_MS[beat]);
    return () => window.clearTimeout(id);
  }, [beat, inView, reduceMotion]);

  // Reduced motion gets the last beat: the lesson still untouched, with the
  // date already there. That is the state the section exists to show.
  const shown = reduceMotion ? 2 : beat;

  return (
    <div ref={ref} className="mx-auto flex max-w-md flex-col items-center">
      <div className="relative h-[268px] w-full max-w-[300px] sm:h-[292px]">
        {/* The lesson. It is the constant, and it is deliberately never
            highlighted, never re-ordered, never touched. */}
        <div className="absolute inset-x-0 top-0 rounded-[1.25rem] border border-border bg-card px-5 py-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-2.5">
            {["88%", "100%", "72%", "94%", "64%", "98%", "80%"].map((w, i) => (
              <span
                key={i}
                aria-hidden
                data-lesson-line
                className="h-1.5 rounded-full bg-border-strong/35"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

        {/* Beat 2: an answer arrives over the lesson. Clean, correct, and
            entirely disconnected from the page underneath it. */}
        <motion.div
          data-answer
          initial={false}
          animate={shown >= 1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.5, ease: EASE.out }}
          className="absolute inset-x-6 top-[118px] rounded-2xl border border-border-strong bg-surface px-4 py-3 shadow-[var(--shadow-lift)]"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
            <span className="text-[15px] font-bold tracking-tight text-foreground">x = 4</span>
          </div>
        </motion.div>

        {/* Beat 3: the date. Nothing on the page has moved since beat one. */}
        <motion.div
          data-date
          initial={false}
          animate={shown >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.45, ease: EASE.out, delay: shown >= 2 ? 0.1 : 0 }}
          className="absolute inset-x-0 bottom-0 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-amber-600">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="h-1.5 w-14 rounded-full bg-amber-600/40" />
          </span>
        </motion.div>
      </div>

      {/* One line at a time, naming the beat being watched. */}
      <div className="relative mt-8 h-12 w-full px-2 text-center">
        {items.slice(0, 3).map((line, i) => (
          <motion.p
            key={i}
            initial={false}
            animate={{ opacity: shown === i ? 1 : 0, y: shown === i ? 0 : 6 }}
            transition={{ duration: 0.35, ease: EASE.out }}
            className="absolute inset-x-0 top-0 text-[15px] leading-snug text-foreground"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
