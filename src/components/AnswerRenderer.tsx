import { motion } from "framer-motion";
import { Sparkles, BookOpen, AlertTriangle, Wand2, MoreHorizontal } from "lucide-react";
import { parseAnswer, type AnswerSection } from "@/lib/format-answer";
import { useI18n } from "@/hooks/useI18n";

const iconFor: Record<AnswerSection["key"], React.ComponentType<{ className?: string }>> = {
  answer: Sparkles,
  explanation: BookOpen,
  method: Wand2,
  commonMistakes: AlertTriangle,
  details: MoreHorizontal,
};

const toneFor: Record<AnswerSection["key"], { bg: string; text: string }> = {
  answer: { bg: "bg-emerald-soft", text: "text-emerald" },
  explanation: { bg: "bg-surface-muted", text: "text-foreground" },
  method: { bg: "bg-accent", text: "text-accent-foreground" },
  commonMistakes: { bg: "bg-amber-500/10", text: "text-amber-600" },
  details: { bg: "bg-surface-muted", text: "text-foreground" },
};

export function AnswerRenderer({ text, compact = false }: { text: string; compact?: boolean }) {
  const { locale, t } = useI18n();
  const parsed = parseAnswer(text, locale);

  if (parsed.raw || parsed.sections.length === 0) {
    // No structured sections detected — render plain paragraphs.
    const paras = (parsed.raw || text).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    return (
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {paras.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-foreground">
            {p.replace(/\s*—\s*/g, ", ")}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {parsed.sections.map((s, i) => {
        const Icon = iconFor[s.key];
        const tone = toneFor[s.key];
        const title =
          s.key === "answer"
            ? t((d) => d.doc.sections.answer)
            : s.key === "explanation"
              ? t((d) => d.doc.sections.explanation)
              : s.key === "method"
                ? t((d) => d.doc.sections.method)
                : s.key === "commonMistakes"
                  ? t((d) => d.doc.sections.commonMistakes)
                  : t((d) => d.doc.sections.details);
        return (
          <motion.section
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className={[
              "rounded-3xl border border-border bg-card p-4 sm:p-5",
              compact ? "" : "shadow-[var(--shadow-soft)]",
            ].join(" ")}
          >
            <header className="mb-3 flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone.bg}`}
              >
                <Icon className={`h-3.5 w-3.5 ${tone.text}`} />
              </div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {title}
              </h3>
            </header>

            {s.choices && s.choices.length > 0 && (
              <ul className="mb-3 space-y-1.5">
                {s.choices.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-start gap-3 rounded-xl bg-surface-muted px-3 py-2"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
                      {c.label}
                    </span>
                    <span className="text-[15px] leading-relaxed text-foreground">
                      {c.value}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {s.paragraphs.map((p, k) => (
              <p key={k} className="mt-1.5 text-[15px] leading-relaxed text-foreground">
                {p}
              </p>
            ))}
          </motion.section>
        );
      })}
    </div>
  );
}
