import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

// Elegant, subtle, premium: four overlapping avatars with a single initial.
const AVATARS: { initial: string; from: string; to: string; ink: string }[] = [
  { initial: "L", from: "#f6e0c8", to: "#e8b98a", ink: "#6b3d18" },
  { initial: "A", from: "#dcd2f5", to: "#b6a4e6", ink: "#3a2a70" },
  { initial: "M", from: "#cfe7d5", to: "#8fc8a2", ink: "#1e4a2d" },
  { initial: "S", from: "#f4d0d3", to: "#d98a94", ink: "#5c1e26" },
];

export function SocialProof() {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="inline-flex items-center gap-3 rounded-full border border-border bg-surface/80 py-1.5 pl-1.5 pr-4 shadow-[var(--shadow-soft)] backdrop-blur"
    >
      <div className="flex -space-x-2">
        {AVATARS.map((a, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold tracking-[-0.02em]"
            style={{
              background: `linear-gradient(135deg, ${a.from} 0%, ${a.to} 100%)`,
              color: a.ink,
            }}
          >
            {a.initial}
          </span>
        ))}
      </div>
      <p className="text-[12.5px] font-medium text-muted-foreground">
        <span className="font-bold text-foreground">{t((d) => d.social.count)}</span>{" "}
        {t((d) => d.social.label)}
      </p>
    </motion.div>
  );
}
