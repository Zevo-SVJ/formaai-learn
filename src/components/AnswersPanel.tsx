import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { prettifyMath } from "@/lib/math-notation";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

export type Answer = { label: string; question: string; answer: string };

/** The final answers, always shown before any explanation. */
export function AnswersPanel({ answers }: { answers: Answer[] }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    // Copy the same prettified text the student sees.
    const text = answers.map((a, i) => `${a.label || i + 1}. ${prettifyMath(a.answer)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t((d) => d.doc.copied));
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t((d) => d.doc.copyFailed));
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE.out }}
      className="rounded-3xl border border-emerald/25 bg-gradient-to-br from-emerald-soft/70 to-card p-5 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald">
              {t((d) => d.doc.sections.answer)}
            </div>
            <div className="text-[13px] text-muted-foreground">
              {t((d) => d.doc.answersHint)}
            </div>
          </div>
        </div>
        <button
          onClick={copyAll}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] font-semibold text-foreground transition hover:border-emerald hover:text-emerald"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t((d) => d.doc.copied) : t((d) => d.doc.copyAll)}
        </button>
      </div>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {answers.map((a, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 + i * 0.06, ease: EASE.out }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-foreground px-2 text-[13px] font-bold text-background">
                {a.label || String(i + 1)}
              </span>
              <div className="min-w-0 flex-1">
                {a.question && (
                  <div className="mb-1 truncate text-[12px] font-medium text-muted-foreground">
                    {prettifyMath(a.question)}
                  </div>
                )}
                <div className="text-[16px] font-semibold leading-snug text-foreground">
                  {prettifyMath(a.answer)}
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
