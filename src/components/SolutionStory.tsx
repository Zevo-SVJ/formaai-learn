import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ScanText, BookOpen, FileCheck } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const icons = [ScanText, BookOpen, FileCheck];

/**
 * "La solution" as a scroll-driven story. A tall wrapper pins a full-height
 * frame; scroll position selects which of the three steps is shown.
 *
 * The swap uses AnimatePresence in "wait" mode: the outgoing step fully plays
 * its exit (fade out, slide up) before the incoming step mounts and fades in.
 * Only one step is ever mounted, so two titles/descriptions can never overlap.
 */
export function SolutionStory() {
  const { t, raw } = useI18n();
  const items = raw((d) => d.solution.items);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v < 0.34 ? 0 : v < 0.67 ? 1 : 2;
    setActive((prev) => (prev === next ? prev : next));
  });

  const item = items[active];
  const Icon = icons[active] ?? FileCheck;

  return (
    <section ref={ref} className="relative h-[260vh] bg-surface-muted/50">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-5 py-16 sm:py-20">
        <header className="shrink-0 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
            {t((d) => d.solution.eyebrow)}
          </div>
          <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t((d) => d.solution.title)}
          </h2>
        </header>

        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-soft">
                <Icon className="h-9 w-9 text-emerald" strokeWidth={1.75} />
              </div>
              <h3 className="mt-8 text-[26px] font-bold tracking-tight text-foreground sm:text-[32px]">
                {item.title}
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
                {item.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2">
          {items.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={[
                "h-1.5 rounded-full transition-all duration-500",
                i === active ? "w-6 bg-emerald" : "w-1.5 bg-border-strong",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
