import { useLocaleToggle } from "@/hooks/useI18n";
import { useHydrated } from "@/hooks/useHydrated";

export function LanguageSwitcher({ variant = "pill" }: { variant?: "pill" | "ghost" }) {
  const { locale, change } = useLocaleToggle();
  const hydrated = useHydrated();
  if (!hydrated) return null;

  const items: Array<{ id: "en" | "fr"; label: string }> = [
    { id: "en", label: "EN" },
    { id: "fr", label: "FR" },
  ];
  const isGhost = variant === "ghost";
  return (
    <div
      className={[
        "inline-flex items-center rounded-full p-0.5 text-[11px] font-semibold",
        isGhost ? "bg-transparent" : "border border-border bg-surface",
      ].join(" ")}
      role="group"
      aria-label="Language"
    >
      {items.map((it) => {
        const active = locale === it.id;
        return (
          <button
            key={it.id}
            onClick={() => change(it.id)}
            className={[
              "rounded-full px-2.5 py-1 transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            aria-pressed={active}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
