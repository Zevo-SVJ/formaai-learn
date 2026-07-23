import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

export function CompareSection() {
  const { t, raw } = useI18n();
  const forma = raw((d) => d.compare.forma);
  const other = raw((d) => d.compare.other);

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

        <div className="mt-12 grid gap-4 md:grid-cols-2 md:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE.out }}
            className="relative overflow-hidden rounded-[2rem] border border-emerald/40 bg-card p-7 shadow-[var(--shadow-emerald)] sm:p-9"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70 blur-3xl"
              style={{ background: "var(--color-emerald-soft)" }}
            />
            <div className="relative flex items-center justify-between">
              <Logo size={26} />
              <span className="rounded-full bg-emerald px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                {t((d) => d.compare.recommended)}
              </span>
            </div>
            <ul className="relative mt-7 space-y-3.5">
              {forma.map((line, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.05 * i, ease: EASE.out }}
                  className="flex items-start gap-3 text-[15px] font-medium text-foreground"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {line}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE.out }}
            className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-muted/60 p-7 sm:p-9"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold tracking-tight text-muted-foreground">
                {t((d) => d.compare.otherTitle)}
              </span>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t((d) => d.compare.typical)}
              </span>
            </div>
            <ul className="mt-7 space-y-3.5">
              {other.map((line, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.05 * i, ease: EASE.out }}
                  className="flex items-start gap-3 text-[15px] text-muted-foreground"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                    <Minus className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {line}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
