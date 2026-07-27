import { motion } from "framer-motion";
import { TrendingUp, Check } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

// A gentle upward grade curve (out of 20) for the mock dashboard.
const SERIES = [8.5, 9, 10, 9.5, 11.5, 12, 13.2, 14.2];
// Per-subject averages, out of 20, shown under the curve.
const SUBJECT_AVGS = [15.4, 13.8, 12.6];

/**
 * A landing section that quietly signals Forma is an evolving product: it
 * introduces the progression-tracking feature with a small "new" tag and a
 * Stripe-clean mini dashboard. Same visual language as the rest of the page —
 * not a changelog, not an update banner.
 */
export function ProgressFeature() {
  const { t, raw, locale } = useI18n();
  const chips = raw((d) => d.progressFeature.chips) as string[];
  const months = raw((d) => d.progressFeature.months) as string[];
  const subjects = raw((d) => d.progressFeature.subjects) as string[];
  const fr = locale.startsWith("fr");
  const avg = fr ? "14,2" : "14.2";
  const delta = fr ? "+1,8" : "+1.8";

  // Chart geometry.
  const W = 320;
  const H = 150;
  const P = 14;
  const maxV = 20;
  const pts = SERIES.map((v, i) => {
    const x = P + (i * (W - 2 * P)) / (SERIES.length - 1);
    const y = H - P - (v / maxV) * (H - 2 * P);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${H - P} L${pts[0][0].toFixed(1)} ${H - P} Z`;

  return (
    <section className="px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE.out }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t((d) => d.progressFeature.title)}
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
            {t((d) => d.progressFeature.body)}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-semibold text-foreground"
              >
                <Check className="h-3.5 w-3.5 text-emerald" strokeWidth={2.5} />
                {c}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Stripe-clean mini dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE.out }}
          className="rounded-[2rem] border border-border bg-card p-5 shadow-[var(--shadow-lift)] sm:p-6"
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[12px] font-medium text-muted-foreground">
                {t((d) => d.progressFeature.average)}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-[34px] font-extrabold tracking-tight text-foreground tabular-nums">
                  {avg}
                </span>
                <span className="text-[15px] font-semibold text-muted-foreground">/20</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2.5 py-1 text-[12px] font-bold text-emerald">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              {delta}
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" aria-hidden>
            <defs>
              <linearGradient id="pf-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-emerald)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--color-emerald)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={P}
                x2={W - P}
                y1={P + f * (H - 2 * P)}
                y2={P + f * (H - 2 * P)}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
            ))}
            <path d={area} fill="url(#pf-fill)" />
            <path
              d={line}
              fill="none"
              stroke="var(--color-emerald)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Only the latest grade is marked — the eye follows the curve, not a
                row of dots. A soft halo makes "where you are now" unmistakable. */}
            <circle
              cx={pts[pts.length - 1][0]}
              cy={pts[pts.length - 1][1]}
              r="7"
              fill="var(--color-emerald)"
              opacity="0.16"
            />
            <circle
              cx={pts[pts.length - 1][0]}
              cy={pts[pts.length - 1][1]}
              r="3.5"
              fill="var(--color-emerald)"
              stroke="var(--color-card)"
              strokeWidth="2"
            />
          </svg>

          {/* Time axis — the whole point of the feature is progress over time. */}
          <div className="mt-1 flex justify-between px-1 text-[11px] font-medium text-muted-foreground">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          {/* Per-subject breakdown — what makes this an academic dashboard
              rather than a generic chart. Deliberately quiet. */}
          <div className="mt-5 space-y-2.5 border-t border-border pt-4">
            {subjects.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-[92px] shrink-0 truncate text-[12px] font-medium text-muted-foreground">
                  {s}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className="block h-full rounded-full bg-emerald"
                    style={{ width: `${(SUBJECT_AVGS[i] / 20) * 100}%` }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right text-[12px] font-semibold text-foreground tabular-nums">
                  {fr ? String(SUBJECT_AVGS[i]).replace(".", ",") : SUBJECT_AVGS[i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
