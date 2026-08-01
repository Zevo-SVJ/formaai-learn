import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";
import { AnswerVsUnderstanding } from "@/components/AnswerVsUnderstanding";

export function CompareSection() {
  const { t, raw } = useI18n();
  const forma = raw((d) => d.compare.forma);

  return (
    <section id="compare" className="px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
            {t((d) => d.compare.eyebrow)}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t((d) => d.compare.title)}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
            {t((d) => d.compare.subtitle)}
          </p>
        </div>

        {/* What each tool does with the same question, watched side by side.
            The five lines that used to claim "explains step by step" and "made
            to teach, not to solve" are gone: this is them. */}
        <div className="mt-12">
          <AnswerVsUnderstanding />
        </div>

        {/* Only what a demonstration cannot show survives in words: that Forma
            fits a level, builds revision material, and remembers. */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
          {forma.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: 0.05 * i, ease: EASE.out }}
              className="flex items-start gap-2.5 text-[14px] font-medium text-foreground"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
              {line}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
