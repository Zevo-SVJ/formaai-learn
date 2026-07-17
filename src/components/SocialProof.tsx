import { motion } from "framer-motion";
import { useI18n } from "@/hooks/useI18n";

const AVATARS = [
  "linear-gradient(135deg, #f6c58a 0%, #e08a5b 100%)",
  "linear-gradient(135deg, #c9b1ff 0%, #7a5cc4 100%)",
  "linear-gradient(135deg, #a7d8b4 0%, #4f9a6e 100%)",
  "linear-gradient(135deg, #f4a1a1 0%, #c65c78 100%)",
];

export function SocialProof({ align = "center" }: { align?: "center" | "start" }) {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={[
        "inline-flex items-center gap-3 rounded-full border border-border bg-surface/80 py-1.5 pl-1.5 pr-4 shadow-[var(--shadow-soft)] backdrop-blur",
        align === "center" ? "" : "",
      ].join(" ")}
    >
      <div className="flex -space-x-2">
        {AVATARS.map((bg, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-block h-7 w-7 rounded-full border-2 border-background"
            style={{
              background: bg,
              filter: "blur(1.6px) saturate(1.1)",
            }}
          />
        ))}
      </div>
      <p className="text-[12.5px] font-medium text-muted-foreground">
        <span className="font-bold text-foreground">{t((d) => d.social.count)}</span>{" "}
        {t((d) => d.social.label)}
      </p>
    </motion.div>
  );
}
