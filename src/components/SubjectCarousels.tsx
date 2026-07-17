import { useMemo } from "react";
import { SUBJECTS, subjectMetric, subjectName } from "@/lib/curriculum";
import { useI18n } from "@/hooks/useI18n";

function Card({ name, icon, value, label }: { name: string; icon: string; value: string; label: string }) {
  return (
    <div className="mx-1.5 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-soft)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-soft text-[16px] leading-none text-emerald">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[13.5px] font-semibold text-foreground">{name}</span>
        <span className="text-[11.5px] text-muted-foreground">
          <span className="font-semibold text-foreground">{value}</span> {label}
        </span>
      </div>
    </div>
  );
}

function Row({ items, direction }: { items: typeof SUBJECTS; direction: "l" | "r" }) {
  const { locale } = useI18n();
  // Duplicate items so the CSS translation from 0 → -50% loops seamlessly.
  const doubled = useMemo(() => [...items, ...items], [items]);
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
      }}
    >
      <div
        className={`flex w-max ${direction === "l" ? "forma-marquee-l" : "forma-marquee-r"}`}
      >
        {doubled.map((s, i) => {
          const m = subjectMetric(s, locale);
          return (
            <Card
              key={`${s.id}-${i}`}
              name={subjectName(s, locale)}
              icon={s.icon}
              value={m.value}
              label={m.label}
            />
          );
        })}
      </div>
    </div>
  );
}

export function SubjectCarousels() {
  // Split roughly in half, keep visual balance across the two tracks.
  const top = SUBJECTS.filter((_, i) => i % 2 === 0);
  const bottom = SUBJECTS.filter((_, i) => i % 2 === 1);
  return (
    <div className="flex flex-col gap-3">
      <Row items={top} direction="l" />
      <Row items={bottom} direction="r" />
    </div>
  );
}
