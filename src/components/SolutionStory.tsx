import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { ScanText, BookOpen, FileCheck } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const icons = [ScanText, BookOpen, FileCheck];

// Scroll-progress keyframes (0 → 1 across the tall wrapper). The fade windows
// do not overlap: a step reaches opacity 0 just before the next begins to
// appear, so the two centred texts never coexist and exactly one step is
// present at any moment. The step also slides (outgoing up and away, incoming
// up from below) so the sub-frame handoff reads as an intentional swap.
const OPACITY: { t: number[]; v: number[] }[] = [
  { t: [0, 0.27, 0.33], v: [1, 1, 0] },
  { t: [0.34, 0.4, 0.6, 0.66], v: [0, 1, 1, 0] },
  { t: [0.67, 0.73, 1], v: [0, 1, 1] },
];
const SHIFT: { t: number[]; v: number[] }[] = [
  { t: [0, 0.33], v: [0, -22] },
  { t: [0.34, 0.4, 0.6, 0.66], v: [22, 0, 0, -22] },
  { t: [0.67, 0.73], v: [22, 0] },
];

function Step({
  progress,
  index,
  title,
  body,
}: {
  progress: MotionValue<number>;
  index: number;
  title: string;
  body: string;
}) {
  const Icon = icons[index] ?? FileCheck;
  const opacity = useTransform(progress, OPACITY[index].t, OPACITY[index].v);
  const y = useTransform(progress, SHIFT[index].t, SHIFT[index].v);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-soft">
        <Icon className="h-9 w-9 text-emerald" strokeWidth={1.75} />
      </div>
      <h3 className="mt-8 text-[26px] font-bold tracking-tight text-foreground sm:text-[32px]">
        {title}
      </h3>
      <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
        {body}
      </p>
    </motion.div>
  );
}

/**
 * "La solution" as a scroll-driven story. A tall wrapper pins a full-height
 * frame; scrolling through the wrapper drives the progress that swaps the three
 * steps one at a time. Kept deliberately short (about two and a half viewport
 * heights) so it reads as one story, not a long scroll experience.
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
    setActive(v < 1 / 3 ? 0 : v < 2 / 3 ? 1 : 2);
  });

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
          {items.map((it, i) => (
            <Step key={i} progress={scrollYProgress} index={i} title={it.title} body={it.body} />
          ))}
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
