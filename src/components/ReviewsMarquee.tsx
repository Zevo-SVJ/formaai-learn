import { useI18n } from "@/hooks/useI18n";
import { Star } from "lucide-react";
import { useMemo } from "react";

export function ReviewsMarquee() {
  const { raw, t } = useI18n();
  const items = raw((d) => d.reviews.items);
  // Duplicate content so the CSS marquee scrolls seamlessly.
  const track = useMemo(() => [...items, ...items], [items]);
  return (
    <div className="relative overflow-hidden py-2">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 sm:w-32"
        style={{
          background:
            "linear-gradient(90deg, var(--color-background) 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 sm:w-32"
        style={{
          background:
            "linear-gradient(270deg, var(--color-background) 0%, transparent 100%)",
        }}
      />
      <div className="flex w-max animate-[forma-marquee_60s_linear_infinite] gap-4 pr-4">
        {track.map((r, i) => (
          <article
            key={`${r.name}-${i}`}
            className="flex w-[320px] shrink-0 flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:w-[360px]"
            aria-label={t((d) => d.reviews.eyebrow) + ": " + r.name}
          >
            <div className="flex items-center gap-1 text-amber-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-soft text-sm font-bold text-emerald">
                {r.name[0]}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {r.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">{r.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <style>{`
        @keyframes forma-marquee {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[forma-marquee_60s_linear_infinite\\] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
