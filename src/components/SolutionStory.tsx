import { motion } from "framer-motion";
import { ScanText, BookOpen, FileCheck } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

const icons = [ScanText, BookOpen, FileCheck];

/**
 * "La solution" as a calm, natural scroll story. The three steps are stacked
 * and each one reveals with a gentle fade + rise as it enters the viewport.
 *
 * Deliberately not scroll-driven: the previous version pinned a full-height
 * frame for 260vh and swapped steps by scroll position, which hijacked the
 * scroll and felt like the page was stuck. Here the visitor scrolls normally
 * and the animation simply supports the content, Apple-style.
 */
export function SolutionStory() {
  const { t, raw } = useI18n();
  const items = raw((d) => d.solution.items) as Array<{ title: string; body: string }>;

  return (
    <section className="bg-surface-muted/50 px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
          {t((d) => d.solution.eyebrow)}
        </div>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t((d) => d.solution.title)}
        </h2>
      </div>

      <div className="mx-auto mt-16 flex max-w-md flex-col gap-14 sm:mt-20 sm:gap-20">
        {items.map((item, i) => {
          const Icon = icons[i] ?? FileCheck;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: EASE.out }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-soft">
                <Icon className="h-9 w-9 text-emerald" strokeWidth={1.75} />
              </div>
              <h3 className="mt-7 text-[26px] font-bold tracking-tight text-foreground sm:text-[30px]">
                {item.title}
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
                {item.body}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
