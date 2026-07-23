import { useI18n } from "@/hooks/useI18n";
import { useCountUp, useLiveTicker } from "@/hooks/useCountUp";
import { useHydrated } from "@/hooks/useHydrated";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

function formatNumber(n: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale.startsWith("fr") ? "fr-FR" : "en-US").format(
      Math.floor(n),
    );
  } catch {
    return Math.floor(n).toLocaleString();
  }
}

function Counter({ base, perMinute, label }: { base: number; perMinute: number; label: string }) {
  const { t, locale } = useI18n();
  const live = useLiveTicker(base, perMinute);
  const animated = useCountUp(live, 1500);
  const hydrated = useHydrated();
  const value = hydrated ? animated : base;
  return (
    <div className="flex flex-col items-start gap-1 rounded-3xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald opacity-60" />
          <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald" />
        </span>
        {t((d) => d.liveCounters.live)}
      </div>
      <div className="font-display text-[26px] font-extrabold tracking-tight text-foreground tabular-nums sm:text-[30px]">
        {formatNumber(value, locale)}
      </div>
      <div className="text-[13px] text-muted-foreground">{label}</div>
    </div>
  );
}

export function LiveCounters() {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE.out }}
      className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <Counter base={128_431} perMinute={4.2} label={t((d) => d.liveCounters.lessons)} />
      <Counter base={382_907} perMinute={11.7} label={t((d) => d.liveCounters.exercises)} />
      <Counter base={19_842} perMinute={0.6} label={t((d) => d.liveCounters.students)} />
    </motion.div>
  );
}
