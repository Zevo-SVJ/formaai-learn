import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, BookOpen, ClipboardList, ListChecks } from "lucide-react";
import { EASE } from "@/lib/motion";
import { useI18n } from "@/hooks/useI18n";

/**
 * How hard a quiz should be, and how much of it there should be.
 *
 * A quiz that is always the same depth is useful once. The level is asked for
 * before anything is generated, because it changes what is worth generating:
 * an easy round is short and checks that the idea landed, an expert one is
 * longer and goes after the edges of it. The count travels with the level, so
 * the two cannot drift apart.
 */
export const QUIZ_LEVELS = [
  { id: "easy", count: 3 },
  { id: "medium", count: 5 },
  { id: "hard", count: 6 },
  { id: "expert", count: 8 },
] as const;

export type QuickAction = {
  id: string;
  label: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function useQuickActions(): QuickAction[] {
  const { t } = useI18n();
  return [
    {
      id: "simpler",
      label: t((d) => d.doc.quickActions.simpler),
      icon: Lightbulb,
      prompt: t((d) => d.doc.quickActions.prompts.simpler),
    },
    {
      id: "example",
      label: t((d) => d.doc.quickActions.example),
      icon: BookOpen,
      prompt: t((d) => d.doc.quickActions.prompts.example),
    },
    {
      id: "revision",
      label: t((d) => d.doc.quickActions.revision),
      icon: ClipboardList,
      prompt: t((d) => d.doc.quickActions.prompts.revision),
    },
    {
      id: "quiz",
      label: t((d) => d.doc.quickActions.quiz),
      icon: ListChecks,
      prompt: t((d) => d.doc.quickActions.prompts.quiz),
    },
  ];
}

export function QuickActionsBar({
  onPick,
  disabled,
}: {
  onPick: (prompt: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const actions = useQuickActions();
  // The quiz is the one action that asks something back before it runs. It is
  // asked in place, on the row itself, rather than in a dialog: a question this
  // small does not deserve a screen of its own.
  const [askLevel, setAskLevel] = useState(false);

  const start = (level: (typeof QUIZ_LEVELS)[number]) => {
    setAskLevel(false);
    onPick(
      t((d) => d.doc.quickActions.prompts.quiz, {
        level: t((d) => d.doc.quickActions.difficulty[level.id]),
        count: level.count,
      }),
    );
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">
        {actions.map(({ id, label, icon: Icon, prompt }) => (
          <button
            key={id}
            onClick={() => (id === "quiz" ? setAskLevel((v) => !v) : onPick(prompt))}
            disabled={disabled}
            aria-expanded={id === "quiz" ? askLevel : undefined}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition disabled:opacity-50",
              id === "quiz" && askLevel
                ? "border-emerald/40 bg-emerald-soft text-emerald"
                : "border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-muted",
            ].join(" ")}
          >
            <Icon className={`h-3 w-3 ${id === "quiz" && askLevel ? "" : "text-emerald"}`} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {askLevel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE.out }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[12px] font-medium text-muted-foreground">
                {t((d) => d.doc.quickActions.difficulty.pick)}
              </span>
              {QUIZ_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => start(level)}
                  disabled={disabled}
                  className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground transition hover:border-emerald/40 hover:bg-emerald-soft hover:text-emerald disabled:opacity-50"
                >
                  {t((d) => d.doc.quickActions.difficulty[level.id])}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
